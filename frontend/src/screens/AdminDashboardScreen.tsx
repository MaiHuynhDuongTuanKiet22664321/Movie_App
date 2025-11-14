import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AdminScheduleListScreen from "./AdminScheduleListScreen";
import AdminRoomManagementScreen from "./AdminRoomManagementScreen";
import AdminMovieManagementScreen from "./AdminMovieManagementScreen";

type TabType = "schedules" | "rooms" | "movies";

const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>("schedules");

  const renderContent = () => {
    switch (activeTab) {
      case "schedules":
        return <AdminScheduleListScreen />;
      case "rooms":
        return <AdminRoomManagementScreen />;
      case "movies":
        return <AdminMovieManagementScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.Black} />
      
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="view-dashboard" size={32} color={COLORS.Orange} />
        <Text style={styles.headerTitle}>Quản lý ứng dụng</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "schedules" && styles.activeTab]}
          onPress={() => setActiveTab("schedules")}
        >
          <MaterialCommunityIcons
            name="calendar-clock"
            size={20}
            color={activeTab === "schedules" ? COLORS.White : COLORS.WhiteRGBA50}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "schedules" && styles.activeTabText,
            ]}
          >
            Lịch chiếu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "rooms" && styles.activeTab]}
          onPress={() => setActiveTab("rooms")}
        >
          <MaterialCommunityIcons
            name="door"
            size={20}
            color={activeTab === "rooms" ? COLORS.White : COLORS.WhiteRGBA50}
          />
          <Text
            style={[styles.tabText, activeTab === "rooms" && styles.activeTabText]}
          >
            Phòng chiếu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "movies" && styles.activeTab]}
          onPress={() => setActiveTab("movies")}
        >
          <MaterialCommunityIcons
            name="movie-open"
            size={20}
            color={activeTab === "movies" ? COLORS.White : COLORS.WhiteRGBA50}
          />
          <Text
            style={[styles.tabText, activeTab === "movies" && styles.activeTabText]}
          >
            Phim chiếu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_20,
    gap: SPACING.space_12,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.space_24,
    gap: SPACING.space_8,
    marginBottom: SPACING.space_20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.space_12,
    borderRadius: BORDER_RADIUS.radius_20,
    backgroundColor: COLORS.DarkGrey,
    gap: SPACING.space_8,
  },
  activeTab: {
    backgroundColor: COLORS.Orange,
  },
  tabText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA50,
  },
  activeTabText: {
    color: COLORS.White,
  },
  content: {
    flex: 1,
  },
});

export default AdminDashboardScreen;
