import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  type?: "danger" | "warning" | "info";
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  loading = false,
  type = "danger",
}) => {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return { name: "trash-can", color: COLORS.Red };
      case "warning":
        return { name: "triangle-exclamation", color: COLORS.Yellow };
      default:
        return { name: "circle-info", color: COLORS.Orange };
    }
  };

  const icon = getIcon();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: icon.color + "20" }]}>
            <FontAwesome6 name={icon.name} size={32} color={icon.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: icon.color },
                loading && styles.buttonDisabled,
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.White} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.space_24,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_20,
    padding: SPACING.space_24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.space_16,
  },
  title: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
    marginBottom: SPACING.space_12,
    textAlign: "center",
  },
  message: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
    textAlign: "center",
    marginBottom: SPACING.space_24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.space_12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.space_12,
    borderRadius: BORDER_RADIUS.radius_12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.WhiteRGBA15,
  },
  cancelButtonText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  confirmButton: {
    backgroundColor: COLORS.Red,
  },
  confirmButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ConfirmDialog;
