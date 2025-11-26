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
const isSmallScreen = SCREEN_WIDTH < 380;
const isWeb = Platform.OS === 'web';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import { roomApi } from "../api/adminApi";
import { X, Armchair, Plus } from "lucide-react-native";
import SeatMapPreview, { RoomSize, ROOM_CONFIGS } from "../components/SeatMapPreview";
import InfoDialog from "../components/InfoDialog";

interface CreateRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ visible, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [selectedSize, setSelectedSize] = useState<RoomSize>(RoomSize.MEDIUM);
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

  const handleCreate = async () => {
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

    // Validate room size
    if (!selectedSize) {
      showInfo("error", "Lỗi", "Vui lòng chọn kích thước phòng");
      return;
    }

    const config = ROOM_CONFIGS[selectedSize];

    setLoading(true);
    try {
      const result = await roomApi.create({
        name: name.trim(),
        rowCount: config.rows,
        seatsPerRow: config.seatsPerRow,
      });

      if (result.success) {
        showInfo("success", "Thành công", "Đã tạo phòng chiếu mới");
        setName("");
        setSelectedSize(RoomSize.MEDIUM);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        showInfo("error", "Lỗi", result.message || "Không thể tạo phòng chiếu");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      showInfo("error", "Lỗi", "Không thể tạo phòng chiếu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tạo phòng chiếu mới</Text>
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
                placeholder="Ví dụ: Phòng VIP 1, Phòng Standard..."
                placeholderTextColor={COLORS.WhiteRGBA50}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Room Size Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Kích thước phòng *</Text>
              <View style={styles.sizeContainer}>
                {Object.entries(ROOM_CONFIGS).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.sizeButton,
                      selectedSize === key && styles.sizeButtonActive,
                    ]}
                    onPress={() => setSelectedSize(key as RoomSize)}
                  >
                    <View style={styles.sizeHeader}>
                      <Armchair
                        size={24}
                        color={selectedSize === key ? COLORS.Orange : COLORS.WhiteRGBA50}
                      />
                      <Text
                        style={[
                          styles.sizeName,
                          selectedSize === key && styles.sizeNameActive,
                        ]}
                      >
                        {config.name}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.sizeDesc,
                        selectedSize === key && styles.sizeDescActive,
                      ]}
                    >
                      {config.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.label}>Xem trước sơ đồ ghế</Text>
              <View style={styles.previewContainer}>
                <SeatMapPreview roomSize={selectedSize} compact={false} showLabels />
              </View>
              
              {/* Giải thích */}
              <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                  <Armchair size={18} color={COLORS.Yellow} />
                  <Text style={styles.infoText}>Hàng A: Ghế VIP (màu vàng)</Text>
                </View>
                <View style={styles.infoRow}>
                  <Armchair size={18} color={COLORS.WhiteRGBA50} />
                  <Text style={styles.infoText}>Các hàng còn lại: Ghế thường</Text>
                </View>
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
                style={[styles.button, styles.createButton, loading && styles.buttonDisabled]}
                onPress={handleCreate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.White} />
                ) : (
                  <>
                    <Plus size={16} color={COLORS.White} />
                    <Text style={styles.createButtonText}>Tạo phòng</Text>
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
  sizeContainer: {
    gap: SPACING.space_12,
  },
  sizeButton: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA15,
  },
  sizeButtonActive: {
    borderColor: COLORS.Orange,
    backgroundColor: COLORS.OrangeRGBBA0,
  },
  sizeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    marginBottom: SPACING.space_8,
  },
  sizeName: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.WhiteRGBA75,
  },
  sizeNameActive: {
    color: COLORS.White,
  },
  sizeDesc: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA50,
  },
  sizeDescActive: {
    color: COLORS.WhiteRGBA75,
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
  createButton: {
    backgroundColor: COLORS.Orange,
  },
  createButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default CreateRoomModal;
