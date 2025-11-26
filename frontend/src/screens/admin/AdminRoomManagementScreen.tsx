import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../theme/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { roomApi } from "../../api/adminApi";
import EditRoomModal from "./EditRoomScreen"; 
import ConfirmDialog from "../../components/ConfirmDialog";

type RootStackParamList = {
  AdminAddRoom: undefined;
  AdminRoomManagement: undefined;
  // Add other screen types as needed
};

const AdminRoomManagementScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [deletingRoom, setDeletingRoom] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await roomApi.getAll();
      if (res.success) {
        setRooms(res.data || []);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
  };

  const handleDelete = (room: any) => {
    setDeletingRoom(room);
  };

  // Hàm xử lý xem chi tiết ghế
  const handleViewSeats = (room: any) => {
    // TODO: Tạo một Modal riêng để hiển thị sơ đồ ghế (RoomDetailScreen)
    // AdminAddRoomScreen chỉ dùng để tạo mới, không dùng để view.
    Alert.alert(
      "Thông tin ghế", 
      `Phòng: ${room.name}\nTổng số ghế: ${room.sodoghe?.length || 0}\n\n(Chức năng xem sơ đồ ghế chi tiết đang phát triển)`
    );
  };

  const confirmDeleteRoom = async () => {
    if (!deletingRoom) return;
    
    setDeleteLoading(true);
    try {
      const result = await roomApi.delete(deletingRoom._id);
      if (result.success) {
        setDeletingRoom(null);
        setDeleteLoading(false);
        // Refresh lại danh sách sau khi xóa
        fetchData(); 
        Alert.alert("Thành công", "Đã xóa phòng chiếu");
      } else {
        setDeletingRoom(null);
        setDeleteLoading(false);
        Alert.alert("Lỗi", result.message || "Không thể xóa phòng chiếu");
      }
    } catch (error: any) {
      setDeletingRoom(null);
      setDeleteLoading(false);
      Alert.alert("Lỗi", error?.message || "Không thể kết nối đến server");
    }
  };

  const renderRoomCard = (room: any) => (
    <View key={room._id} style={styles.roomCard}>
      <View style={styles.roomCardHeader}>
        <View style={styles.roomHeaderInfo}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.roomMetaRow}>
            <View style={[
              styles.roomStatusBadge,
              room.size === "large" ? styles.roomStatusActive : styles.roomStatusInactive
            ]}>
              <View style={[
                styles.statusDot,
                room.size === "large" ? styles.dotActive : styles.dotInactive
              ]} />
            </View>
            <Text style={styles.roomMetaText}>
              {room.size === "small" ? "Phòng nhỏ" : room.size === "medium" ? "Phòng vừa" : "Phòng lớn"}
            </Text>
          </View>
        </View>
        <View style={styles.roomCardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(room)}
          >
            <FontAwesome6 name="pen" size={14} color={COLORS.White} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(room)}
          >
            <FontAwesome6 name="trash" size={14} color={COLORS.White} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.roomCardBody}
        onPress={() => handleViewSeats(room)}
        activeOpacity={0.7}
      >
        <View style={styles.roomStatsContainer}>
          <View style={styles.roomStat}>
            <MaterialCommunityIcons name="seat" size={24} color={COLORS.Orange} />
            <Text style={styles.roomStatLabel}>Số ghế</Text>
            <Text style={styles.roomStatValue}>
              {room.sodoghe?.length || 0}
            </Text>
          </View>
          <View style={styles.roomStatDivider} />
          <View style={styles.roomStat}>
            <MaterialCommunityIcons name="grid" size={24} color={COLORS.Green} />
            <Text style={styles.roomStatLabel}>Bố cục</Text>
            <Text style={styles.roomStatValue}>
              {room.size === "small" ? "4×6" : room.size === "medium" ? "5×6" : "6×7"}
            </Text>
          </View>
          <View style={styles.roomStatDivider} />
          <View style={styles.roomStat}>
            <MaterialCommunityIcons name="door" size={24} color={COLORS.White} />
            <Text style={styles.roomStatLabel}>Loại</Text>
            <Text style={styles.roomStatValue}>
              {room.size === "small" ? "Standard" : room.size === "medium" ? "Deluxe" : "Premium"}
            </Text>
          </View>
        </View>
        <Text style={styles.viewSeatsHint}>Nhấn để xem chi tiết sơ đồ ghế</Text>
      </TouchableOpacity>
    </View>
  );

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
        <MaterialCommunityIcons name="door" size={32} color={COLORS.Orange} />
        <Text style={styles.headerTitle}>Quản lý phòng chiếu</Text>
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

        {rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="door-closed"
              size={80}
              color={COLORS.WhiteRGBA25}
            />
            <Text style={styles.emptyTitle}>Chưa có phòng chiếu</Text>
            <Text style={styles.emptySubtitle}>
              Bắt đầu bằng cách tạo phòng chiếu đầu tiên của bạn
            </Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={() => navigation.navigate("AdminAddRoom")}
            >
              <FontAwesome6 name="plus" size={16} color={COLORS.White} />
              <Text style={styles.emptyActionText}>Tạo phòng mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="door" size={24} color={COLORS.Orange} />
                <Text style={styles.statNumber}>{rooms.length}</Text>
                <Text style={styles.statLabel}>Tổng phòng</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="seat" size={24} color={COLORS.Green} />
                <Text style={styles.statNumber}>
                  {rooms.reduce((total, room) => total + (room.sodoghe?.length || 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Tổng ghế</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="grid" size={24} color={COLORS.White} />
                <Text style={styles.statNumber}>
                  {rooms.filter(r => r.size === "large").length}
                </Text>
                <Text style={styles.statLabel}>Phòng lớn</Text>
              </View>
            </View>
            {rooms.map(renderRoomCard)}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AdminAddRoom")}
      >
        <FontAwesome6 name="plus" size={20} color={COLORS.White} />
      </TouchableOpacity>

      {/* Modal Sửa phòng */}
      {editingRoom && (
        <EditRoomModal
          visible={!!editingRoom}
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSuccess={() => {
            setEditingRoom(null);
            fetchData();
          }}
        />
      )}

      {/* Dialog xác nhận xóa */}
      <ConfirmDialog
        visible={!!deletingRoom}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa phòng "${deletingRoom?.name}"?`}
        onConfirm={confirmDeleteRoom}
        onCancel={() => setDeletingRoom(null)}
        loading={deleteLoading}
      />
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
  roomCard: {
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
  roomCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.space_16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA10,
  },
  roomIconContainer: {
    marginRight: SPACING.space_12,
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
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: COLORS.Green,
  },
  dotInactive: {
    backgroundColor: COLORS.Red,
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
  roomStatValue: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginTop: SPACING.space_4,
  },
  roomStatLabel: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
    marginTop: SPACING.space_2,
  },
  roomCardActions: {
    flexDirection: "row",
    gap: SPACING.space_8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.radius_8,
    backgroundColor: COLORS.WhiteRGBA10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: COLORS.Red + "20",
  },
  roomStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.WhiteRGBA15,
  },
  viewSeatsHint: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
    marginTop: SPACING.space_8,
  },
  statsContainer: {
    flexDirection: "row",
    gap: SPACING.space_12,
    marginBottom: SPACING.space_20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  statNumber: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
    marginTop: SPACING.space_4,
  },
  statLabel: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
    marginTop: SPACING.space_2,
  },
  emptyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.Orange,
    paddingHorizontal: SPACING.space_20,
    paddingVertical: SPACING.space_12,
    borderRadius: BORDER_RADIUS.radius_12,
    gap: SPACING.space_8,
    marginTop: SPACING.space_16,
  },
  emptyActionText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
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

export default AdminRoomManagementScreen;