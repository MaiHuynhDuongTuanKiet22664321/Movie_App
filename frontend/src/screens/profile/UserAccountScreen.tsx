import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import Toast from "react-native-toast-message";
import AppHeader from "../../components/MovieDetailsHeader";
import SettingComponent from "../../components/SettingComponent";
import { useUser } from "../../context/UserContext";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../../theme/theme";

const UserAccountScreen = ({ navigation }: any) => {
  const { user, logout } = useUser();
  const nav = useNavigation<any>();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Refresh user profile data if needed
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    Toast.show({
      type: 'success',
      text1: 'Đăng xuất thành công',
      text2: 'Hẹn gặp lại!',
    });
    nav.navigate("Auth");
  };

  const handleEditProfile = () => {
    nav.navigate('EditProfile');
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FF8C42"
          />
        }
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.avatarText}>
            {user?.fullName || "Guest User"}
          </Text>
          {user?.email && (
            <Text style={styles.avatarEmail}>{user.email}</Text>
          )}
          {user?.phoneNumber && (
            <Text style={styles.avatarPhone}>{user.phoneNumber}</Text>
          )}
        </View>

        <View style={styles.settingList}>
          <SettingComponent
            icon="person-outline"
            heading="Tài khoản"
            subheading={`${user?.fullName || "Chưa có tên"}`}
            subtitle={user?.email || "Chưa có email"}
            onPress={handleEditProfile}
          />
          <SettingComponent
            icon="settings-outline"
            heading="Cài đặt"
            subheading="Giao diện"
            subtitle="Quyền truy cập"
          />
          <SettingComponent
            icon="cash-outline"
            heading="Ưu đãi & Giới thiệu"
            subheading="Ưu đãi"
            subtitle="Giới thiệu bạn bè"
          />
          <SettingComponent
            icon="information-circle-outline"
            heading="Về ứng dụng"
            subheading="Về Movie App"
            subtitle="Thêm"
          />
        </View>
      </ScrollView>

      {/* Logout button */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.White} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  scrollContent: {
    paddingBottom: SPACING.space_36,
    paddingTop: SPACING.space_24,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: SPACING.space_28,
  },
  avatarPlaceholder: {
    height: 90,
    width: 90,
    borderRadius: 45,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatarText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_18,
    marginTop: SPACING.space_12,
    color: COLORS.White,
  },
  avatarEmail: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    marginTop: SPACING.space_8,
    color: COLORS.WhiteRGBA75,
  },
  avatarPhone: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    marginTop: SPACING.space_4,
    color: COLORS.WhiteRGBA75,
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
    marginTop: SPACING.space_16,
    paddingVertical: SPACING.space_16,
    backgroundColor: COLORS.Orange,
    borderRadius: 12,
    zIndex: 10,
    elevation: 5,
  },
  logoutText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginLeft: SPACING.space_12,
  },
});

export default UserAccountScreen;
