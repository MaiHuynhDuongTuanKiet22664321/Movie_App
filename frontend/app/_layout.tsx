import { UserProvider, useUser } from '@/frontend/context/UserContext';
import TabNavigator from '@/frontend/navigators/TabNavigator';
import AuthScreen from '@/frontend/screens/AuthScreen';
import EditProfileScreen from '@/frontend/screens/EditProfileScreen';
import MovieDetailScreen from '@/frontend/screens/MovieDetailScreen';
import MovieScheduleScreen_AD from '@/frontend/screens/MovieScheduleScreen_AD';
import MovieScheduleSetupScreen_AD from '@/frontend/screens/MovieScheduleSetupScreen_AD';
import PaymentScreen from '@/frontend/screens/PaymentScreen';
import SeatBookingScreen from '@/frontend/screens/SeatBookingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import Toast from 'react-native-toast-message';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useUser();

  // Show loading while checking auth state
  if (loading) {
    return null; // Or return a loading screen
  }

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }} 
      initialRouteName={user ? 'Tab' : 'Auth'}
    >
      <Stack.Screen
        name="Tab"
        component={TabNavigator}
        options={{ animation: "default" }}
      />
      <Stack.Screen
        name="MovieDetails"
        component={MovieDetailScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="MovieScheduleScreen_AD"
        component={MovieScheduleScreen_AD}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="MovieScheduleSetupScreen_AD"
        component={MovieScheduleSetupScreen_AD}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="SeatBooking"
        component={SeatBookingScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};

const Tablayout = () => {
  return (
    <UserProvider>
      <AppNavigator />
      <Toast />
    </UserProvider>
  );
};

export default Tablayout;
