
package com.yasinga.app;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {
    private static final int SMS_PERMISSION_REQUEST = 1;
    private SmsReceiver smsReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize SMS receiver
        smsReceiver = new SmsReceiver();
        
        // Request SMS permissions
        requestSmsPermissions();
    }

    private void requestSmsPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) 
            != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) 
            != PackageManager.PERMISSION_GRANTED) {
            
            ActivityCompat.requestPermissions(this,
                new String[]{
                    Manifest.permission.RECEIVE_SMS,
                    Manifest.permission.READ_SMS
                },
                SMS_PERMISSION_REQUEST);
        } else {
            startSmsListening();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == SMS_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startSmsListening();
            }
        }
    }

    private void startSmsListening() {
        IntentFilter filter = new IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION);
        filter.setPriority(1000); // High priority to catch SMS quickly
        registerReceiver(smsReceiver, filter);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (smsReceiver != null) {
            unregisterReceiver(smsReceiver);
        }
    }

    // SMS Receiver Class
    public class SmsReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) {
                Bundle bundle = intent.getExtras();
                if (bundle != null) {
                    Object[] smsObjects = (Object[]) bundle.get("pdus");
                    if (smsObjects != null) {
                        for (Object smsObject : smsObjects) {
                            SmsMessage sms = SmsMessage.createFromPdu((byte[]) smsObject);
                            
                            String sender = sms.getDisplayOriginatingAddress();
                            String messageBody = sms.getDisplayMessageBody();
                            long timestamp = sms.getTimestampMillis();
                            
                            // Check if this is M-Pesa SMS
                            if (isMpesaSms(sender, messageBody)) {
                                // Send to React Native
                                sendSmsToReactNative(sender, messageBody, timestamp);
                            }
                        }
                    }
                }
            }
        }

        private boolean isMpesaSms(String sender, String messageBody) {
            return (sender != null && (sender.contains("MPESA") || sender.contains("M-PESA"))) ||
                   (messageBody != null && (messageBody.toLowerCase().contains("ksh") || 
                    messageBody.toLowerCase().contains("m-pesa") ||
                    messageBody.toLowerCase().contains("confirmed")));
        }

        private void sendSmsToReactNative(String sender, String messageBody, long timestamp) {
            WritableMap params = Arguments.createMap();
            params.putString("address", sender);
            params.putString("body", messageBody);
            params.putDouble("timestamp", timestamp);
            
            // Send event to React Native
            ReactApplicationContext reactContext = getReactNativeHost()
                .getReactInstanceManager()
                .getCurrentReactContext();
                
            if (reactContext != null) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("sms_received", params);
            }
        }
    }

    @Override
    protected String getMainComponentName() {
        return "Yasinga";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(this, getMainComponentName());
    }
}
