import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { scheduleApi } from "../api/adminApi";
import EditScheduleModal from "./EditScheduleModal";
import CreateScheduleModal from "./CreateScheduleModal";
import ConfirmDialog from "../components/ConfirmDialog";

const AdminScheduleListScreen = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const schedulesRes = await scheduleApi.getAll();
      if (schedulesRes.success) {
        setSchedules(schedulesRes.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteSchedule = (schedule: any) => {
    setDeletingSchedule(schedule);
  };

  const confirmDeleteSchedule = async () => {
    if (!deletingSchedule) return;
    
    setDeleteLoading(true);
    try {
      const result = await scheduleApi.delete(deletingSchedule._id);
      
      if (result.success) {
        setDeletingSchedule(null);
        setDeleteLoading(false);
        setTimeout(() => {
          fetchData();
        }, 300);
      } else {
        setDeletingSchedule(null);
        setDeleteLoading(false);
        setTimeout(() => {
          Alert.alert("Lỗi", result.message || "Không thể xóa lịch chiếu");
        }, 300);
      }
    } catch (error: any) {
      setDeletingSchedule(null);
      setDeleteLoading(false);
      setTimeout(() => {
        Alert.alert("Lỗi", error?.message || "Không thể kết nối đến server");
      }, 300);
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
  };

  const renderScheduleCard = (schedule: any) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Auto-calculate status based on date and time
    const scheduleDateTime = new Date(`${schedule.date.split('T')[0]}T${schedule.time}`);
    const now = new Date();
    const actualStatus = scheduleDateTime < now ? "completed" : "scheduled";

    return (
      <View key={schedule._id} style={styles.scheduleCard}>
        <View style={styles.scheduleCardHeader}>
          <View style={styles.scheduleMovieInfo}>
            <MaterialCommunityIcons name="movie-open" size={24} color={COLORS.Orange} />
            <View style={styles.scheduleMovieText}>
              <Text style={styles.scheduleMovieTitle} numberOfLines={1}>
                {schedule.movie?.title || "N/A"}
              </Text>
              <Text style={styles.scheduleRoomText}>{schedule.room?.name || "N/A"}</Text>
            </View>
          </View>
          <View
            style={[
              styles.scheduleStatusBadge,
              actualStatus === "scheduled" ? styles.statusScheduled : styles.statusCompleted,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                actualStatus === "scheduled" ? styles.dotScheduled : styles.dotCompleted,
              ]}
            />
          </View>
        </View>

        <View style={styles.scheduleCardBody}>
          <View style={styles.scheduleInfoGrid}>
            <View style={styles.scheduleInfoItem}>
              <FontAwesome6 name="calendar-days" size={14} color={COLORS.WhiteRGBA75} />
              <Text style={styles.scheduleInfoLabel}>Ngày</Text>
              <Text style={styles.scheduleInfoValue}>{formatDate(schedule.date)}</Text>
            </View>

            <View style={styles.scheduleInfoItem}>
              <FontAwesome6 name="clock" size={14} color={COLORS.WhiteRGBA75} />
              <Text style={styles.scheduleInfoLabel}>Giờ</Text>
              <Text style={styles.scheduleInfoValue}>{schedule.time}</Text>
            </View>

            <View style={styles.scheduleInfoItem}>
              <FontAwesome6 name="money-bill-wave" size={14} color={COLORS.WhiteRGBA75} />
              <Text style={styles.scheduleInfoLabel}>Giá vé</Text>
              <Text style={styles.scheduleInfoValue}>
                {(schedule.basePrice / 1000).toFixed(0)}K
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.scheduleCardActions}>
          <TouchableOpacity
            style={styles.scheduleActionButton}
            onPress={() => handleEditSchedule(schedule)}
          >
            <FontAwesome6 name="pen" size={14} color={COLORS.Orange} />
            <Text style={styles.scheduleActionText}>Chỉnh sửa</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.scheduleActionButton}
            onPress={() => handleDeleteSchedule(schedule)}
          >
            <FontAwesome6 name="trash-can" size={14} color={COLORS.Red} />
            <Text style={[styles.scheduleActionText, { color: COLORS.Red }]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="calendar-clock" size={32} color={COLORS.Orange} />
        <Text style={styles.headerTitle}>Quản lý lịch chiếu</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.Orange}
          />
        }
      >

        {schedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="calendar-remove"
              size={80}
              color={COLORS.WhiteRGBA25}
            />
            <Text style={styles.emptyTitle}>Chưa có lịch chiếu</Text>
            <Text style={styles.emptySubtitle}>
              Chưa có lịch chiếu nào trong hệ thống
            </Text>
          </View>
        ) : (
          schedules.map(renderScheduleCard)
        )}
      </ScrollView>

      <CreateScheduleModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
      />

      {editingSchedule && (
        <EditScheduleModal
          visible={!!editingSchedule}
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSuccess={fetchData}
        />
      )}

      <ConfirmDialog
        visible={!!deletingSchedule}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa lịch chiếu "${deletingSchedule?.movie?.title || 'này'}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDeleteSchedule}
        onCancel={() => setDeletingSchedule(null)}
        loading={deleteLoading}
        type="danger"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <FontAwesome6 name="plus" size={20} color={COLORS.White} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
    paddingTop: SPACING.space_36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_20,
    gap: SPACING.space_12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginTop: SPACING.space_12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.space_24,
    paddingTop: SPACING.space_20,
    paddingBottom: SPACING.space_36,
  },
  headerSection: {
    marginBottom: SPACING.space_24,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_28,
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  headerSubtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  fab: {
    position: "absolute",
    bottom: SPACING.space_24,
    right: SPACING.space_24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.Orange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.Orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  scheduleCard: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_16,
    marginBottom: SPACING.space_16,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    overflow: "hidden",
    shadowColor: COLORS.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.space_16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA10,
  },
  scheduleMovieInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: SPACING.space_12,
  },
  scheduleMovieText: {
    flex: 1,
  },
  scheduleMovieTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginBottom: SPACING.space_2,
  },
  scheduleRoomText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  scheduleStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.radius_8,
    alignItems: "center",
    justifyContent: "center",
  },
  statusScheduled: {
    backgroundColor: COLORS.Green + "20",
  },
  statusCompleted: {
    backgroundColor: COLORS.WhiteRGBA15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotScheduled: {
    backgroundColor: COLORS.Green,
  },
  dotCompleted: {
    backgroundColor: COLORS.WhiteRGBA50,
  },
  scheduleStatusText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.White,
  },
  scheduleCardBody: {
    padding: SPACING.space_16,
  },
  scheduleInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scheduleInfoItem: {
    flex: 1,
    alignItems: "center",
    gap: SPACING.space_4,
  },
  scheduleInfoLabel: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
    marginTop: SPACING.space_4,
  },
  scheduleInfoValue: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  scheduleCardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA15,
    backgroundColor: COLORS.Black + "40",
  },
  scheduleActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.space_12,
    gap: SPACING.space_8,
  },
  scheduleActionText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Orange,
  },
  actionDivider: {
    width: 1,
    backgroundColor: COLORS.WhiteRGBA15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.space_64,
    gap: SPACING.space_16,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
    marginTop: SPACING.space_16,
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
    paddingHorizontal: SPACING.space_48,
  },
});

export default AdminScheduleListScreen;
