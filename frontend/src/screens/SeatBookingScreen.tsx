import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
import { JSX } from "react/jsx-runtime";

const SeatBookingScreen = ({ navigation, route }: any) => {
  const { scheduleId, movieData, schedule } = route.params;
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const seatIconSize = 32;
  const seatGap = 6;
  const aisleWidth = 20;

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const { roomApi } = await import("../api/adminApi");
      const { bookingApi } = await import("../api/bookingApi");
      
      // Fetch room seats
      const roomResult = await roomApi.getById(schedule.room._id);
      let roomSeats = roomResult.success && roomResult.data.sodoghe ? roomResult.data.sodoghe : [];
      
      // Fetch schedule details để lấy seatStatuses
      const scheduleResult = await bookingApi.getSchedule(scheduleId);
      const scheduleSeatStatuses = scheduleResult.success && scheduleResult.data.seatStatuses 
        ? scheduleResult.data.seatStatuses 
        : [];

      // Merge: update room seats status từ schedule
      const mergedSeats = roomSeats.map((roomSeat: any) => {
        const scheduleSeat = scheduleSeatStatuses.find(
          (s: any) => s.row === roomSeat.row && s.number === roomSeat.number
        );
        
        // Nếu có trong schedule và booked, update status từ schedule
        if (scheduleSeat && scheduleSeat.status === 'booked') {
          return { ...roomSeat, status: 'booked' };
        }
        return roomSeat;
      });

      setSeats(mergedSeats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeatId = (seat: any) => `${seat.row}${seat.number}`;

  const getSeatStatus = (seat: any): "selected" | "available" | "booked" => {
    const seatId = getSeatId(seat);
    if (selectedSeats.includes(seatId)) return "selected";
    if (seat.status === "booked") return "booked";
    return "available";
  };

  const getSeatColor = (status: string, isVIP: boolean = false) => {
    if (status === "booked") return COLORS.Red;
    if (status === "selected") return "#00D9FF"; // Cyan nổi bật
    return isVIP ? COLORS.Yellow : COLORS.Green;
  };

  const isVIPSeat = (seat: any) => seat.row === "A";

  const toggleSeat = (seatId: string, status: string) => {
    if (status === "booked" || status === "unavailable") return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const groupSeatsByRow = (): { [key: string]: any[] } => {
    const grouped: { [key: string]: any[] } = {};
    seats.forEach((seat: any) => {
      if (!grouped[seat.row]) {
        grouped[seat.row] = [];
      }
      grouped[seat.row].push(seat);
    });
    return grouped;
  };

  const renderSeat = (seat: any) => {
    const seatId = getSeatId(seat);
    const status = getSeatStatus(seat);
    const isVIP = isVIPSeat(seat);
    const isInteractive = status !== "booked";

    return (
      <TouchableOpacity
        key={seatId}
        disabled={!isInteractive}
        onPress={() => toggleSeat(seatId, status)}
        style={[styles.seatWrapper, { marginHorizontal: seatGap / 2 }]}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="seat"
          size={seatIconSize}
          color={getSeatColor(status, isVIP)}
        />
        <Text style={[styles.seatLabel, isVIP && styles.vipLabel]}>
          {seatId}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRow = (row: string, rowSeats: any[]): JSX.Element => {
    const sortedSeats = rowSeats.sort((a: any, b: any) => a.number - b.number);
    const isVIP = row === "A";
    const seats : any = [];
    
    // Render ghế với lối đi ở giữa
    sortedSeats.forEach((seat, index) => {
      seats.push(renderSeat(seat));
      
      // Thêm lối đi sau ghế số 3 (giữa hàng)
      if (seat.number === 3) {
        seats.push(
          <View key={`aisle-${row}`} style={{ width: aisleWidth }}>
            <Text style={styles.aisleText}>|</Text>
          </View>
        );
      }
    });

    return (
      <View key={row} style={styles.row}>
        <View style={[styles.rowLabel, isVIP && styles.vipRowLabel]}>
          <Text style={[styles.rowLabelText, isVIP && styles.vipRowLabelText]}>
            {row}
          </Text>
        </View>
        <View style={styles.seatsContainer}>{seats}</View>
      </View>
    );
  };

  const calculateTotal = () => {
    const basePrice = schedule.basePrice || 75000;
    let total = 0;
    
    selectedSeats.forEach((seatId) => {
      const row = seatId.charAt(0);
      const isVIP = row === "A";
      total += isVIP ? basePrice * 1.3 : basePrice;
    });
    
    return Math.round(total);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một ghế");
      return;
    }

    navigation.navigate("Payment", {
      scheduleId,
      movieData,
      schedule,
      selectedSeats,
      totalPrice: calculateTotal(),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );
  }

  const groupedSeats = groupSeatsByRow();
  const rows = Object.keys(groupedSeats).sort();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={20} color={COLORS.White} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {movieData.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {new Date(schedule.date).toLocaleDateString("vi-VN")} • {schedule.time} • {schedule.room?.name}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen */}
        <View style={styles.screenContainer}>
          <View style={styles.screen}>
            <MaterialCommunityIcons name="television" size={20} color={COLORS.WhiteRGBA50} />
            <Text style={styles.screenText}>MÀN HÌNH</Text>
          </View>
        </View>

        {/* Seat Map */}
        <View style={styles.seatMapContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.seatMapScroll}
          >
            <View style={styles.seatsGrid}>
              {rows.map((row) => renderRow(row, groupedSeats[row]))}
            </View>
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color={COLORS.Green} />
            <Text style={styles.legendText}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color={COLORS.Yellow} />
            <Text style={styles.legendText}>VIP</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color="#00D9FF" />
            <Text style={styles.legendText}>Đã chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color={COLORS.Red} />
            <Text style={styles.legendText}>Đã đặt</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>
            Ghế: <Text style={styles.priceValue}>
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "Chưa chọn"}
            </Text>
          </Text>
          <Text style={styles.totalLabel}>
            Tổng: <Text style={styles.totalValue}>
              {calculateTotal().toLocaleString("vi-VN")}đ
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedSeats.length === 0 && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
          <FontAwesome6 name="arrow-right" size={16} color={COLORS.White} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  headerSubtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.space_20,
  },
  screenContainer: {
    alignItems: "center",
    marginBottom: SPACING.space_24,
  },
  screen: {
    width: "85%",
    paddingVertical: SPACING.space_12,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_8,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.Orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_8,
  },
  screenText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
    letterSpacing: 3,
  },
  seatMapContainer: {
    width: "100%",
    marginBottom: SPACING.space_24,
  },
  seatMapScroll: {
    paddingHorizontal: SPACING.space_16,
  },
  seatsGrid: {
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.space_10,
  },
  rowLabel: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.space_12,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_8,
  },
  rowLabelText: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.Orange,
  },
  vipRowLabel: {
    backgroundColor: COLORS.Yellow + "20",
    borderWidth: 1,
    borderColor: COLORS.Yellow + "40",
  },
  vipRowLabelText: {
    color: COLORS.Yellow,
  },
  seatsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  seatWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  seatLabel: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_8,
    color: COLORS.WhiteRGBA75,
    marginTop: 2,
  },
  vipLabel: {
    color: COLORS.Yellow,
  },
  aisleText: {
    fontFamily: FONT_FAMILY.poppins_thin,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA25,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: SPACING.space_16,
    paddingVertical: SPACING.space_16,
    paddingHorizontal: SPACING.space_12,
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
  legendText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  bottomBar: {
    padding: SPACING.space_20,
    backgroundColor: COLORS.DarkGrey,
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA15,
    gap: SPACING.space_16,
  },
  priceInfo: {
    gap: SPACING.space_8,
  },
  priceLabel: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  priceValue: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  totalLabel: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  totalValue: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.Orange,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_12,
    backgroundColor: COLORS.Orange,
    paddingVertical: SPACING.space_16,
    borderRadius: BORDER_RADIUS.radius_12,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.WhiteRGBA25,
  },
  continueButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
});

export default SeatBookingScreen;
