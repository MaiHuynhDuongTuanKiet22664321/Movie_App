import { Ionicons } from "@expo/vector-icons";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { StyleSheet, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import TicketScreen from "../screens/TicketScreen";
import UserAccountScreen from "../screens/UserAccountScreen";
import AdminScheduleListScreen from "../screens/AdminScheduleListScreen";
import AdminRoomManagementScreen from "../screens/AdminRoomManagementScreen";
import AdminMovieManagementScreen from "../screens/AdminMovieManagementScreen";
import { COLORS, FONT_SIZE, SPACING } from "../theme/theme";
import { useUser } from "../context/UserContext";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

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
      {isAdmin ? (
        <>
          {/* Admin Tabs */}
          <Tab.Screen
            name="schedules-manager"
            component={AdminScheduleListScreen}
            options={{
              tabBarShowLabel: false,
              tabBarIcon: ({ focused }) => (
                <View
                  style={[
                    styles.activeTabBackground,
                    focused ? { backgroundColor: COLORS.Orange } : {},
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={24}
                    color="white"
                  />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="rooms-manager"
            component={AdminRoomManagementScreen}
            options={{
              tabBarShowLabel: false,
              tabBarIcon: ({ focused }) => (
                <View
                  style={[
                    styles.activeTabBackground,
                    focused ? { backgroundColor: COLORS.Orange } : {},
                  ]}
                >
                  <MaterialCommunityIcons
                    name="door"
                    size={24}
                    color="white"
                  />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="movies-manager"
            component={AdminMovieManagementScreen}
            options={{
              tabBarShowLabel: false,
              tabBarIcon: ({ focused }) => (
                <View
                  style={[
                    styles.activeTabBackground,
                    focused ? { backgroundColor: COLORS.Orange } : {},
                  ]}
                >
                  <MaterialCommunityIcons
                    name="movie-open"
                    size={24}
                    color="white"
                  />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="admin-profile"
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
        </>
      ) : (
        <>
          {/* User Tabs */}
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
                  <MaterialCommunityIcons
                    name="movie-open-play"
                    size={24}
                    color="white"
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
                  <Fontisto name="ticket" size={28} color="white" />
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
        </>
      )}
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
