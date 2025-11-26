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
} from "../theme/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { roomApi } from "../api/adminApi";
import CreateRoomModal from "./CreateRoomScreen";
import EditRoomModal from "./EditRoomScreen";
import SeatMapPreview, { RoomSize } from "../components/SeatMapPreview";
import ConfirmDialog from "../components/ConfirmDialog";

const AdminRoomManagementScreen = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [viewingRoomSeats, setViewingRoomSeats] = useState<any>(null);
  const [deletingRoom, setDeletingRoom] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const roomsRes = await roomApi.getAll();
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
        setDeletingRoom(null);
        setDeleteLoading(false);
        setTimeout(() => {
          fetchData();
        }, 300);
      } else {
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

  const renderRoomCard = (room: any) => (
    <View key={room._id} style={styles.roomCard}>
      <View style={styles.roomCardHeader}>
        <View style={styles.roomIconContainer}>
          <MaterialCommunityIcons name="door-open" size={24} color={COLORS.Orange} />
        </View>
        <View style={styles.roomHeaderInfo}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.roomMetaRow}>
            <MaterialCommunityIcons name="seat" size={12} color={COLORS.WhiteRGBA75} />
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
              Nhấn "Thêm phòng" để tạo phòng chiếu đầu tiên
            </Text>
          </View>
        ) : (
          rooms.map(renderRoomCard)
        )}
      </ScrollView>

      <CreateRoomModal
        visible={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onSuccess={fetchData}
      />

      {editingRoom && (
        <EditRoomModal
          visible={!!editingRoom}
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSuccess={fetchData}
        />
      )}

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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateRoomModal(true)}
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
    borderTopColor: COLORS.WhiteRGBA15,
    backgroundColor: COLORS.Black + "40",
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
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Orange,
  },
  actionDivider: {
    width: 1,
    backgroundColor: COLORS.WhiteRGBA15,
  },
  viewSeatsHint: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
    marginTop: SPACING.space_8,
  },
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

export default AdminRoomManagementScreen;
