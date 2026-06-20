#include <SoftwareSerial.h>

/*
   ACCIDENT DETECTION SYSTEM
   Components:
   - Arduino Uno
   - HC-05 Bluetooth Module
   - SW-420 Vibration Sensor
*/

// ---------------- PIN DEFINITIONS ----------------

// SW-420 vibration sensor
const int vibrationPin = 2;

// HC-05 Bluetooth Pins
const int btRx = 10;   // Arduino receives from HC05 TX
const int btTx = 11;   // Arduino sends to HC05 RX

// ------------------------------------------------

// Create software serial objects
SoftwareSerial bluetooth(btRx, btTx);

void setup()
{
  // Serial Monitor
  Serial.begin(9600);

  // Bluetooth Serial
  bluetooth.begin(9600);

  // Sensor Pin
  pinMode(vibrationPin, INPUT);

  Serial.println("ACCIDENT DETECTION SYSTEM STARTED");

  bluetooth.println("Bluetooth Connected");
  bluetooth.println("System Ready");
}

void loop()
{
  // Read vibration sensor
  int vibrationState = digitalRead(vibrationPin);

  // If vibration detected
  if (vibrationState == HIGH)
  {
    Serial.println("VIBRATION DETECTED!");

    // Small delay to avoid false triggers
    delay(500);

    // Read again for confirmation
    vibrationState = digitalRead(vibrationPin);

    if (vibrationState == HIGH)
    {
      // Send the standard payload expected by the application
      Serial.println("ACCIDENT_DETECTED");
      bluetooth.println("ACCIDENT_DETECTED");

      // Prevent repeated alerts
      delay(10000);
    }
  }

  delay(100);
}
