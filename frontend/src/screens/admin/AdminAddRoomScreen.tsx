import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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

const ROOM_SIZES = [
  { id: "small", label: "Phòng nhỏ", seats: 24, desc: "4 hàng x 6 ghế", icon: "door-closed", color: COLORS.Green },
  { id: "medium", label: "Phòng vừa", seats: 30, desc: "5 hàng x 6 ghế", icon: "door-open", color: COLORS.Orange },
  { id: "large", label: "Phòng lớn", seats: 42, desc: "6 hàng x 7 ghế", icon: "door-sliding", color: COLORS.Red },
];

const AdminAddRoomScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [selectedSize, setSelectedSize] = useState(ROOM_SIZES[0].id);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên phòng chiếu");
      return;
    }

    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi lên server
      const payload = {
        name: name.trim(),
        size: selectedSize, 
        // Backend sẽ tự tạo danh sách ghế dựa trên size này
      };

      console.log("Creating room with payload:", payload);
      console.log("Selected size:", selectedSize);
      console.log("Room name:", name.trim());

      const res = await roomApi.create(payload);
      
      console.log("Room creation response:", res);

      if (res.success) {
        console.log("Room creation successful!");
        Alert.alert("Thành công", "Đã tạo phòng chiếu mới", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        console.log("Room creation failed:", res);
        Alert.alert("Lỗi", res.message || "Không thể tạo phòng");
      }
    } catch (error: any) {
      console.log("Room creation error:", error);
      Alert.alert("Lỗi", error?.message || "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
          <FontAwesome6 name="arrow-left" size={20} color={COLORS.White} />
        </TouchableOpacity>
        <Text style={styles.title}>Thêm phòng chiếu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Input Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên phòng</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Phòng 01, IMAX..."
            placeholderTextColor={COLORS.WhiteRGBA50}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        {/* Select Size */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kích thước phòng</Text>
          <Text style={styles.subtitle}>Chọn kích thước phù hợp với nhu cầu của bạn</Text>
          
          <View style={styles.sizeOptions}>
            {ROOM_SIZES.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.sizeCard,
                  selectedSize === size.id && styles.sizeCardActive,
                ]}
                onPress={() => setSelectedSize(size.id)}
                disabled={loading}
              >
                <View style={[
                  styles.sizeIconContainer,
                  { backgroundColor: selectedSize === size.id ? size.color : COLORS.WhiteRGBA10 }
                ]}>
                  <MaterialCommunityIcons 
                    name={size.icon as any} 
                    size={24} 
                    color={selectedSize === size.id ? COLORS.White : size.color} 
                  />
                </View>
                <Text
                  style={[
                    styles.sizeLabel,
                    selectedSize === size.id && styles.activeText,
                  ]}
                >
                  {size.label}
                </Text>
                <Text
                  style={[
                    styles.sizeSeats,
                    selectedSize === size.id && styles.activeText,
                  ]}
                >
                  {size.seats} ghế
                </Text>
                <Text
                  style={[
                    styles.sizeDesc,
                    selectedSize === size.id && styles.activeText,
                  ]}
                >
                  {size.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xem trước</Text>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <MaterialCommunityIcons name="information" size={16} color={COLORS.Orange} />
              <Text style={styles.previewTitle}>Phòng: {name || "Chưa đặt tên"}</Text>
            </View>
            <View style={styles.previewStats}>
              <View style={styles.previewStat}>
                <MaterialCommunityIcons name="seat" size={16} color={COLORS.WhiteRGBA75} />
                <Text style={styles.previewStatText}>
                  {ROOM_SIZES.find(s => s.id === selectedSize)?.seats || 0} ghế
                </Text>
              </View>
              <View style={styles.previewDivider} />
              <View style={styles.previewStat}>
                <MaterialCommunityIcons name="grid" size={16} color={COLORS.WhiteRGBA75} />
                <Text style={styles.previewStatText}>
                  {selectedSize === "small" ? "4×6" : selectedSize === "medium" ? "5×6" : "6×7"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnCancel}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.btnCancelText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnConfirm}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.White} />
          ) : (
            <Text style={styles.btnConfirmText}>Tạo mới</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
    paddingTop: SPACING.space_36,
  },
  placeholder: {
    width: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
  },
  title: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
    flex: 1,
    textAlign: "center",
  },
  content: {
    padding: SPACING.space_24,
    paddingBottom: SPACING.space_36,
  },
  inputGroup: {
    marginBottom: SPACING.space_24,
  },
  label: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
    marginBottom: SPACING.space_8,
  },
  input: {
    height: 50,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_12,
    paddingHorizontal: SPACING.space_15,
    color: COLORS.White,
    fontFamily: FONT_FAMILY.poppins_regular,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  sizeOptions: {
    flexDirection: "row",
    gap: SPACING.space_10,
    justifyContent: "space-between",
  },
  sizeCard: {
    flex: 1,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_10,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    alignItems: "center",
  },
  sizeCardActive: {
    borderColor: COLORS.Orange,
    backgroundColor: COLORS.Orange + "20",
  },
  sizeLabel: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
    marginBottom: 2,
  },
  sizeDesc: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.Orange,
    marginBottom: 2,
  },
  sizeSubDesc: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
  },
  sizeSeats: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.Orange,
    marginBottom: 2,
  },
  activeText: {
    color: COLORS.White,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA50,
    marginBottom: SPACING.space_12,
  },
  sizeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.radius_12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.space_8,
  },
  previewContainer: {
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
    marginBottom: SPACING.space_12,
  },
  previewTitle: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  previewStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
  previewStatText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  previewDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.WhiteRGBA15,
    marginHorizontal: SPACING.space_8,
  },
  footer: {
    flexDirection: "row",
    padding: SPACING.space_24,
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA15,
    gap: SPACING.space_15,
  },
  btnCancel: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.radius_12,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA32,
  },
  btnCancelText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    color: COLORS.White,
  },
  btnConfirm: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.radius_12,
    backgroundColor: COLORS.Orange,
  },
  btnConfirmText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    color: COLORS.White,
  },
});

export default AdminAddRoomScreen;