const nodemailer = require('nodemailer');
const twilio = require('twilio');

/**
 * Configure Nodemailer Transporter
 * Using Gmail as standard prototype or customizable SMTP
 */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // Check if credentials are placeholders
  if (!user || user === 'accidentalertsystem@gmail.com' || !pass || pass === 'your_app_password') {
    console.log('--- EMAIL CONFIGURATION IS IN PROTOTYPE MODE ---');
    console.log('To send real emails, update EMAIL_USER and EMAIL_PASS in your backend/.env file.');
    return null;
  }

  // Auto-detect service from email domain
  const domain = user.split('@')[1]?.toLowerCase() || '';

  if (domain.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  } else if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
    return nodemailer.createTransport({
      service: 'hotmail',
      auth: { user, pass }
    });
  } else if (domain.includes('yahoo')) {
    return nodemailer.createTransport({
      service: 'yahoo',
      auth: { user, pass }
    });
  } else {
    // Generic SMTP fallback for college/corporate emails (e.g., vit.edu)
    // Uses SMTP with STARTTLS on port 587
    return nodemailer.createTransport({
      host: `smtp.${domain}`,
      port: 587,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }
};

/**
 * Sends accident alerts via Email (real/simulated), SMS (simulated), and WhatsApp (simulated)
 * @param {Object} accident - Mongoose Accident Document
 * @param {Object} user - User Document (accident victim)
 * @returns {Promise<Object>} Array of notifications log entries
 */
const sendAccidentAlerts = async (accident, user) => {
  const logs = [];
  const googleMapsLink = `https://maps.google.com/?q=${accident.latitude},${accident.longitude}`;
  const timestampStr = new Date(accident.timestamp).toLocaleString();

  const emailBody = `
ACCIDENT ALERT

A vehicle accident has been detected.

User Name: ${user.fullName}
Vehicle Number: ${user.vehicleNumber}
Blood Group: ${user.bloodGroup}

Location:
${googleMapsLink} (Latitude: ${accident.latitude}, Longitude: ${accident.longitude})

Immediate assistance may be required.

Timestamp:
${timestampStr}
  `;

  // 1. PROCESS EMAIL NOTIFICATION
  // Gather all contacts (use array if present, otherwise fallback to primary contact)
  const contacts = (user.emergencyContacts && user.emergencyContacts.length > 0)
    ? user.emergencyContacts
    : [{
        name: user.primaryContact?.name || user.fullName,
        email: user.primaryContact?.email || user.email,
        mobileNumber: user.primaryContact?.mobileNumber || user.mobileNumber
      }];
  
  const transporter = createTransporter();

  for (const contact of contacts) {
    const contactEmail = contact.email;
    const contactName = contact.name;

    if (transporter && contactEmail) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: contactEmail,
          subject: `⚠️ ACCIDENT DETECTED: ${user.fullName} - ${user.vehicleNumber}`,
          text: emailBody
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email Alert] Successfully sent to emergency contact (${contactEmail})`);
        logs.push({
          type: 'email',
          recipient: contactEmail,
          message: emailBody,
          status: 'success'
        });
      } catch (error) {
        console.error('[Email Alert Error] Failed to send email:', error.message);
        logs.push({
          type: 'email',
          recipient: contactEmail,
          message: `FAILED: ${error.message}\n\nOriginal Message:\n${emailBody}`,
          status: 'failed'
        });
      }
    } else {
      // Simulated Email Log
      console.log(`[Simulated Email Alert] To: ${contactName} <${contactEmail || 'no email'}>`);
      console.log(`[Simulated Email Body]:\n${emailBody}`);
      logs.push({
        type: 'email',
        recipient: contactEmail || contactName,
        message: `[SIMULATED EMAIL]\n${emailBody}`,
        status: 'simulated'
      });
    }
  }

  // 2. PROCESS SMS NOTIFICATION (Twilio Integration)
  const smsBody = `ACCIDENT ALERT: A crash was detected for ${user.fullName} (${user.vehicleNumber}). Loc: ${googleMapsLink}. Assistance needed immediately.`;
  // For SMS we will send to each contact's mobileNumber
  const smsContacts = contacts.map(c => c.mobileNumber).filter(Boolean);

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioAuth && twilioPhone && twilioSid !== 'your_twilio_account_sid') {
    try {
      const client = twilio(twilioSid, twilioAuth);
      // Send a separate SMS for each contact
      for (const toNumber of smsContacts) {
        await client.messages.create({
          body: smsBody,
          from: twilioPhone,
          to: toNumber
        });
        console.log(`[SMS Alert] Successfully sent real SMS to ${toNumber}`);
        logs.push({
          type: 'sms',
          recipient: toNumber,
          message: smsBody,
          status: 'success'
        });
      }
    } catch (error) {
      console.error('[SMS Alert Error] Failed to send real SMS:', error.message);
      logs.push({
        type: 'sms',
        recipient: 'unknown',
        message: `FAILED: ${error.message}\n\nOriginal Message: ${smsBody}`,
        status: 'failed'
      });
    }
  } else {
    // Simulated SMS for each contact
    for (const toNumber of smsContacts) {
      console.log(`[Simulated SMS Alert] To: ${toNumber}`);
      console.log(`[Simulated SMS Body]: ${smsBody}`);
      logs.push({
        type: 'sms',
        recipient: toNumber,
        message: smsBody,
        status: 'simulated'
      });
    }
  }

  // 3. PROCESS WHATSAPP NOTIFICATION (Prototype Layer - ready for WhatsApp API integration)
  const whatsappBody = `*⚠️ ACCIDENT ALERT*\n\nA vehicle crash has been detected.\n\n*Driver*: ${user.fullName}\n*Vehicle*: ${user.vehicleNumber}\n*Location*: ${googleMapsLink}\n\nImmediate assistance may be required.`;

  // Simulated WhatsApp for each contact
  for (const contact of contacts) {
    const toNumber = contact.mobileNumber;
    console.log(`[Simulated WhatsApp Alert] To: ${toNumber}`);
    console.log(`[Simulated WhatsApp Body]:\n${whatsappBody}`);
    logs.push({
      type: 'whatsapp',
      recipient: toNumber,
      message: whatsappBody,
      status: 'simulated'
    });
  }

  // 4. NOTIFY HOSPITALS (Simulated emails or SMS logs if hospital contacts were provided)
  if (accident.notifiedHospitals && accident.notifiedHospitals.length > 0) {
    accident.notifiedHospitals.forEach(hospital => {
      const hospitalMsg = `⚠️ HOSPITAL DISPATCH ALERT: Accident nearby (dist: ${hospital.distance.toFixed(2)} km). Driver: ${user.fullName}. Vehicle: ${user.vehicleNumber}. Location: ${googleMapsLink}. Immediate emergency dispatch required.`;
      console.log(`[Simulated Hospital Alert] To: ${hospital.name} (${hospital.contactNumber || 'No Contact'})`);
      logs.push({
        type: 'system',
        recipient: hospital.name,
        message: hospitalMsg,
        status: 'simulated'
      });
    });
  }

  return logs;
};

module.exports = {
  sendAccidentAlerts
};
