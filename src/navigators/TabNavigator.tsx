import React from "react";
import {StyleSheet,View} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import TicketScreen from "../screens/TicketScreen";
import UserAccountScreen from "../screens/UserAccountScreen";
import { COLORS, SPACING ,FONT_SIZE } from "../theme/theme";
import { Ionicons, Entypo} from "@expo/vector-icons";


const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true, // tắt khi chạm vào ô keyboard
        tabBarActiveTintColor: "#e50914", // màu khi chọn (Netflix style)
        tabBarInactiveTintColor: "gray", // màu khi chưa chọn
        tabBarStyle: {
          backgroundColor: COLORS.Black,
          borderTopWidth: 0, // xóa kẻ trên
          height: SPACING.space_8*8,// chiều cao của tab bar
          flexDirection: "row",
          alignItems: "center",

        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ focused,color, size }) => {
            return (
              <View style={focused  ? styles.activeTabBackground : ""}>
                <Entypo name="video" size={FONT_SIZE.size_30} color={COLORS.White} />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Search",
          tabBarIcon: ({ focused,color, size }) => {
            return (
              <View style={focused  ? styles.activeTabBackground : ""}>
                <Ionicons name="search-outline" size={FONT_SIZE.size_30} color={COLORS.White} />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="Ticket"
        component={TicketScreen}
        options={{
          title: "Ticket",
          tabBarIcon: ({ focused,color, size }) => {
            return (
              <View style={focused  ? styles.activeTabBackground : ""}>
                <Ionicons name="ticket-outline" size={FONT_SIZE.size_30} color={COLORS.White} />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="User"
        component={UserAccountScreen}
        options={{
          title: "User",
          tabBarIcon: ({ focused,color, size }) => {
            return (
              <View style={focused  ? styles.activeTabBackground : ""}>
                <Ionicons name="person-outline" size={FONT_SIZE.size_30} color={COLORS.White} />
              </View>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeTabBackground: {
    backgroundColor: COLORS.Orange,
    padding: SPACING.space_12,
    borderRadius: SPACING.space_16*16,
  },
});
