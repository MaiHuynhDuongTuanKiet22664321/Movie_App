import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react-native";

interface InfoDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "warning" | "info";
}

const InfoDialog: React.FC<InfoDialogProps> = ({
  visible,
  title,
  message,
  onClose,
  type = "info",
}) => {
  const getIconColor = () => {
    switch (type) {
      case "success":
        return COLORS.Green;
      case "error":
        return COLORS.Red;
      case "warning":
        return COLORS.Yellow;
      default:
        return COLORS.Orange;
    }
  };

  const iconColor = getIconColor();

  const renderIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={32} color={iconColor} />;
      case "error":
        return <XCircle size={32} color={iconColor} />;
      case "warning":
        return <AlertTriangle size={32} color={iconColor} />;
      default:
        return <Info size={32} color={iconColor} />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
            {renderIcon()}
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Action */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: iconColor }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
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
  button: {
    width: "100%",
    paddingVertical: SPACING.space_16,
    borderRadius: BORDER_RADIUS.radius_12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
});

export default InfoDialog;
