const express = require('express');
const router = express.Router();
const Accident = require('../models/Accident');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { sendAccidentAlerts } = require('../services/notification');

// Haversine formula to calculate distance in km between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to dynamically generate mock hospitals as a fallback
function getMockHospitals(lat, lng) {
  const hospitalTemplates = [
    { name: 'City Emergency Hospital', prefix: 'West', suffix: 'Clinic', phone: '+1 (555) 019-2831' },
    { name: 'Metro Trauma Center', prefix: 'East', suffix: 'Medical', phone: '+1 (555) 014-9988' },
    { name: 'St. Jude General Hospital', prefix: 'North', suffix: 'Hospital', phone: '+1 (555) 017-3322' },
    { name: 'Grace Super Speciality Hospital', prefix: 'South', suffix: 'Trauma', phone: '+1 (555) 018-7744' },
    { name: 'Apex Multi-Speciality Clinic', prefix: 'Central', suffix: 'Emergency', phone: '+1 (555) 012-5566' }
  ];

  return hospitalTemplates.map((h, i) => {
    const angle = (i * 2 * Math.PI) / hospitalTemplates.length;
    const distance = 1.5 + (i * 1.8) + (Math.random() * 0.5); // 1.5km to 9.5km
    const latOffset = (distance / 111.32) * Math.sin(angle);
    const lngOffset = (distance / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.cos(angle);

    const hLat = lat + latOffset;
    const hLng = lng + lngOffset;

    return {
      name: h.name,
      distance: distance, // km
      address: `${Math.floor(100 + Math.random() * 800)} Medical Plaza Rd, Sector ${i + 3}, Emergency Zone`,
      contactNumber: h.phone,
      latitude: hLat,
      longitude: hLng
    };
  }).sort((a, b) => a.distance - b.distance);
}

// Helper to query real hospitals from OpenStreetMap Overpass API
async function getNearbyHospitals(lat, lng) {
  const instances = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.nchc.org.tw/api/interpreter'
  ];

  const radius = 10000; // 10 km search radius
  const query = `[out:json][timeout:10];
(
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
  relation["amenity"="hospital"](around:${radius},${lat},${lng});
);
out center;`;

  for (const baseUrl of instances) {
    try {
      console.log(`[Overpass API] Fetching from ${baseUrl} near lat: ${lat}, lng: ${lng}...`);
      const url = `${baseUrl}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'SmartRoadAccidentDetectionPrototype/1.0 (contact: test@example.com)'
        }
      });

      if (!response.ok) {
        console.warn(`[Overpass API] ${baseUrl} returned status ${response.status}`);
        continue; // Try next instance
      }

      const data = await response.json();
      if (!data || !data.elements) {
        console.warn(`[Overpass API] Invalid data format from ${baseUrl}`);
        continue;
      }

      if (data.elements.length === 0) {
        console.log(`[Overpass API] No elements returned from ${baseUrl}`);
        return getMockHospitals(lat, lng);
      }

      const hospitals = data.elements.map(el => {
        const hLat = el.lat || (el.center ? el.center.lat : lat);
        const hLng = el.lon || (el.center ? el.center.lon : lng);
        
        const distance = calculateDistance(lat, lng, hLat, hLng);

        const tags = el.tags || {};
        const name = tags.name || 'Emergency Medical Center';
        
        const addrStreet = tags['addr:street'] || '';
        const addrSuburb = tags['addr:suburb'] || tags['addr:neighbourhood'] || '';
        const addrCity = tags['addr:city'] || '';
        let address = '';
        if (addrStreet || addrSuburb || addrCity) {
          address = [addrStreet, addrSuburb, addrCity].filter(Boolean).join(', ');
        } else {
          address = `Near Coordinates: ${hLat.toFixed(4)}, ${hLng.toFixed(4)}`;
        }

        const phone = tags.phone || tags['contact:phone'] || 'Emergency Central';

        return {
          name,
          distance,
          address,
          contactNumber: phone,
          latitude: hLat,
          longitude: hLng
        };
      });

      const sortedHospitals = hospitals.sort((a, b) => a.distance - b.distance).slice(0, 5);
      console.log(`[Overpass API] Successfully fetched ${sortedHospitals.length} nearby hospitals from ${baseUrl}.`);
      return sortedHospitals;

    } catch (err) {
      console.warn(`[Overpass API] Error fetching from ${baseUrl}:`, err.message);
    }
  }

  console.log('[Overpass API] All instances failed or timed out. Falling back to mock hospitals.');
  return getMockHospitals(lat, lng);
}

// @route   POST /api/accident/report
// @desc    Report a new accident and trigger alerts
// @access  Private
router.post('/report', protect, async (req, res) => {
  try {
    const { latitude, longitude, timestamp } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and Longitude are required' });
    }

    // Get user and their details
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate nearby hospitals dynamically
    const hospitals = await getNearbyHospitals(Number(latitude), Number(longitude));

    // Create accident document
    const accident = new Accident({
      user: user._id,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      alertStatus: 'Pending',
      notifiedContacts: [
        {
          name: user.emergencyContacts && user.emergencyContacts.length > 0 ? user.emergencyContacts[0].name : (user.primaryContact ? user.primaryContact.name : ''),
          mobileNumber: user.emergencyContacts && user.emergencyContacts.length > 0 ? user.emergencyContacts[0].mobileNumber : (user.primaryContact ? user.primaryContact.mobileNumber : ''),
          notifiedVia: ['email', 'sms', 'whatsapp'],
          status: 'Sent'
        }
      ],
      notifiedHospitals: hospitals.map(h => ({
        name: h.name,
        distance: h.distance,
        address: h.address,
        contactNumber: h.contactNumber,
        status: 'Sent'
      }))
    });

    // Send notifications via Email, SMS, WhatsApp
    const logs = await sendAccidentAlerts(accident, user);
    
    // Add logs and update status
    accident.logs = logs;
    accident.alertStatus = 'Sent';
    await accident.save();

    res.status(201).json({
      success: true,
      message: 'Accident reported successfully and emergency contacts notified.',
      accident
    });
  } catch (error) {
    console.error('Error reporting accident:', error);
    res.status(500).json({ success: false, message: 'Server error reporting accident', error: error.message });
  }
});

// @route   GET /api/accident/history
// @desc    Get user's accident history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Accident.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving history' });
  }
});

// @route   GET /api/accident/admin/all
// @desc    Get all accidents (Admin only)
// @access  Private/Admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const accidents = await Accident.find({})
      .populate('user', 'fullName vehicleNumber mobileNumber email bloodGroup')
      .sort({ timestamp: -1 });
    res.json({ success: true, accidents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving accidents' });
  }
});

// @route   GET /api/accident/admin/stats
// @desc    Get system statistics (Admin only)
// @access  Private/Admin
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAccidents = await Accident.countDocuments({});
    
    // Calculate total alerts sent across all logs in database
    const allAccidents = await Accident.find({});
    let totalAlertsSent = 0;
    let hospitalNotifications = 0;

    allAccidents.forEach(acc => {
      // Sum the number of logs that are emails, sms, or whatsapp
      totalAlertsSent += acc.logs.length;
      hospitalNotifications += acc.notifiedHospitals.length;
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAccidents,
        totalAlertsSent,
        hospitalNotifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error calculating stats' });
  }
});

// @route   GET /api/accident/:id
// @desc    Get accident details by ID (Public for emergency access)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const accident = await Accident.findById(req.params.id)
      .populate('user', 'fullName vehicleNumber mobileNumber email bloodGroup emergencyContacts')
      
    if (!accident) {
      return res.status(404).json({ success: false, message: 'Accident report not found' });
    }
    
    res.json({ success: true, accident });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving accident details' });
  }
});

module.exports = router;
