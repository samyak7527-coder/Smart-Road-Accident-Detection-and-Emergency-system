import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bluetooth, Navigation, AlertTriangle, Phone, ShieldCheck, Heart, User, Send, X } from 'lucide-react';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Connection & Location States
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState('Not Connected');
  const [gpsActive, setGpsActive] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [gpsError, setGpsError] = useState('');

  // Accident Trigger Workflow States
  const [accidentTriggered, setAccidentTriggered] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [reportingStatus, setReportingStatus] = useState(''); // 'Reporting...', 'Sent', 'Error'

  // Refs for serial port and timers
  const serialPortRef = useRef(null);
  const serialReaderRef = useRef(null);
  const serialReadLoopActiveRef = useRef(false);
  const countdownIntervalRef = useRef(null);
  const audioContextRef = useRef(null);
  const beepIntervalRef = useRef(null);

  // 1. Browser GPS Tracking
  const startGpsTracking = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsActive(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsError('');
      },
      (err) => {
        console.error('Error fetching GPS:', err);
        setGpsError('GPS Access Denied or Timed Out.');
        setGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    startGpsTracking();
    // Auto-update GPS position every 30 seconds
    const gpsTimer = setInterval(startGpsTracking, 30000);
    return () => {
      clearInterval(gpsTimer);
      clearInterval(countdownIntervalRef.current);
      stopAlarmBeeps();
      // Close serial port on unmount
      handleDisconnectSerial();
    };
  }, []);

  // 2. Synthesized Alarm Sound using Web Audio API
  const playAlarmBeep = (secondsRemaining) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Synthesize deep notification beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Pitch goes up as countdown nears 0
      osc.frequency.setValueAtTime(600 + (10 - secondsRemaining) * 40, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (err) {
      console.log('Web Audio not allowed or failed:', err);
    }
  };

  const startAlarmBeeps = () => {
    // Beep every second initially
    playAlarmBeep(10);
    let counter = 9;
    beepIntervalRef.current = setInterval(() => {
      if (counter >= 0) {
        playAlarmBeep(counter);
        counter--;
      } else {
        stopAlarmBeeps();
      }
    }, 1000);
  };

  const stopAlarmBeeps = () => {
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }
  };

  // 3. Web Serial API Connection (for Arduino USB or HC-05 Bluetooth SPP)
  //    - USB: Arduino plugged in via USB cable creates a direct COM port
  //    - Bluetooth: HC-05 paired via Windows Bluetooth Settings creates a virtual COM port
  //    Both appear as COM ports; Web Serial API connects at 9600 baud.
  const handleConnectBluetooth = async () => {
    try {
      // Check browser support
      if (!('serial' in navigator)) {
        alert('Web Serial API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
        return;
      }

      // Cleanly disconnect any existing port first
      if (serialPortRef.current) {
        setBluetoothDeviceName('Closing previous connection...');
        try {
          serialReadLoopActiveRef.current = false;
          if (serialReaderRef.current) {
            await serialReaderRef.current.cancel();
            serialReaderRef.current = null;
          }
          await serialPortRef.current.close();
          serialPortRef.current = null;
        } catch (closeErr) {
          console.warn('[Serial] Error closing previous port:', closeErr);
        }
        // Brief delay to let the OS release the port
        await new Promise(r => setTimeout(r, 500));
      }

      setBluetoothDeviceName('Requesting port...');
      
      // Prompt user to select the COM port (USB or Bluetooth)
      const port = await navigator.serial.requestPort();
      
      setBluetoothDeviceName('Opening serial port...');
      
      // Try to open the port, with one retry if it fails
      // (handles cases where the port wasn't fully released yet)
      let opened = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await port.open({ baudRate: 9600 });
          opened = true;
          break;
        } catch (openErr) {
          console.warn(`[Serial] Open attempt ${attempt} failed:`, openErr.message);
          if (attempt === 1) {
            // The port might still be held by a previous tab/page reload.
            // Try closing it first, then wait and retry.
            try { await port.close(); } catch (_) { /* may not be open */ }
            setBluetoothDeviceName('Retrying connection...');
            await new Promise(r => setTimeout(r, 1000));
          } else {
            throw openErr; // second attempt failed, propagate error
          }
        }
      }
      
      if (!opened) return;

      serialPortRef.current = port;
      setBluetoothConnected(true);
      setBluetoothDeviceName('Arduino (USB Serial)');
      
      console.log('[Serial] Connected to Arduino via Web Serial API');

      // Start reading data from the serial port in a loop
      serialReadLoopActiveRef.current = true;
      readSerialLoop(port);

    } catch (error) {
      console.error('Serial connection failed:', error);
      setBluetoothConnected(false);

      if (error.name === 'NotFoundError') {
        setBluetoothDeviceName('No port selected');
      } else {
        setBluetoothDeviceName('Connection Failed');
        const msg = error.message || 'Unknown error';
        alert(
          `Serial Connection Error: ${msg}.\n\n` +
          `Troubleshooting Steps:\n` +
          `1. Close Arduino IDE Serial Monitor (it locks the port)\n` +
          `2. Make sure the USB cable is a data cable (not charge-only)\n` +
          `3. Check Device Manager → Ports to find the right COM port\n` +
          `4. Close any other browser tabs connected to this port\n` +
          `5. Unplug and re-plug the Arduino, then try again`
        );
      }
    }
  };

  // Continuously read incoming serial data line-by-line
  const readSerialLoop = async (port) => {
    const decoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    serialReaderRef.current = reader;

    let buffer = '';

    try {
      while (serialReadLoopActiveRef.current) {
        const { value, done } = await reader.read();
        if (done) break;

        // Accumulate chunks and process complete lines
        buffer += value;
        const lines = buffer.split('\n');
        // Keep last incomplete chunk in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          console.log(`[Serial Data] Received: ${trimmed}`);

          if (trimmed.includes('ACCIDENT_DETECTED')) {
            triggerAccidentWorkflow();
          }
        }
      }
    } catch (error) {
      if (serialReadLoopActiveRef.current) {
        console.error('[Serial] Read error:', error);
      }
    } finally {
      reader.releaseLock();
    }
  };

  const handleDisconnectSerial = async () => {
    serialReadLoopActiveRef.current = false;

    try {
      if (serialReaderRef.current) {
        await serialReaderRef.current.cancel();
        serialReaderRef.current = null;
      }
    } catch (e) { /* ignore */ }

    try {
      if (serialPortRef.current) {
        await serialPortRef.current.close();
        serialPortRef.current = null;
      }
    } catch (e) { /* ignore */ }

    setBluetoothConnected(false);
    setBluetoothDeviceName('Not Connected');
  };

  // 5. Accident Alert Workflow
  const triggerAccidentWorkflow = () => {
    if (accidentTriggered) return; // Prevent double alerts
    
    setAccidentTriggered(true);
    setCountdown(10);
    setReportingStatus('');
    startAlarmBeeps();

    // Start 10 seconds countdown
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          stopAlarmBeeps();
          sendAccidentAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cancel Accident Alert
  const handleCancelAlert = () => {
    clearInterval(countdownIntervalRef.current);
    stopAlarmBeeps();
    setAccidentTriggered(false);
    console.log('🚨 Accident alert cancelled by driver.');
  };

  // Skip countdown and dispatch now
  const handleSendNow = () => {
    clearInterval(countdownIntervalRef.current);
    stopAlarmBeeps();
    sendAccidentAlert();
  };

  // Save and Dispatch Accident Report to backend
  const sendAccidentAlert = async () => {
    setReportingStatus('Reporting...');
    
    // Fetch high accuracy GPS location immediately
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const payload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };

        try {
          const res = await fetch('/api/accident/report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (data.success) {
            setReportingStatus('Sent');
            // Navigate to live tracking screen after 2.5 seconds
            setTimeout(() => {
              setAccidentTriggered(false);
              navigate(`/live/${data.accident._id}`);
            }, 2500);
          } else {
            setReportingStatus('Error');
          }
        } catch (err) {
          setReportingStatus('Error');
        }
      },
      async (err) => {
        console.error('Failed to get precise GPS during crash, using latest values:', err);
        // Fallback to latest known cache coordinates or default dummy values if completely blocked
        const lat = coordinates.lat || 40.7128;
        const lng = coordinates.lng || -74.0060;

        const payload = {
          latitude: lat,
          longitude: lng,
          timestamp: new Date().toISOString()
        };

        try {
          const res = await fetch('/api/accident/report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (data.success) {
            setReportingStatus('Sent');
            setTimeout(() => {
              setAccidentTriggered(false);
              navigate(`/live/${data.accident._id}`);
            }, 2500);
          } else {
            setReportingStatus('Error');
          }
        } catch (postErr) {
          setReportingStatus('Error');
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      
      {/* 10-second Warning Countdown Popup Overlay */}
      {accidentTriggered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/95 backdrop-blur-md px-4">
          <div className="max-w-lg w-full bg-brand-navy p-8 rounded-3xl border border-brand-red/30 shadow-2xl text-center space-y-6 relative overflow-hidden animate-[pulse_2s_infinite]">
            
            {/* Top decorative emergency signal bar */}
            <div className="absolute top-0 inset-x-0 h-2 bg-brand-red animate-pulse" />

            <div className="mx-auto h-20 w-20 bg-brand-red/20 rounded-full flex items-center justify-center text-brand-red animate-ping-slow mb-2">
              <AlertTriangle size={48} />
            </div>

            <h2 className="text-3xl font-black text-white uppercase tracking-wider font-sans">
              Accident Detected!
            </h2>
            
            <p className="text-white/80 text-sm leading-relaxed max-w-md mx-auto">
              Severe vibration triggered on driver module. An automatic emergency dispatch broadcast will transmit in:
            </p>

            {/* Glowing Big Countdown Timer */}
            <div className="flex items-center justify-center">
              <div className="h-28 w-28 bg-brand-red rounded-full flex items-center justify-center text-white text-5xl font-black shadow-lg shadow-brand-red/40 border border-white/20 animate-scaleUp">
                {countdown}
              </div>
            </div>

            {/* Status indicators */}
            {reportingStatus && (
              <div className={`mt-2 font-semibold text-sm ${reportingStatus === 'Sent' ? 'text-emerald-400' : reportingStatus === 'Error' ? 'text-brand-red' : 'text-brand-accent animate-pulse'}`}>
                {reportingStatus === 'Reporting...' && 'Obtaining High-Precision Coordinates & Dispatching Alerts...'}
                {reportingStatus === 'Sent' && '⚠️ Alert Confirmed! Dispatch Sent! Redirecting to Map...'}
                {reportingStatus === 'Error' && '⚠️ Server Error Dispatching. Retry.'}
              </div>
            )}

            {/* User Interaction Controls */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
              <button
                onClick={handleCancelAlert}
                disabled={reportingStatus === 'Sent'}
                className="flex-1 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> Cancel Alert
              </button>
              
              <button
                onClick={handleSendNow}
                disabled={reportingStatus === 'Sent'}
                className="flex-1 py-4 bg-brand-red hover:bg-brand-crimson text-white font-bold rounded-xl transition-all shadow-md shadow-brand-red/20 flex items-center justify-center gap-2"
              >
                <Send size={18} /> Send Now
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Page Layout */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">Driver Dashboard</h1>
        <p className="text-sm text-brand-blue font-light">
          Monitor hardware diagnostics, verify GPS positioning, and manage emergency metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Connection Center & Emergency Controls */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Diagnostic Panels (Bluetooth and GPS cards side by side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Bluetooth Hardware Panel */}
            <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-brand-navy/10 text-brand-navy rounded-xl">
                    <Bluetooth size={22} />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bluetoothConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-brand-red/5 text-brand-red border border-brand-red/10'}`}>
                    <span className={`h-2 w-2 rounded-full ${bluetoothConnected ? 'bg-emerald-500 animate-pulse' : 'bg-brand-red'}`} />
                    {bluetoothConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-brand-dark mb-1">Arduino Connection</h3>
                <p className="text-xs text-brand-blue mb-4">Connects via USB serial or HC-05 Bluetooth.</p>
              </div>

              <div className="space-y-3 mt-4">
                <div className="bg-brand-light px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-brand-blue">
                  <span>Device Name:</span>
                  <span className="font-semibold text-brand-dark">{bluetoothDeviceName}</span>
                </div>

                {bluetoothConnected ? (
                  <button
                    onClick={handleDisconnectSerial}
                    className="w-full py-3 border border-brand-red/20 text-brand-red hover:bg-brand-red/5 text-sm font-semibold rounded-xl transition-all"
                  >
                    Disconnect Device
                  </button>
                ) : (
                  <button
                    onClick={handleConnectBluetooth}
                    className="w-full py-3 bg-brand-navy hover:bg-brand-dark text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-navy/10"
                  >
                    <Bluetooth size={16} /> Connect Device
                  </button>
                )}
              </div>
            </div>

            {/* Geolocation/GPS Panel */}
            <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-brand-navy/10 text-brand-navy rounded-xl">
                    <Navigation size={22} />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${gpsActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-brand-red/5 text-brand-red border border-brand-red/10'}`}>
                    <span className={`h-2 w-2 rounded-full ${gpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-brand-red'}`} />
                    {gpsActive ? 'GPS Active' : 'GPS Offline'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-brand-dark mb-1">Browser Geolocation</h3>
                <p className="text-xs text-brand-blue mb-4">Pulls driver hardware GPS values.</p>
              </div>

              <div className="space-y-3 mt-4">
                <div className="bg-brand-light p-3 rounded-xl space-y-1.5 text-xs text-brand-blue">
                  <div className="flex justify-between">
                    <span>Latitude:</span>
                    <span className="font-semibold text-brand-dark">{coordinates.lat ? coordinates.lat.toFixed(5) : 'Calculating...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude:</span>
                    <span className="font-semibold text-brand-dark">{coordinates.lng ? coordinates.lng.toFixed(5) : 'Calculating...'}</span>
                  </div>
                </div>

                {gpsError && (
                  <p className="text-[10px] text-brand-red text-center">{gpsError}</p>
                )}

                <button
                  onClick={startGpsTracking}
                  className="w-full py-3 border border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 text-sm font-semibold rounded-xl transition-all"
                >
                  Force GPS Sync
                </button>
              </div>
            </div>

          </div>

          {/* SIMULATION TEST BENCH CARD */}
          <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-2xl shadow-md border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-red/20 text-brand-red text-[10px] font-bold uppercase tracking-wider">
                Prototype Testbench
              </span>
              <h3 className="text-xl font-extrabold font-sans">Simulate Arduino Crash Pulse</h3>
              <p className="text-sm text-white/70 max-w-xl font-light">
                Do not have Arduino hardware on hand? Click the trigger below to bypass HC-05 signals and launch the 10-second hazard alert workflow, email notification layer, and nearest hospital finder.
              </p>
              
              <button
                onClick={triggerAccidentWorkflow}
                className="py-3 px-6 bg-brand-red hover:bg-brand-crimson text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-red/20 inline-flex items-center gap-1.5"
              >
                <AlertTriangle size={16} /> Simulate Crash Trigger (Vibration Pulse)
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: User Profile Overview & Contacts Checklist */}
        <div className="space-y-8">
          
          {/* Driver Details Snapshot */}
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-brand-dark border-b border-brand-navy/5 pb-2 mb-4 flex items-center gap-1.5">
              <User size={16} className="text-brand-navy" /> Driver Credentials
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-brand-light">
                <span className="text-brand-blue font-light text-xs">Driver Name</span>
                <span className="font-semibold text-brand-dark">{user.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-light">
                <span className="text-brand-blue font-light text-xs">Vehicle Plate</span>
                <span className="font-semibold text-brand-dark uppercase text-brand-navy">{user.vehicleNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-light">
                <span className="text-brand-blue font-light text-xs">Mobile Phone</span>
                <span className="font-semibold text-brand-dark">{user.mobileNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-brand-light">
                <span className="text-brand-blue font-light text-xs">Blood Type</span>
                <span className="font-semibold text-brand-red flex items-center gap-1"><Heart size={14} className="fill-brand-red" /> {user.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact snapshot */}
          <div className="bg-white p-6 rounded-2xl border border-brand-navy/5 shadow-sm space-y-4">
            <h3 className="text-md font-bold text-brand-dark border-b border-brand-navy/5 pb-2 mb-4 flex items-center gap-1.5">
              <Phone size={16} className="text-brand-navy" /> Dispatch Contacts
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-brand-light rounded-xl space-y-2 border border-brand-navy/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-dark text-sm">{user.emergencyContacts?.[0]?.name || 'No Contact Set'}</span>
                  <span className="px-2 py-0.5 bg-brand-navy/10 text-brand-navy rounded-full text-[10px] font-semibold">{user.emergencyContacts?.[0]?.relationship}</span>
                </div>
                <div className="text-xs text-brand-blue space-y-1">
                  <p>Mobile: <span className="font-semibold text-brand-dark">{user.emergencyContacts?.[0]?.mobileNumber || 'None Added'}</span></p>
                  <p>Email: <span className="font-semibold text-brand-dark">{user.emergencyContacts?.[0]?.email || 'None Added'}</span></p>
                </div>
              </div>

              <div className="flex gap-2 p-3 bg-brand-accent/10 border border-brand-accent/20 rounded-xl items-start">
                <ShieldCheck size={18} className="text-brand-blue shrink-0 mt-0.5" />
                <p className="text-[10px] text-brand-blue leading-relaxed">
                  Both your contact, hospital trauma desks, and dispatch dispatchers will receive Google Maps coordinates on crash confirmation. Keep profile contacts accurate.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
