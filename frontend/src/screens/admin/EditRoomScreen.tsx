import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../theme/theme";
import { roomApi } from "../../api/adminApi";
import { X, CheckCircle, XCircle, Check } from "lucide-react-native";
import SeatMapPreview, { RoomSize, ROOM_CONFIGS } from "../../components/SeatMapPreview";
import InfoDialog from "../../components/InfoDialog";

interface EditRoomModalProps {
  visible: boolean;
  room: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ visible, room, onClose, onSuccess }) => {
  const [name, setName] = useState(room?.name || "");
  const [status, setStatus] = useState(room?.status || "active");
  const [loading, setLoading] = useState(false);
  const [infoDialog, setInfoDialog] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  const showInfo = (type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setInfoDialog({ visible: true, type, title, message });
  };

  // Determine room size based on seat count
  const getRoomSize = (): RoomSize => {
    const seatCount = room?.sodoghe?.length || 0;
    if (seatCount <= 48) return RoomSize.SMALL;
    if (seatCount <= 80) return RoomSize.MEDIUM;
    return RoomSize.LARGE;
  };

  const handleUpdate = async () => {
    // Validate room name
    if (!name.trim()) {
      showInfo("error", "Lỗi", "Vui lòng nhập tên phòng");
      return;
    }

    if (name.trim().length < 3) {
      showInfo("error", "Lỗi", "Tên phòng phải có ít nhất 3 ký tự");
      return;
    }

    if (name.trim().length > 50) {
      showInfo("error", "Lỗi", "Tên phòng không được quá 50 ký tự");
      return;
    }

    setLoading(true);
    try {
      const result = await roomApi.update(room._id, {
        name: name.trim(),
        status,
      });

      if (result.success) {
        showInfo("success", "Thành công", "Đã cập nhật phòng chiếu");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        showInfo("error", "Lỗi", result.message || "Không thể cập nhật phòng chiếu");
      }
    } catch (error) {
      console.error("Error updating room:", error);
      showInfo("error", "Lỗi", "Không thể cập nhật phòng chiếu");
    } finally {
      setLoading(false);
    }
  };

  if (!room) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chỉnh sửa phòng chiếu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.White} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Room Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên phòng *</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên phòng"
                placeholderTextColor={COLORS.WhiteRGBA50}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Status Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Trạng thái *</Text>
              <View style={styles.statusContainer}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    status === "active" && styles.statusButtonActive,
                  ]}
                  onPress={() => setStatus("active")}
                >
                  <CheckCircle
                    size={20}
                    color={status === "active" ? COLORS.Green : COLORS.WhiteRGBA50}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === "active" && styles.statusButtonTextActive,
                    ]}
                  >
                    Hoạt động
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    status === "inactive" && styles.statusButtonInactive,
                  ]}
                  onPress={() => setStatus("inactive")}
                >
                  <XCircle
                    size={20}
                    color={status === "inactive" ? COLORS.Red : COLORS.WhiteRGBA50}
                  />
                  <Text
                    style={[
                      styles.statusButtonText,
                      status === "inactive" && styles.statusButtonTextActive,
                    ]}
                  >
                    Tạm ngừng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Room Info */}
            <View style={styles.roomInfoBox}>
              <Text style={styles.roomInfoTitle}>Thông tin phòng</Text>
              <View style={styles.roomInfoRow}>
                <Text style={styles.roomInfoLabel}>Tổng số ghế:</Text>
                <Text style={styles.roomInfoValue}>{room.sodoghe?.length || 0} ghế</Text>
              </View>
            </View>



            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.updateButton, loading && styles.buttonDisabled]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.White} />
                ) : (
                  <>
                    <Check size={16} color={COLORS.White} />
                    <Text style={styles.updateButtonText}>Cập nhật</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Info Dialog */}
      <InfoDialog
        visible={infoDialog.visible}
        type={infoDialog.type}
        title={infoDialog.title}
        message={infoDialog.message}
        onClose={() => setInfoDialog({ ...infoDialog, visible: false })}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.space_16,
  },
  modalContainer: {
    width: isWeb ? "85%" : "100%",
    maxWidth: isWeb ? 900 : 500,
    maxHeight: SCREEN_HEIGHT * 0.9,
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_20,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.space_20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
    backgroundColor: COLORS.DarkGrey,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
  },
  closeButton: {
    padding: SPACING.space_4,
  },
  scrollView: {
    flex: 1,
    padding: isWeb ? SPACING.space_32 : SPACING.space_20,
  },
  formGroup: {
    marginBottom: SPACING.space_20,
  },
  label: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginBottom: SPACING.space_12,
  },
  input: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA25,
  },
  statusContainer: {
    flexDirection: "row",
    gap: SPACING.space_12,
  },
  statusButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_8,
    padding: SPACING.space_16,
    borderRadius: BORDER_RADIUS.radius_12,
    backgroundColor: COLORS.DarkGrey,
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA15,
  },
  statusButtonActive: {
    borderColor: COLORS.Green,
    backgroundColor: COLORS.Green + "20",
  },
  statusButtonInactive: {
    borderColor: COLORS.Red,
    backgroundColor: COLORS.Red + "20",
  },
  statusButtonText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
  },
  statusButtonTextActive: {
    color: COLORS.White,
  },
  previewSection: {
    marginBottom: SPACING.space_20,
  },
  previewContainer: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_12,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    marginBottom: SPACING.space_12,
  },
  roomInfoBox: {
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    marginBottom: SPACING.space_20,
  },
  roomInfoTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginBottom: SPACING.space_12,
  },
  roomInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.space_8,
  },
  roomInfoLabel: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  roomInfoValue: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  infoBox: {
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_12,
    gap: SPACING.space_8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
  infoText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.space_12,
    marginTop: SPACING.space_8,
    marginBottom: SPACING.space_12,
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.space_8,
  },
  cancelButton: {
    backgroundColor: COLORS.WhiteRGBA15,
  },
  cancelButtonText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  updateButton: {
    backgroundColor: COLORS.Orange,
  },
  updateButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default EditRoomModal;
