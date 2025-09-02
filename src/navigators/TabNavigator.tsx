import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import TicketScreen from '../screens/TicketScreen';
import UserAccountScreen from '../screens/UserAccountScreen';
import { COLORS, FONT_SIZE, SPACING } from '../theme/theme';
import { Ionicons, Entypo } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { View, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  // ✅ preload font
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...Entypo.font,
    ...MaterialIcons.font,
  });

  if (!fontsLoaded) {
    // Có thể return SplashScreen hoặc Loading
    return <Text style={{color: 'white', textAlign: 'center', marginTop: 50}}>Loading...</Text>;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.Black,
          borderTopWidth: 0,
          height: SPACING.space_10 * 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.activeTabBackground,
                focused ? { backgroundColor: COLORS.Orange } : {},
              ]}
            >
              <Entypo
                name="home"
                size={FONT_SIZE.size_28}
                color={COLORS.White}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.activeTabBackground,
                focused ? { backgroundColor: COLORS.Orange } : {},
              ]}
            >
              <Ionicons
                name="search"
                color={COLORS.White}
                size={FONT_SIZE.size_28}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Ticket"
        component={TicketScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.activeTabBackground,
                focused ? { backgroundColor: COLORS.Orange } : {},
              ]}
            >
              <Ionicons
                name="ticket"
                color={COLORS.White}
                size={FONT_SIZE.size_28}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="User"
        component={UserAccountScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.activeTabBackground,
                focused ? { backgroundColor: COLORS.Orange } : {},
              ]}
            >
              <Ionicons
                name="person-circle"
                color={COLORS.White}
                size={FONT_SIZE.size_28}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeTabBackground: {
    padding: SPACING.space_18,
    borderRadius: SPACING.space_18 * 10,
  },
});

export default TabNavigator;
