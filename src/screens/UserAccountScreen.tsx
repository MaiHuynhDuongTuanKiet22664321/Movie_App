import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../theme/theme";
import AppHeader from "../components/MovieDetailsHeader";
import SettingComponent from "../components/SettingComponent";
import { Ionicons } from "@expo/vector-icons";

const UserAccountScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          nameIcon="close-circle-outline"
          header=""
          action={() => navigation.goBack()}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/image/avatar.png")}
            style={styles.avatarImage}
          />
          <Text style={styles.avatarText}>John Doe</Text>
        </View>

        <View style={styles.settingList}>
          <SettingComponent
            icon="person-outline"
            heading="Account"
            subheading="Edit Profile"
            subtitle="Change Password"
          />
          <SettingComponent
            icon="settings-outline"
            heading="Settings"
            subheading="Theme"
            subtitle="Permissions"
          />
          <SettingComponent
            icon="cash-outline"
            heading="Offers & Referrals"
            subheading="Offer"
            subtitle="Referrals"
          />
          <SettingComponent
            icon="information-circle-outline"
            heading="About"
            subheading="About Movies"
            subtitle="More"
          />
        </View>
      </ScrollView>

      {/* Logout button */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={() => console.log("Logout pressed")}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.White} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_20 * 2,
  },
  scrollContent: {
    paddingBottom: SPACING.space_36,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: SPACING.space_36,
    marginBottom: SPACING.space_36,
  },
  avatarImage: {
    height: 90,
    width: 90,
    borderRadius: 45,
  },
  avatarText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_18,
    marginTop: SPACING.space_12,
    color: COLORS.White,
  },
  settingList: {
    paddingHorizontal: SPACING.space_20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SPACING.space_20,
    marginBottom: SPACING.space_20,
    paddingVertical: SPACING.space_16,
    backgroundColor: COLORS.Orange,
    borderRadius: 12,
  },
  logoutText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginLeft: SPACING.space_12,
  },
});

export default UserAccountScreen;
