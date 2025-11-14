import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING, BORDER_RADIUS } from "../theme/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export enum RoomSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export const ROOM_CONFIGS = {
  [RoomSize.SMALL]: {
    rows: 4,
    seatsPerRow: 6,
    name: "Phòng Nhỏ",
    description: "24 ghế (4 hàng × 6 ghế)",
    aisleAfter: [3], // [3] | [3]
    layout: "vip",
    vipSeats: [1, 2, 3, 4, 5, 6], // Tất cả ghế hàng A
  },
  [RoomSize.MEDIUM]: {
    rows: 5,
    seatsPerRow: 6,
    name: "Phòng Trung Bình",
    description: "30 ghế (5 hàng × 6 ghế)",
    aisleAfter: [2], // [2] | [4]
    layout: "vip",
    vipSeats: [1, 2, 3, 4, 5, 6], // Tất cả ghế hàng A
  },
  [RoomSize.LARGE]: {
    rows: 7,
    seatsPerRow: 6,
    name: "Phòng Lớn",
    description: "40 ghế (A: 4 VIP, B-G: 6 ghế/hàng)",
    aisleAfter: [3], // [3] | [3]
    layout: "vip",
    vipSeats: [2, 3, 4, 5], // Hàng A: chỉ 4 ghế VIP ở giữa
  },
};

interface SeatMapPreviewProps {
  roomSize: RoomSize;
  bookedSeats?: string[];
  selectedSeats?: string[];
  onSeatPress?: (seatId: string) => void;
  showLabels?: boolean;
  compact?: boolean;
}

const SeatMapPreview: React.FC<SeatMapPreviewProps> = ({
  roomSize,
  bookedSeats = [],
  selectedSeats = [],
  onSeatPress,
  showLabels = true,
  compact = false,
}) => {
  const config = ROOM_CONFIGS[roomSize];
  const seatIconSize = compact ? 20 : 28;
  const seatGap = compact ? 4 : 6;
  const aisleWidth = compact ? 12 : 16;

  const getSeatStatus = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return "booked";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const getSeatColor = (status: string, isVIP: boolean = false) => {
    // Nếu có onSeatPress (user booking) - dùng màu cũ
    if (onSeatPress) {
      if (status === "booked") return COLORS.Grey;
      if (status === "selected") return COLORS.Orange;
      return isVIP ? COLORS.Yellow : COLORS.WhiteRGBA50;
    }
    
    // Nếu không có onSeatPress (admin view) - dùng xanh/đỏ
    if (status === "booked") return COLORS.Red; // Đã đặt = đỏ
    return isVIP ? COLORS.Yellow : COLORS.Green; // Còn trống = xanh, VIP = vàng
  };

  const isVIPRow = (rowIndex: number) => {
    // Hàng A (index 0) luôn là VIP
    return rowIndex === 0;
  };

  const renderSeat = (row: string, number: number, rowIndex: number) => {
    const seatId = `${row}${number}`;
    const status = getSeatStatus(seatId);
    const isInteractive = onSeatPress && status !== "booked";
    const isVIP = isVIPRow(rowIndex);

    return (
      <TouchableOpacity
        key={seatId}
        disabled={!isInteractive}
        onPress={() => isInteractive && onSeatPress(seatId)}
        style={[styles.seatWrapper, { marginHorizontal: seatGap / 2 }]}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="seat"
          size={seatIconSize}
          color={getSeatColor(status, isVIP)}
        />
        {!compact && (
          <Text style={[styles.seatLabel, isVIP && styles.vipLabel]}>
            {row}{number}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const shouldRenderSeat = (rowIndex: number, seatNumber: number) => {
    // Nếu là hàng VIP và có config vipSeats, chỉ render ghế trong danh sách
    if (isVIPRow(rowIndex) && config.vipSeats) {
      return config.vipSeats.includes(seatNumber);
    }
    return true;
  };

  const renderRow = (rowIndex: number) => {
    const rowLetter = String.fromCharCode(65 + rowIndex);
    const seats = [];
    const isVIP = isVIPRow(rowIndex);
    
    for (let i = 1; i <= config.seatsPerRow; i++) {
      if (shouldRenderSeat(rowIndex, i)) {
        seats.push(renderSeat(rowLetter, i, rowIndex));
      } else {
        // Render khoảng trống thay vì ghế
        seats.push(
          <View key={`empty-${i}`} style={[styles.seatWrapper, { marginHorizontal: seatGap / 2 }]}>
            <View style={{ width: seatIconSize, height: seatIconSize }} />
          </View>
        );
      }
      
      // Thêm lối đi (aisle) sau các cột được chỉ định
      if (config.aisleAfter.includes(i)) {
        seats.push(
          <View key={`aisle-${i}`} style={{ width: aisleWidth }}>
            <Text style={styles.aisleText}>|</Text>
          </View>
        );
      }
    }

    return (
      <View key={rowLetter} style={styles.row}>
        {showLabels && (
          <View style={[styles.rowLabel, isVIP && styles.vipRowLabel]}>
            <Text style={[styles.rowLabelText, isVIP && styles.vipRowLabelText]}>
              {rowLetter}
            </Text>
          </View>
        )}
        <View style={styles.seatsContainer}>
          {seats}
        </View>
      </View>
    );
  };

  const rows = [];
  for (let i = 0; i < config.rows; i++) {
    rows.push(renderRow(i));
  }

  return (
    <View style={styles.container}>
      {/* Screen */}
      <View style={styles.screenContainer}>
        <View style={styles.screen}>
          <MaterialCommunityIcons name="television" size={18} color={COLORS.WhiteRGBA50} />
          <Text style={styles.screenText}>MÀN HÌNH</Text>
        </View>
      </View>

      {/* Seats */}
      <View style={styles.seatsScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.seatsGrid}>
            {rows}
          </View>
        </ScrollView>
      </View>

      {/* Legend - chỉ hiển thị khi có tương tác (user booking) */}
      {!compact && onSeatPress && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color={COLORS.WhiteRGBA50} />
            <Text style={styles.legendText}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color={COLORS.Orange} />
            <Text style={styles.legendText}>Đã chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color={COLORS.Grey} />
            <Text style={styles.legendText}>Đã đặt</Text>
          </View>
          <View style={styles.legendItem}>
            <MaterialCommunityIcons name="seat" size={20} color={COLORS.Yellow} />
            <Text style={styles.legendText}>VIP</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  screenContainer: {
    alignItems: "center",
    marginBottom: SPACING.space_20,
  },
  seatsScrollContainer: {
    width: "100%",
  },
  screen: {
    width: "85%",
    paddingVertical: SPACING.space_10,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_8,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.Orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_8,
    shadowColor: COLORS.Orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  screenText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.White,
    letterSpacing: 3,
  },
  scrollContent: {
    paddingHorizontal: SPACING.space_16,
    paddingVertical: SPACING.space_12,
  },
  seatsGrid: {
    alignItems: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.space_8,
  },
  rowLabel: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.space_8,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_8,
  },
  rowLabelText: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Orange,
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
  vipRowLabel: {
    backgroundColor: COLORS.Yellow + "20",
    borderWidth: 1,
    borderColor: COLORS.Yellow + "40",
  },
  vipRowLabelText: {
    color: COLORS.Yellow,
  },
  aisleText: {
    fontFamily: FONT_FAMILY.poppins_thin,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA25,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.space_16,
    marginTop: SPACING.space_16,
    paddingTop: SPACING.space_16,
    paddingHorizontal: SPACING.space_12,
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: BORDER_RADIUS.radius_4,
  },
  legendText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
});

export default SeatMapPreview;
