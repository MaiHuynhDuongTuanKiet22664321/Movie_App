import React, { useState, useMemo, useEffect } from "react";
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
import { 
  ArrowLeft, 
  Clock, 
  DoorOpen, 
  Armchair, 
  CreditCard, 
  Banknote, 
  Wallet, 
  Check,
  Calendar
} from "lucide-react-native";
import { getToken } from "../utils/storage";
import {
  COLORS,
  SPACING,
  FONT_FAMILY,
  FONT_SIZE,
  BORDER_RADIUS,
} from "../theme/theme";
import InfoDialog from "../components/InfoDialog";

const PaymentScreen = ({ navigation, route }: any) => {
  const { scheduleId, movieData, schedule, selectedSeats, totalPrice } =
    route.params;

  // State
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "bank">(
    "cash"
  );
  const [processing, setProcessing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [sepayConfig, setSepayConfig] = useState<{
    bankAccount: string;
    bankId: string;
  } | null>(null);
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
  const qrUrl = sepayConfig 
    ? `https://qr.sepay.vn/img?acc=${sepayConfig.bankAccount}&bank=${sepayConfig.bankId}&amount=${totalPrice}&des=${orderCode}`
    : null;

  // Log QR URL generation
  useEffect(() => {
    if (qrUrl && sepayConfig) {
      console.log('🏦 [SePay] QR URL generated:', qrUrl);
      console.log('🏦 [SePay] QR components:', {
        account: sepayConfig.bankAccount,
        bank: sepayConfig.bankId,
        amount: totalPrice,
        description: orderCode
      });
    }
  }, [qrUrl, sepayConfig, totalPrice, orderCode]);

  // Fetch SePay config from backend
  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        console.log('🏦 [SePay] Starting payment config fetch...');
        
        const token = await getToken();
        console.log('🏦 [SePay] Token retrieved:', token ? '✅' : '❌');
        
        const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://movie-ticket-xncx.onrender.com';
        const response = await fetch(`${BASE_URL}/api/bookings/payment/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('🏦 [SePay] Config fetch response status:', response.status);
        
        const data = await response.json();
        console.log('🏦 [SePay] Config fetch response:', data);
        
        if (data.success) {
          setSepayConfig(data.data);
          console.log('🏦 [SePay] Config set successfully:', {
            bankAccount: data.data.bankAccount,
            bankId: data.data.bankId
          });
        } else {
          console.error('🏦 [SePay] Config fetch failed:', data.message);
        }
      } catch (error) {
        console.error('🏦 [SePay] Config fetch error:', error);
      }
    };
    
    fetchPaymentConfig();
  }, []);

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
      console.log('🏦 [SePay] Starting transaction check...');
      console.log('🏦 [SePay] Check data:', { orderCode, totalPrice });
      
      // Lấy token từ storage utility (hỗ trợ cả native và web)
      const token = await getToken();
      console.log('🏦 [SePay] Token for transaction check:', token ? '✅' : '❌');
      
      if (!token) {
        console.error('🏦 [SePay] No auth token found');
        setDialogConfig({
          type: "error",
          title: "Lỗi xác thực",
          message: "Vui lòng đăng nhập lại",
        });
        setDialogVisible(true);
        return null;
      }
      
      // Gọi backend endpoint để kiểm tra
      const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://movie-ticket-xncx.onrender.com';
      const checkUrl = `${BASE_URL}/api/bookings/payment/check`;
      console.log('🏦 [SePay] Checking transaction at:', checkUrl);
      
      const response = await fetch(checkUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderCode,
          totalPrice,
        }),
      });

      console.log('🏦 [SePay] Transaction check response status:', response.status);
      console.log('🏦 [SePay] Transaction check response ok:', response.ok);

      const data = await response.json();
      console.log('🏦 [SePay] Transaction check response data:', data);
      
      if (data.success) {
        console.log('🏦 [SePay] Transaction check result isPaid:', data.isPaid);
        return data.isPaid; // true, false, hoặc null
      }
      
      console.error('🏦 [SePay] Transaction check failed:', data.message);
      return null; // Lỗi
    } catch (error) {
      console.error('🏦 [SePay] Transaction check error:', error);
      return null; // Lỗi
    }
  };

  // --- HÀM XỬ LÝ THANH TOÁN CHÍNH ---
  const handlePayment = async () => {
    console.log('🏦 [SePay] ===== STARTING PAYMENT PROCESS =====');
    console.log('🏦 [SePay] Payment method:', paymentMethod);
    console.log('🏦 [SePay] Payment data:', {
      scheduleId,
      selectedSeats,
      totalPrice,
      orderCode
    });
    
    setProcessing(true);

    try {
      // 1. Validation cơ bản
      if (!scheduleId || !selectedSeats.length || !totalPrice) {
        console.error('🏦 [SePay] Validation failed - missing data');
        throw new Error("Thông tin đặt vé không hợp lệ");
      }

      // 2. Xử lý riêng cho Chuyển khoản Ngân hàng
      if (paymentMethod === "bank") {
        console.log('🏦 [SePay] Processing bank payment method...');
        const isPaid = await checkSePayTransaction();

        console.log('🏦 [SePay] Transaction check result:', isPaid);

        // isPaid = true: Đã thanh toán
        // isPaid = false: Chưa thanh toán
        // isPaid = null: Không xác định được (lỗi API)
        if (isPaid === false) {
          console.log('🏦 [SePay] Payment not received - showing warning');
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
          console.log('🏦 [SePay] API error - unable to check payment');
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

        console.log('🏦 [SePay] Payment verified - proceeding with booking');
        // isPaid = true: Tiếp tục đặt vé
      }

      // 3. Gọi API Đặt vé (Cho cả Cash và Bank đã thanh toán thành công)
      console.log('🏦 [SePay] Creating booking...');
      const { bookingApi } = await import("../api/bookingApi");

      const result = await bookingApi.createBooking({
        scheduleId,
        selectedSeats,
        totalPrice,
        paymentMethod,
      });

      console.log('🏦 [SePay] Booking result:', result);

      if (result.success) {
        console.log('🏦 [SePay] ===== PAYMENT SUCCESS =====');
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
        console.error('🏦 [SePay] Booking failed:', result.message);
        throw new Error(result.message || "Đặt vé thất bại");
      }
    } catch (error: any) {
      console.error('🏦 [SePay] Payment process error:', error);
      setDialogConfig({
        type: "error",
        title: "Lỗi",
        message: error.message || "Không thể đặt vé. Vui lòng thử lại!",
      });
      setDialogVisible(true);
    } finally {
      setProcessing(false);
      console.log('🏦 [SePay] ===== PAYMENT PROCESS ENDED =====');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={COLORS.White} />
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
                <Calendar size={16} color={COLORS.WhiteRGBA75} />
                <Text style={styles.infoText}>
                  {new Date(schedule.date).toLocaleDateString("vi-VN")}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Clock size={16} color={COLORS.WhiteRGBA75} />
                <Text style={styles.infoText}>{schedule.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <DoorOpen size={16} color={COLORS.WhiteRGBA75} />
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
                    <Armchair size={20} color={COLORS.Green} />
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
              <Banknote
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
                <Check size={20} color={COLORS.Orange} />
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
              <Wallet
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
              <CreditCard
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
                <Check size={20} color={COLORS.Orange} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* --- KHU VỰC HIỂN THỊ QR CODE (CHỈ HIỆN KHI CHỌN BANK) --- */}
        {paymentMethod === "bank" && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Quét mã để thanh toán</Text>
            <View style={styles.qrContainer}>
              {qrUrl ? (
                <Image
                  source={{ uri: qrUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.qrImage, styles.qrPlaceholder]}>
                  <ActivityIndicator size="large" color={COLORS.Orange} />
                  <Text style={styles.qrPlaceholderText}>Đang tải mã QR...</Text>
                </View>
              )}
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
              <Check size={20} color={COLORS.White} />
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
  qrPlaceholder: {
    backgroundColor: COLORS.DarkGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    color: COLORS.White,
    marginTop: 10,
    fontSize: 12,
  },
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
