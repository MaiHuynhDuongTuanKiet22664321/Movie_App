import { UserProvider, useUser } from '../src/context/UserContext';
import TabNavigator from '../src/navigators/TabNavigator';
import AuthScreen from '../src/screens/AuthScreen';
import EditProfileScreen from '../src/screens/EditProfileScreen';
import MovieDetailScreen from '../src/screens/MovieDetailScreen';
import MovieScheduleScreen from '../src/screens/MovieScheduleScreen';
import PaymentScreen from '../src/screens/PaymentScreen';
import SeatBookingScreen from '../src/screens/SeatBookingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome, 
  FontAwesome5, 
  FontAwesome6,
  MaterialCommunityIcons,
  Fontisto,
  Octicons 
} from '@expo/vector-icons';

import Toast from 'react-native-toast-message';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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

    </Stack.Navigator>
  );
};

const Tablayout = () => {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
    ...FontAwesome5.font,
    ...FontAwesome6.font,
    ...MaterialCommunityIcons.font,
    ...Fontisto.font,
    ...Octicons.font,
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <AppNavigator />
      <Toast />
    </UserProvider>
  );
};

export default Tablayout;
