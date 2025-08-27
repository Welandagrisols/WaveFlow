
import { NativeModules, NativeEventEmitter, PermissionsAndroid } from 'react-native';
import { MpesaSmsParser } from '../server/smsParser';

class SmsListener {
  constructor() {
    this.eventEmitter = new NativeEventEmitter(NativeModules.SmsListener);
    this.isListening = false;
  }

  async requestPermissions() {
    try {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ]);

      return (
        permissions['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
        permissions['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      return false;
    }
  }

  async startListening() {
    const hasPermissions = await this.requestPermissions();
    
    if (!hasPermissions) {
      throw new Error('SMS permissions not granted');
    }

    if (this.isListening) return;

    this.smsListener = this.eventEmitter.addListener('sms_received', (sms) => {
      this.handleIncomingSms(sms);
    });

    NativeModules.SmsListener.startListening();
    this.isListening = true;
    console.log('SMS listener started - will auto-detect M-Pesa transactions');
  }

  stopListening() {
    if (this.smsListener) {
      this.smsListener.remove();
    }
    
    if (NativeModules.SmsListener.stopListening) {
      NativeModules.SmsListener.stopListening();
    }
    
    this.isListening = false;
    console.log('SMS listener stopped');
  }

  handleIncomingSms(sms) {
    const { address, body, timestamp } = sms;
    
    // Check if this is an M-Pesa SMS
    if (!this.isMpesaSms(address, body)) {
      return; // Ignore non-M-Pesa SMS
    }

    console.log('M-Pesa SMS detected:', { address, body });

    // Use your existing parser to process the SMS
    const parsedTransaction = MpesaSmsParser.parseSms(body);
    
    if (parsedTransaction.isValid) {
      // Auto-detect SIM card and account type
      const detectedSim = MpesaSmsParser.detectSimCard(address, body);
      const accountType = MpesaSmsParser.classifyAccountType(
        parsedTransaction.recipientName, 
        parsedTransaction.amount
      );

      // Create the transaction record automatically
      this.createAutoTransaction({
        smsText: body,
        senderNumber: address,
        simCard: detectedSim,
        accountType,
        parsedData: parsedTransaction,
        timestamp: new Date(timestamp)
      });

      // Show notification for quick confirmation
      this.showTransactionNotification(parsedTransaction, detectedSim);
    }
  }

  isMpesaSms(address, body) {
    // Check if SMS is from M-Pesa
    const mpesaSenders = ['MPESA', 'M-PESA', 'Safaricom'];
    const bodyLower = body.toLowerCase();
    
    return (
      mpesaSenders.some(sender => address.includes(sender)) ||
      bodyLower.includes('ksh') ||
      bodyLower.includes('m-pesa') ||
      bodyLower.includes('mpesa') ||
      bodyLower.includes('confirmed')
    );
  }

  async createAutoTransaction(transactionData) {
    try {
      // Call your existing API to create the SMS transaction
      const response = await fetch('/api/sms-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smsText: transactionData.smsText,
          senderNumber: transactionData.senderNumber,
          simCard: transactionData.simCard,
        }),
      });

      const result = await response.json();
      console.log('Auto-created transaction:', result);
      
      return result;
    } catch (error) {
      console.error('Failed to auto-create transaction:', error);
    }
  }

  showTransactionNotification(parsedData, simCard) {
    // Show local notification for instant user awareness
    if (NativeModules.NotificationManager) {
      NativeModules.NotificationManager.showNotification({
        title: `New ${simCard} Transaction`,
        message: `KES ${parsedData.amount.toLocaleString()} ${parsedData.transactionType.toLowerCase()} - Tap to confirm`,
        data: {
          transactionCode: parsedData.transactionCode,
          amount: parsedData.amount,
          recipient: parsedData.recipientName,
        },
      });
    }
  }
}

export default new SmsListener();
