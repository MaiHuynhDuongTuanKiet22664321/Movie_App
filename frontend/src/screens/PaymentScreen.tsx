import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  COLORS,
  SPACING,
  FONT_FAMILY,
  FONT_SIZE,
  BORDER_RADIUS,
} from "../theme/theme";
import InfoDialog from "../components/InfoDialog";

const PaymentScreen = ({ navigation, route }: any) => {
  const { scheduleId, movieData, schedule, selectedSeats, totalPrice } = route.params;
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "momo" | "bank">("cash");
  const [processing, setProcessing] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    type: "success" as "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const basePrice = schedule.basePrice || 75000;
  
  const getSeatDetails = () => {
    const regularSeats = selectedSeats.filter((id: string) => id.charAt(0) !== "A");
    const vipSeats = selectedSeats.filter((id: string) => id.charAt(0) === "A");
    
    return {
      regularSeats,
      vipSeats,
      regularPrice: basePrice,
      vipPrice: Math.round(basePrice * 1.3),
    };
  };

  const seatDetails = getSeatDetails();

  const handlePayment = async () => {
    setProcessing(true);

    try {
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
          message: "Vé của bạn đã được đặt thành công!",
        });
        setDialogVisible(true);

        setTimeout(() => {
          navigation.navigate("Ticket", {
            ticketId: result.data._id,
            ticketData: result.data,
          });
        }, 2000);
      } else {
        throw new Error(result.message || "Đặt vé thất bại");
      }
    } catch (error: any) {
      console.error("Booking error:", error);
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
        {/* Movie Info */}
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
                <MaterialCommunityIcons name="calendar" size={16} color={COLORS.WhiteRGBA75} />
                <Text style={styles.infoText}>
                  {new Date(schedule.date).toLocaleDateString("vi-VN")}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.WhiteRGBA75} />
                <Text style={styles.infoText}>{schedule.time}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="door" size={16} color={COLORS.WhiteRGBA75} />
                <Text style={styles.infoText}>{schedule.room?.name}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ticket Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết vé</Text>
          <View style={styles.ticketCard}>
            {seatDetails.regularSeats.length > 0 && (
              <View style={styles.ticketItem}>
                <View style={styles.ticketItemRow}>
                  <View style={styles.ticketItemLeft}>
                    <MaterialCommunityIcons name="seat" size={20} color={COLORS.Green} />
                    <Text style={styles.ticketItemTitle}>Ghế thường</Text>
                    <Text style={styles.ticketItemSeats}>
                      {seatDetails.regularSeats.join(", ")}
                    </Text>
                  </View>
                  <Text style={styles.ticketItemPrice}>
                    {(seatDetails.regularSeats.length * seatDetails.regularPrice).toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              </View>
            )}
            {seatDetails.vipSeats.length > 0 && (
              <View style={styles.ticketItem}>
                <View style={styles.ticketItemRow}>
                  <View style={styles.ticketItemLeft}>
                    <MaterialCommunityIcons name="seat" size={20} color={COLORS.Yellow} />
                    <Text style={[styles.ticketItemTitle, styles.vipText]}>Ghế VIP</Text>
                    <Text style={[styles.ticketItemSeats, styles.vipText]}>
                      {seatDetails.vipSeats.join(", ")}
                    </Text>
                  </View>
                  <Text style={[styles.ticketItemPrice, styles.vipText]}>
                    {(seatDetails.vipSeats.length * seatDetails.vipPrice).toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalAmount}>
                {totalPrice.toLocaleString("vi-VN")}đ
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.card}>
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
                color={paymentMethod === "cash" ? COLORS.Orange : COLORS.WhiteRGBA75}
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
                <FontAwesome6 name="circle-check" size={20} color={COLORS.Orange} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "momo" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("momo")}
            >
              <MaterialCommunityIcons
                name="wallet"
                size={24}
                color={paymentMethod === "momo" ? COLORS.Orange : COLORS.WhiteRGBA75}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "momo" && styles.paymentTextActive,
                ]}
              >
                MoMo
              </Text>
              {paymentMethod === "momo" && (
                <FontAwesome6 name="circle-check" size={20} color={COLORS.Orange} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                paymentMethod === "bank" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("bank")}
            >
              <MaterialCommunityIcons
                name="bank"
                size={24}
                color={paymentMethod === "bank" ? COLORS.Orange : COLORS.WhiteRGBA75}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "bank" && styles.paymentTextActive,
                ]}
              >
                Chuyển khoản
              </Text>
              {paymentMethod === "bank" && (
                <FontAwesome6 name="circle-check" size={20} color={COLORS.Orange} />
              )}
            </TouchableOpacity>
          </View>
        </View>


      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <Text style={styles.payButtonText}>Đang xử lý...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.White} />
              <Text style={styles.payButtonText}>Xác nhận thanh toán</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.space_20,
  },
  section: {
    marginBottom: SPACING.space_24,
  },
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
  poster: {
    width: 80,
    height: 120,
    borderRadius: BORDER_RADIUS.radius_8,
  },
  movieInfo: {
    flex: 1,
    gap: SPACING.space_8,
  },
  movieTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
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
  vipText: {
    color: COLORS.Yellow,
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
  paymentTextActive: {
    color: COLORS.White,
  },

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
  payButtonDisabled: {
    backgroundColor: COLORS.WhiteRGBA25,
  },
  payButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
});

export default PaymentScreen;
