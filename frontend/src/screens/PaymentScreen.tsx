import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getToken } from "../utils/storage";
import {
  COLORS,
  SPACING,
  FONT_FAMILY,
  FONT_SIZE,
  BORDER_RADIUS,
} from "../theme/theme";
import InfoDialog from "../components/InfoDialog";

const SEPAY_CONFIG = {

  BANK_ACCOUNT: "0395324779", 
  BANK_ID: "MBBank", 
};

const PaymentScreen = ({ navigation, route }: any) => {
  const { scheduleId, movieData, schedule, selectedSeats, totalPrice } =
    route.params;

  // State
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "bank">(
    "cash"
  );
  const [processing, setProcessing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  // Tạo mã đơn hàng ngẫu nhiên
  const orderCode = useMemo(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // VD: 4521
    return `VE${randomNum}`;
  }, []);

  // Tạo URL QR Code động
  const qrUrl = `https://qr.sepay.vn/img?acc=${SEPAY_CONFIG.BANK_ACCOUNT}&bank=${SEPAY_CONFIG.BANK_ID}&amount=${totalPrice}&des=${orderCode}`;

  const basePrice = schedule.basePrice || 75000;

  const getSeatDetails = () => {
    const regularSeats = selectedSeats.filter(
      (id: string) => id.charAt(0) !== "A"
    );
    const vipSeats = selectedSeats.filter((id: string) => id.charAt(0) === "A");

    return {
      regularSeats,
      vipSeats,
      regularPrice: basePrice,
      vipPrice: Math.round(basePrice * 1.3),
    };
  };

  const seatDetails = getSeatDetails();

  // --- HÀM KIỂM TRA THANH TOÁN (GỌI BACKEND PROXY) ---
  const checkSePayTransaction = async () => {
    try {
      // Lấy token từ storage utility (hỗ trợ cả native và web)
      const token = await getToken();
      
      if (!token) {
        console.error("No auth token found");
        setDialogConfig({
          type: "error",
          title: "Lỗi xác thực",
          message: "Vui lòng đăng nhập lại",
        });
        setDialogVisible(true);
        return null;
      }
      
      // Gọi backend endpoint để kiểm tra
      const response = await fetch(
        `http://localhost:5000/api/bookings/payment/check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderCode,
            totalPrice,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        return data.isPaid; // true, false, hoặc null
      }
      
      return null; // Lỗi
    } catch (error) {
      console.error("Payment Check Error:", error);
      return null; // Lỗi
    }
  };

  // --- HÀM XỬ LÝ THANH TOÁN CHÍNH ---
  const handlePayment = async () => {
    setProcessing(true);

    try {
      // 1. Validation cơ bản
      if (!scheduleId || !selectedSeats.length || !totalPrice) {
        throw new Error("Thông tin đặt vé không hợp lệ");
      }

      // 2. Xử lý riêng cho Chuyển khoản Ngân hàng
      if (paymentMethod === "bank") {
        const isPaid = await checkSePayTransaction();

        // isPaid = true: Đã thanh toán
        // isPaid = false: Chưa thanh toán
        // isPaid = null: Không xác định được (lỗi API)
        if (isPaid === false) {
          setDialogConfig({
            type: "warning",
            title: "Chưa nhận được tiền",
            message: `Hệ thống chưa thấy giao dịch ${totalPrice.toLocaleString()}đ với nội dung "${orderCode}".\nVui lòng thử lại sau 30s nếu bạn vừa chuyển.`,
          });
          setDialogVisible(true);
          setProcessing(false);
          return; // Dừng lại, không đặt vé
        }

        if (isPaid === null) {
          // Không thể kết nối tới SePay, hỏi người dùng có muốn tiếp tục không
          setDialogConfig({
            type: "warning",
            title: "Không thể kiểm tra thanh toán",
            message: "Không thể kết nối tới dịch vụ kiểm tra. Vui lòng thử lại hoặc liên hệ hỗ trợ!",
          });
          setDialogVisible(true);
          setProcessing(false);
          return;
        }

        // isPaid = true: Tiếp tục đặt vé
      }

      // 3. Gọi API Đặt vé (Cho cả Cash và Bank đã thanh toán thành công)
      const { bookingApi } = await import("../api/bookingApi");

      const result = await bookingApi.createBooking({
        scheduleId,
        selectedSeats,
        totalPrice,
        paymentMethod,
      });

      if (result.success) {
        setDialogConfig({
          type: "success",
          title: "Đặt vé thành công",
          message:
            paymentMethod === "bank"
              ? "Đã nhận được tiền và xuất vé thành công!"
              : "Vé của bạn đã được đặt thành công!",
        });
        setDialogVisible(true);

        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        throw new Error(result.message || "Đặt vé thất bại");
      }
    } catch (error: any) {
      setDialogConfig({
        type: "error",
        title: "Lỗi",
        message: error.message || "Không thể đặt vé. Vui lòng thử lại!",
      });
      setDialogVisible(true);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={20} color={COLORS.White} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Movie Info & Ticket Details (Giữ nguyên) */}
        <View style={styles.section}>
          <View style={styles.movieCard}>
            <Image
              source={{ uri: movieData.posterUrl }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle} numberOfLines={2}>
                {movieData.title}
              </Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color={COLORS.WhiteRGBA75}
                />
                <Text style={styles.infoText}>
                  {new Date(schedule.date).toLocaleDateString("vi-VN")}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={16}
                  color={COLORS.WhiteRGBA75}
                />
                <Text style={styles.infoText}>{schedule.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="door"
                  size={16}
                  color={COLORS.WhiteRGBA75}
                />
                <Text style={styles.infoText}>{schedule.room?.name}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết vé</Text>
          <View style={styles.ticketCard}>
            {/* ... (Phần hiển thị ghế giữ nguyên code cũ) ... */}
            {seatDetails.regularSeats.length > 0 && (
              <View style={styles.ticketItem}>
                <View style={styles.ticketItemRow}>
                  <View style={styles.ticketItemLeft}>
                    <MaterialCommunityIcons
                      name="seat"
                      size={20}
                      color={COLORS.Green}
                    />
                    <Text style={styles.ticketItemTitle}>Ghế thường</Text>
                    <Text style={styles.ticketItemSeats}>
                      {seatDetails.regularSeats.join(", ")}
                    </Text>
                  </View>
                  <Text style={styles.ticketItemPrice}>
                    {(
                      seatDetails.regularSeats.length * seatDetails.regularPrice
                    ).toLocaleString("vi-VN")}
                    đ
                  </Text>
                </View>
              </View>
            )}
            {/* ... (Giữ nguyên phần hiển thị giá tiền) ... */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalAmount}>
                {totalPrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.card}>
            {/* Option: Tiền mặt */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "cash" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("cash")}
            >
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color={
                  paymentMethod === "cash" ? COLORS.Orange : COLORS.WhiteRGBA75
                }
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "cash" && styles.paymentTextActive,
                ]}
              >
                Tiền mặt
              </Text>
              {paymentMethod === "cash" && (
                <FontAwesome6
                  name="circle-check"
                  size={20}
                  color={COLORS.Orange}
                />
              )}
            </TouchableOpacity>

            {/* Option: MoMo (Disabled) */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "momo" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("momo")}
              disabled={true}
            >
              <MaterialCommunityIcons
                name="wallet"
                size={24}
                color={
                  paymentMethod === "momo" ? COLORS.Orange : COLORS.WhiteRGBA75
                }
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "momo" && styles.paymentTextActive,
                ]}
              >
                MoMo (Đang bảo trì)
              </Text>
            </TouchableOpacity>

            {/* Option: Bank Transfer (ENABLED) */}
            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "bank" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("bank")}
              disabled={false} // Đã bật
            >
              <MaterialCommunityIcons
                name="bank"
                size={24}
                color={
                  paymentMethod === "bank" ? COLORS.Orange : COLORS.WhiteRGBA75
                }
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "bank" && styles.paymentTextActive,
                ]}
              >
                Chuyển khoản (SePay)
              </Text>
              {paymentMethod === "bank" && (
                <FontAwesome6
                  name="circle-check"
                  size={20}
                  color={COLORS.Orange}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- KHU VỰC HIỂN THỊ QR CODE (CHỈ HIỆN KHI CHỌN BANK) --- */}
        {paymentMethod === "bank" && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: qrUrl }}
                style={styles.qrImage}
                resizeMode="contain"
              />
              {/* Loading overlay khi đang check */}
              {processing && (
                <View style={styles.qrLoadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.Orange} />
                </View>
              )}
            </View>
            <View style={styles.qrInstruction}>
              <Text style={styles.qrText}>
                Nội dung CK:{" "}
                <Text style={styles.qrCodeHighlight}>{orderCode}</Text>
              </Text>
              <Text style={styles.qrSubText}>
                Vui lòng giữ nguyên nội dung chuyển khoản
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <Text style={styles.payButtonText}>Đang kiểm tra...</Text>
          ) : (
            <>
              <MaterialCommunityIcons
                name={paymentMethod === "bank" ? "bank-check" : "check-circle"}
                size={20}
                color={COLORS.White}
              />
              <Text style={styles.payButtonText}>
                {paymentMethod === "bank"
                  ? "Tôi đã chuyển khoản"
                  : "Xác nhận thanh toán"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <InfoDialog
        visible={dialogVisible}
        type={dialogConfig.type}
        title={dialogConfig.title}
        message={dialogConfig.message}
        onClose={() => setDialogVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.Black },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.space_20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
    gap: SPACING.space_16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.DarkGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
  },
  content: { flex: 1 },
  scrollContent: { padding: SPACING.space_20 },
  section: { marginBottom: SPACING.space_24 },
  sectionTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginBottom: SPACING.space_12,
  },
  card: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    gap: SPACING.space_12,
  },
  movieCard: {
    flexDirection: "row",
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    gap: SPACING.space_16,
  },
  poster: { width: 80, height: 120, borderRadius: BORDER_RADIUS.radius_8 },
  movieInfo: { flex: 1, gap: SPACING.space_8 },
  movieTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: SPACING.space_8 },
  infoText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  ticketCard: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    gap: SPACING.space_16,
  },
  ticketItem: {
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_8,
    padding: SPACING.space_16,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  ticketItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
    flex: 1,
  },
  ticketItemTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  ticketItemSeats: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
    flex: 1,
  },
  ticketItemPrice: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.Orange,
  },
  totalContainer: {
    backgroundColor: COLORS.Orange + "15",
    borderRadius: BORDER_RADIUS.radius_8,
    padding: SPACING.space_20,
    borderWidth: 2,
    borderColor: COLORS.Orange + "40",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
  },
  totalAmount: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_28,
    color: COLORS.Orange,
  },

  // Payment Methods
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    padding: SPACING.space_16,
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_8,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  paymentOptionActive: {
    borderColor: COLORS.Orange,
    backgroundColor: COLORS.Orange + "10",
  },
  paymentText: {
    flex: 1,
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  paymentTextActive: { color: COLORS.White },

  // Styles MỚI cho phần QR Code
  qrSection: {
    marginBottom: SPACING.space_24,
    alignItems: "center",
    backgroundColor: COLORS.DarkGrey,
    padding: 20,
    borderRadius: BORDER_RADIUS.radius_12,
  },
  qrTitle: {
    color: COLORS.White,
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    marginBottom: 15,
  },
  qrContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  qrImage: { width: 200, height: 200 },
  qrLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  qrInstruction: { alignItems: "center" },
  qrText: {
    color: COLORS.White,
    fontSize: 16,
    fontFamily: FONT_FAMILY.poppins_regular,
  },
  qrCodeHighlight: { color: COLORS.Orange, fontWeight: "bold", fontSize: 18 },
  qrSubText: {
    color: COLORS.WhiteRGBA75,
    fontSize: 12,
    marginTop: 5,
    fontStyle: "italic",
  },

  // Bottom Bar
  bottomBar: {
    padding: SPACING.space_20,
    backgroundColor: COLORS.DarkGrey,
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA15,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_12,
    backgroundColor: COLORS.Orange,
    paddingVertical: SPACING.space_16,
    borderRadius: BORDER_RADIUS.radius_12,
  },
  payButtonDisabled: { backgroundColor: COLORS.WhiteRGBA25 },
  payButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
});

export default PaymentScreen;
