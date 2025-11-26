import { UserProvider, useUser } from '../src/context/UserContext';
import TabNavigator from '../src/navigators/TabNavigator';
import AuthScreen from '../src/screens/auth/AuthScreen';
import EditProfileScreen from '../src/screens/profile/EditProfileScreen';
import MovieDetailScreen from '../src/screens/user/MovieDetailScreen';
import MovieScheduleScreen from '../src/screens/user/MovieScheduleScreen';
import PaymentScreen from '../src/screens/user/PaymentScreen';
import SeatBookingScreen from '../src/screens/user/SeatBookingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminMovieManagementScreen from '../src/screens/admin/AdminMovieManagementScreen';
import AdminAddMovieScreen from '../src/screens/admin/AdminAddMovieScreen';
import AdminAddRoomScreen from '../src/screens/admin/AdminAddRoomScreen';
import AdminRoomManagementScreen from '../src/screens/admin/AdminRoomManagementScreen';
import AdminCreateScheduleScreen from '../src/screens/admin/AdminCreateScheduleScreen';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
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
        name="MovieScheduleScreen"
        component={MovieScheduleScreen}
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
      <Stack.Screen
        name="AdminAddRoom"
        component={AdminAddRoomScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AdminMovieManagement"
        component={AdminMovieManagementScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AdminAddMovie"
        component={AdminAddMovieScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AdminRoomManagement"
        component={AdminRoomManagementScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AdminCreateSchedule"
        component={AdminCreateScheduleScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
};

const Tablayout = () => {
  // Only render Toast on client to avoid SSR warning
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <UserProvider>
      <AppNavigator />
      {isClient && <Toast />}
    </UserProvider>
  );
};

export default Tablayout;
