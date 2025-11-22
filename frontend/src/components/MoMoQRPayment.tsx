import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../theme/theme";
import Toast from "react-native-toast-message";
import QRCode from "react-native-qrcode-svg";


const MoMoQRPayment = ({
  amount,
  onBack,
  navigation,
  route,
  seatArray,
  time,
  date,
  PosterImage,
  nameMovie
}: any) => {
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);


  useEffect(() => {
    if (date) {
      console.log("Date provided:", date);
    } else {
      console.warn("Warning: Date not provided to MoMoQRPayment");
    }
    // Simulate QR code generation
    const timer = setTimeout(() => {
      setQrCodeGenerated(true);
      Toast.show({
        type: "success",
        text1: "Thanh toán thanh cong",
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.paymentDetailContainer}>
      <Text style={styles.detailTitle}>Thanh toán MoMo</Text>

      <View style={styles.qrContainer}>
        <View style={styles.qrCodeBox}>
          {qrCodeGenerated ? (
            <View style={styles.qrCode}>
              <QRCode value="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=HelloWorld" size={200} />
            </View>
          ) : (
            <Text style={styles.generatingText}>Đang tạo mã QR...</Text>
          )}
        </View>

        <Text style={styles.qrInstruction}>
          Mở ứng dụng MoMo và quét mã QR để thanh toán
        </Text>

        <View style={styles.paymentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền:</Text>
            <Text style={styles.infoValue}>{amount} $</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nội dung:</Text>
            <Text style={styles.infoValue}>Thanh toán vé xem phim</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày xem:</Text>
            <Text style={styles.infoValue}>{date.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian xem:</Text>
            <Text style={styles.infoValue}>{time.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ghế:</Text>
            <Text style={styles.infoValue}>
              <Text style={styles.infoValue}>{seatArray.join(", ")}</Text>
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          navigation.navigate("Tab", {
            screen: "Ticket",
            params: {
              seatArray: seatArray,
              time: time,
              date: date,
              PosterImage: PosterImage,
              price: amount,
              nameMovie:nameMovie
            },
          });
        }}
      >
        <Text style={styles.scanButtonText}>Quét mã QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  paymentDetailContainer: {
    margin: SPACING.space_16,
    padding: SPACING.space_20,
    backgroundColor: COLORS.BlackRGB5,
    borderRadius: SPACING.space_15,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.White,
    marginBottom: SPACING.space_20,
    textAlign: "center",
  },
  qrContainer: {
    alignItems: "center",
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.White,
    borderRadius: SPACING.space_12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.space_16,
  },
  qrCode: {
    alignItems: "center",
  },
  qrText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.Black,
  },
  qrSubText: {
    fontSize: 14,
    color: COLORS.Black,
    marginTop: 4,
  },
  generatingText: {
    fontSize: 16,
    color: COLORS.Black,
  },
  qrInstruction: {
    fontSize: 14,
    color: COLORS.White,
    textAlign: "center",
    marginBottom: SPACING.space_20,
    lineHeight: 20,
  },
  paymentInfo: {
    width: "100%",
    backgroundColor: COLORS.Grey,
    borderRadius: SPACING.space_10,
    padding: SPACING.space_16,
    marginBottom: SPACING.space_16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.space_8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.WhiteRGBA75,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.White,
  },
  scanButton: {
    backgroundColor: COLORS.Orange,
    paddingVertical: SPACING.space_12,
    borderRadius: SPACING.space_10,
    alignItems: "center",
    marginBottom: SPACING.space_16,
  },
  scanButtonText: {
    color: COLORS.White,
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    backgroundColor: COLORS.Grey,
    paddingVertical: SPACING.space_12,
    borderRadius: SPACING.space_10,
    alignItems: "center",
  },
  backButtonText: {
    color: COLORS.White,
    fontSize: 14,
    fontWeight: "500",
  },
  runtimeText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
});

export default MoMoQRPayment;
