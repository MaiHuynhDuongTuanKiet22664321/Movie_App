import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { COLORS, SPACING } from "../theme/theme";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Toast from "react-native-toast-message";

const CardPaymentForm = ({ amount, onBack, navigation, route , seatArray, time, date, PosterImage }: any) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(" ") : cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text.replace(/\s/g, ""));
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
  };

  const handlePayment = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Toast.show({
        type: "error",
        text1: "Vui lòng điền đày đủ thông tin thẻ",
      });
      return;
    }
    Toast.show({
      type: "success",
      text1: "Thanh toán thanh cong",
    });
  };

  return (
    <View style={styles.paymentDetailContainer}>
      <Text style={styles.detailTitle}>Thông tin thẻ</Text>

      <View style={styles.cardForm}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Số thẻ</Text>
          <TextInput
            style={styles.textInput}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={COLORS.WhiteRGBA50}
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
          <TextInput
            style={styles.textInput}
            placeholder="NGUYEN VAN A"
            placeholderTextColor={COLORS.WhiteRGBA50}
            value={cardName}
            onChangeText={setCardName}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Ngày hết hạn</Text>
            <TextInput
              style={styles.textInput}
              placeholder="MM/YY"
              placeholderTextColor={COLORS.Black}
              value={expiryDate}
              onChangeText={handleExpiryChange}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.textInput}
              placeholder="123"
              placeholderTextColor={COLORS.WhiteRGBA50}
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.cardTypes}>
          <Text style={styles.acceptedCards}>Thẻ được chấp nhận:</Text>
          <View style={styles.cardTypesList}>
            <Text style={styles.cardTypeIcon}>
              <FontAwesome5 name="cc-visa" size={24} color="black" />
            </Text>
            <Text style={styles.cardTypeIcon}>
              <FontAwesome5 name="cc-mastercard" size={24} color="black" />
            </Text>
            <Text style={styles.cardTypeIcon}>
              <FontAwesome5 name="cc-jcb" size={24} color="black" />
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.payButton}
        onPress={() => {
          navigation.navigate("Tab",{
            screen: "Ticket",
            params: {
            seatArray: seatArray,
            time: time,
            date: date,
            PosterImage: PosterImage,
            price: amount
            }
          })
          handlePayment();
        }}
      >
        <Text style={styles.payButtonText}>Thanh toán {amount} $</Text>
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
    backgroundColor: COLORS.Grey,
    borderRadius: SPACING.space_15,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.White,
    marginBottom: SPACING.space_20,
    textAlign: "center",
  },
  cardForm: {
    marginBottom: SPACING.space_20,
  },
  inputGroup: {
    marginBottom: SPACING.space_16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.Black,
    marginBottom: SPACING.space_8,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: COLORS.Grey,
    borderRadius: SPACING.space_10,
    paddingHorizontal: SPACING.space_16,
    paddingVertical: SPACING.space_12,
    fontSize: 16,
    color: COLORS.White,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA10,
  },
  row: {
    flexDirection: "row",
  },
  cardTypes: {
    marginTop: SPACING.space_12,
  },
  acceptedCards: {
    fontSize: 12,
    color: COLORS.WhiteRGBA75,
    marginBottom: SPACING.space_8,
  },
  cardTypesList: {
    flexDirection: "row",
    gap: SPACING.space_8,
  },
  cardTypeIcon: {
    fontSize: 16,
  },
  payButton: {
    backgroundColor: COLORS.Orange,
    paddingVertical: SPACING.space_16,
    borderRadius: SPACING.space_12,
    alignItems: "center",
    marginBottom: SPACING.space_16,
  },
  payButtonText: {
    color: COLORS.White,
    fontSize: 16,
    fontWeight: "600",
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
});

export default CardPaymentForm;
