import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isWeb = SCREEN_WIDTH > 768;
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../theme/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useUser } from "../../context/UserContext";
import { scheduleApi, roomApi } from "../../api/adminApi";
import CreateRoomModal from "./CreateRoomScreen";
import EditRoomModal from "./EditRoomScreen";
import EditScheduleModal from "./EditScheduleModal";
import SeatMapPreview, { RoomSize } from "../../components/SeatMapPreview";
import ConfirmDialog from "../../components/ConfirmDialog";

const AdminScheduleManagementScreen = ({ navigation }: any) => {
  const { user } = useUser();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedules" | "rooms">("schedules");
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewingRoomSeats, setViewingRoomSeats] = useState<any>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<any>(null);
  const [deletingRoom, setDeletingRoom] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch schedules and rooms data
  const fetchData = async () => {
    try {
      const [schedulesRes, roomsRes] = await Promise.all([
        scheduleApi.getAll(),
        roomApi.getAll(),
      ]);

      if (schedulesRes.success) {
        setSchedules(schedulesRes.data);
      }

      if (roomsRes.success) {
        setRooms(roomsRes.data);
      }
    } catch (error) {
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
        // Ẩn dialog trước
        setDeletingSchedule(null);
        setDeleteLoading(false);
        // Đợi animation ẩn hoàn tất rồi mới fetch data
        setTimeout(() => {
          fetchData();
        }, 300);
      } else {
        // Hiển thị lỗi nếu không thành công
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

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
  };

  const handleDeleteRoom = (room: any) => {
    setDeletingRoom(room);
  };

  const confirmDeleteRoom = async () => {
    if (!deletingRoom) return;
    
    setDeleteLoading(true);
    try {
      const result = await roomApi.delete(deletingRoom._id);
      
      if (result.success) {
        // Ẩn dialog trước
        setDeletingRoom(null);
        setDeleteLoading(false);
        // Đợi animation ẩn hoàn tất rồi mới fetch data
        setTimeout(() => {
          fetchData();
        }, 300);
      } else {
        // Hiển thị lỗi nếu không thành công
        setDeletingRoom(null);
        setDeleteLoading(false);
        setTimeout(() => {
          Alert.alert("Lỗi", result.message || "Không thể xóa phòng chiếu");
        }, 300);
      }
    } catch (error: any) {
      setDeletingRoom(null);
      setDeleteLoading(false);
      setTimeout(() => {
        Alert.alert("Lỗi", error?.message || "Không thể kết nối đến server");
      }, 300);
    }
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
              schedule.status === "scheduled" ? styles.statusScheduled : styles.statusCompleted,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                schedule.status === "scheduled" ? styles.dotScheduled : styles.dotCompleted,
              ]}
            />
            <Text style={styles.scheduleStatusText}>
              {schedule.status === "scheduled" ? "Sắp chiếu" : "Đã chiếu"}
            </Text>
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

  const renderRoomCard = (room: any) => (
    <View key={room._id} style={styles.roomCard}>
      <View style={styles.roomCardHeader}>
        <View style={styles.roomIconContainer}>
          <MaterialCommunityIcons name="door-open" size={28} color={COLORS.Orange} />
        </View>
        <View style={styles.roomHeaderInfo}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.roomMetaRow}>
            <MaterialCommunityIcons name="seat" size={14} color={COLORS.WhiteRGBA75} />
            <Text style={styles.roomMetaText}>{room.sodoghe?.length || 0} ghế</Text>
          </View>
        </View>
        <View
          style={[
            styles.roomStatusBadge,
            room.status === "active" ? styles.roomStatusActive : styles.roomStatusInactive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              room.status === "active" ? styles.dotActive : styles.dotInactive,
            ]}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.roomCardBody}
        onPress={() => room.sodoghe?.length > 0 && setViewingRoomSeats(room)}
        activeOpacity={room.sodoghe?.length > 0 ? 0.7 : 1}
      >
        <View style={styles.roomStatsContainer}>
          <View style={styles.roomStat}>
            <Text style={styles.roomStatLabel}>Trạng thái</Text>
            <Text style={styles.roomStatValue}>
              {room.status === "active" ? "Hoạt động" : "Tạm ngừng"}
            </Text>
          </View>
          <View style={styles.roomStatDivider} />
          <View style={styles.roomStat}>
            <Text style={styles.roomStatLabel}>Sử dụng</Text>
            <Text style={styles.roomStatValue}>
              {room.sodoghe?.length > 0 
                ? `0/${room.sodoghe.length}` 
                : "Chưa có"}
            </Text>
          </View>
        </View>
        {room.sodoghe?.length > 0 && (
          <Text style={styles.viewSeatsHint}>Nhấn để xem chi tiết</Text>
        )}
      </TouchableOpacity>

      <View style={styles.roomCardActions}>
        <TouchableOpacity
          style={styles.roomActionButton}
          onPress={() => handleEditRoom(room)}
        >
          <FontAwesome6 name="pen" size={14} color={COLORS.Orange} />
          <Text style={styles.roomActionText}>Chỉnh sửa</Text>
        </TouchableOpacity>

        <View style={styles.actionDivider} />

        <TouchableOpacity
          style={styles.roomActionButton}
          onPress={() => handleDeleteRoom(room)}
        >
          <FontAwesome6 name="trash-can" size={14} color={COLORS.Red} />
          <Text style={[styles.roomActionText, { color: COLORS.Red }]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.Orange} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            size={24}
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
            size={24}
            color={activeTab === "rooms" ? COLORS.White : COLORS.WhiteRGBA50}
          />
          <Text
            style={[styles.tabText, activeTab === "rooms" && styles.activeTabText]}
          >
            Phòng chiếu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
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
        {activeTab === "schedules" ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Tổng số lịch chiếu: {schedules.length}
              </Text>
            </View>
            {schedules.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="calendar-remove"
                  size={80}
                  color={COLORS.WhiteRGBA25}
                />
                <Text style={styles.emptyTitle}>Chưa có lịch chiếu</Text>
                <Text style={styles.emptySubtitle}>
                  Nhấn "Thêm mới" để tạo lịch chiếu đầu tiên
                </Text>
              </View>
            ) : (
              schedules.map(renderScheduleCard)
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Tổng số phòng: {rooms.length}
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateRoomModal(true)}
              >
                <FontAwesome6 name="plus" size={16} color={COLORS.White} />
                <Text style={styles.addButtonText}>Thêm phòng</Text>
              </TouchableOpacity>
            </View>
            {rooms.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="door-closed"
                  size={80}
                  color={COLORS.WhiteRGBA25}
                />
                <Text style={styles.emptyTitle}>Chưa có phòng chiếu</Text>
                <Text style={styles.emptySubtitle}>
                  Nhấn "Thêm phòng" để tạo phòng chiếu đầu tiên
                </Text>
              </View>
            ) : (
              rooms.map(renderRoomCard)
            )}
          </>
        )}
      </ScrollView>

      {/* Create Room Modal */}
      <CreateRoomModal
        visible={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onSuccess={fetchData}
      />

      {/* Edit Room Modal */}
      {editingRoom && (
        <EditRoomModal
          visible={!!editingRoom}
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Edit Schedule Modal */}
      {editingSchedule && (
        <EditScheduleModal
          visible={!!editingSchedule}
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSuccess={fetchData}
        />
      )}

      {/* View Room Seats Modal */}
      {viewingRoomSeats && (
        <Modal
          visible={!!viewingRoomSeats}
          transparent
          animationType="fade"
          onRequestClose={() => setViewingRoomSeats(null)}
        >
          <View style={styles.seatModalOverlay}>
            <View style={styles.seatModalContainer}>
              <View style={styles.seatModalHeader}>
                <Text style={styles.seatModalTitle}>
                  Sơ đồ ghế - {viewingRoomSeats.name}
                </Text>
                <TouchableOpacity onPress={() => setViewingRoomSeats(null)}>
                  <FontAwesome6 name="xmark" size={24} color={COLORS.White} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.seatModalContent}>
                <SeatMapPreview
                  roomSize={
                    viewingRoomSeats.sodoghe?.length <= 24
                      ? RoomSize.SMALL
                      : viewingRoomSeats.sodoghe?.length <= 30
                      ? RoomSize.MEDIUM
                      : RoomSize.LARGE
                  }
                  showLabels
                  compact={false}
                />
                
                <View style={styles.seatLegendContainer}>
                  <View style={styles.seatLegendItem}>
                    <MaterialCommunityIcons name="seat" size={20} color={COLORS.Green} />
                    <Text style={styles.seatLegendText}>Còn trống</Text>
                  </View>
                  <View style={styles.seatLegendItem}>
                    <MaterialCommunityIcons name="seat" size={20} color={COLORS.Red} />
                    <Text style={styles.seatLegendText}>Đã đặt</Text>
                  </View>
                  <View style={styles.seatLegendItem}>
                    <MaterialCommunityIcons name="seat" size={20} color={COLORS.Yellow} />
                    <Text style={styles.seatLegendText}>VIP</Text>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Schedule Confirmation Dialog */}
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

      {/* Delete Room Confirmation Dialog */}
      <ConfirmDialog
        visible={!!deletingRoom}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa phòng chiếu "${deletingRoom?.name || 'này'}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDeleteRoom}
        onCancel={() => setDeletingRoom(null)}
        loading={deleteLoading}
        type="danger"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
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
    gap: SPACING.space_12,
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
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
  },
  activeTabText: {
    color: COLORS.White,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.space_24,
    paddingBottom: SPACING.space_36,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.space_16,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.Orange,
    paddingHorizontal: SPACING.space_16,
    paddingVertical: SPACING.space_8,
    borderRadius: BORDER_RADIUS.radius_20,
    gap: SPACING.space_8,
  },
  addButtonText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
  },
  // Schedule Card Styles
  scheduleCard: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_16,
    marginBottom: SPACING.space_16,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    overflow: "hidden",
  },
  scheduleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_8,
    borderRadius: BORDER_RADIUS.radius_12,
    gap: SPACING.space_8,
  },
  statusScheduled: {
    backgroundColor: COLORS.Green + "20",
  },
  statusCompleted: {
    backgroundColor: COLORS.WhiteRGBA15,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotScheduled: {
    backgroundColor: COLORS.Green,
  },
  dotCompleted: {
    backgroundColor: COLORS.WhiteRGBA50,
  },
  dotActive: {
    backgroundColor: COLORS.Green,
  },
  dotInactive: {
    backgroundColor: COLORS.Red,
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
    borderTopColor: COLORS.WhiteRGBA10,
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
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Orange,
  },
  actionDivider: {
    width: 1,
    backgroundColor: COLORS.WhiteRGBA10,
  },
  // Room Card Styles
  roomCard: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_16,
    marginBottom: SPACING.space_16,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    overflow: "hidden",
  },
  roomCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.space_16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA10,
    gap: SPACING.space_12,
  },
  roomIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.radius_12,
    backgroundColor: COLORS.Orange + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  roomHeaderInfo: {
    flex: 1,
  },
  roomName: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  roomMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
  roomMetaText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  roomStatusBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.radius_8,
    alignItems: "center",
    justifyContent: "center",
  },
  roomStatusActive: {
    backgroundColor: COLORS.Green + "20",
  },
  roomStatusInactive: {
    backgroundColor: COLORS.Red + "20",
  },
  roomCardBody: {
    padding: SPACING.space_16,
  },
  roomStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomStat: {
    flex: 1,
    alignItems: "center",
  },
  roomStatLabel: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
    marginBottom: SPACING.space_4,
  },
  roomStatValue: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  roomStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.WhiteRGBA15,
  },
  roomCardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA10,
  },
  roomActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.space_12,
    gap: SPACING.space_8,
  },
  roomActionText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Orange,
  },
  viewSeatsHint: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
    marginTop: SPACING.space_8,
  },
  // Seat Modal Styles
  seatModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  seatModalContainer: {
    width: isWeb ? "80%" : "95%",
    maxWidth: isWeb ? 900 : undefined,
    maxHeight: "90%",
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_20,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    overflow: "hidden",
  },
  seatModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.space_20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
    backgroundColor: COLORS.DarkGrey,
  },
  seatModalTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
    flex: 1,
  },
  seatModalContent: {
    padding: SPACING.space_20,
  },
  seatLegendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.space_20,
    marginTop: SPACING.space_20,
    paddingTop: SPACING.space_16,
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA15,
  },
  seatLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
  seatLegendText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
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

export default AdminScheduleManagementScreen;