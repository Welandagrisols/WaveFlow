
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert, AppState } from 'react-native';
import SmsListener from './android/SmsListener';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import your existing components
import Dashboard from './client/src/pages/dashboard';
import SmsConfirmation from './client/src/pages/sms-confirmation';
import Transactions from './client/src/pages/transactions';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Start SMS listening when app launches
    initializeSmsListener();

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - restart SMS listener
        SmsListener.startListening();
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background - keep SMS listener running
        // (SMS listener should continue in background)
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState]);

  const initializeSmsListener = async () => {
    try {
      await SmsListener.startListening();
      console.log('✅ Yasinga is now monitoring M-Pesa SMS automatically!');
      
      // Show user confirmation
      Alert.alert(
        'Auto-Detection Active',
        'Yasinga will now automatically detect M-Pesa transactions when SMS arrives!',
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      console.error('Failed to start SMS listener:', error);
      Alert.alert(
        'Permission Required',
        'Please grant SMS permissions to enable automatic transaction detection.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: initializeSmsListener }
        ]
      );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen 
            name="Dashboard" 
            component={Dashboard}
            options={{ title: 'Yasinga - Smart M-Pesa Tracker' }}
          />
          <Stack.Screen 
            name="SmsConfirmation" 
            component={SmsConfirmation}
            options={{ title: 'Confirm Transactions' }}
          />
          <Stack.Screen 
            name="Transactions" 
            component={Transactions}
            options={{ title: 'Transaction History' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
