import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { BORDER_RADIUS, COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../theme/theme";
import { LinearGradient } from "expo-linear-gradient";
import MovieDetailsHeader from "../components/MovieDetailsHeader";
import { useState } from "react";
import Toast from "react-native-toast-message";
import momo from "../assets/image/momo.jpg";

// Import components
import PaymentMethodItem from "../components/PaymentMethodItem";
import SaveInfoCheckbox from "../components/SaveInfoCheckbox";
import MoMoQRPayment from "../components/MoMoQRPayment";
import CardPaymentForm from "../components/CardPaymentForm";

const PaymentScreen = ({ navigation, route }: any) => {
  const { PosterImage, seatArray, time, date, price ,nameMovie} = route.params;
  const [saveInfo, setSaveInfo] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);

  const paymentMethods = [
    {
      id: "momo",
      name: "Ví MoMo",
      image: momo,
      description: "Thanh toán qua ví điện tử MoMo",
    },
    {
      id: "card",
      name: "Thẻ tín dụng/ghi nợ",
      image: null,
      description: "Visa, Mastercard, JCB",
    },
    {
      id: "banking",
      name: "Internet Banking",
      image: null,
      description: "Chuyển khoản ngân hàng trực tuyến",
    },
  ];

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId);
    setShowPaymentDetail(false);
  };

  const handleContinue = () => {
    if (!selectedPayment) {
      Toast.show({
        type: "error",
        text1: "Vui lồng chọn phương thức thanh toán",
      });
      return;
    }

    if (selectedPayment === "momo" || selectedPayment === "card") {
      setShowPaymentDetail(true);
    } else {
      Toast.show({
        type: "error",
        text1: "Chức năng đang được phát triển",
      });
    }
  };

  const handleBackToSelection = () => {
    setShowPaymentDetail(false);
  };

  return (
    <SafeAreaView style={styles.safeAreaViewcontainer}>
      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar hidden />

        {/* Header + background */}
        <View>
          <ImageBackground
            source={{ uri: PosterImage }}
            resizeMode="cover"
            style={styles.imageBG}
          >
            <LinearGradient
              colors={[COLORS.BlackRGB10, COLORS.Black]}
              style={styles.linearGradient}
            >
              <View style={styles.appHeaderContainer}>
                <MovieDetailsHeader
                  nameIcon="close-circle-outline"
                  header=""
                  action={() => navigation.goBack()}
                />
                <View style={styles.movieNameContainer}>
                  <Text style={styles.movieNameText}>{nameMovie.toString()}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>

          {!showPaymentDetail ? (
            <>
              {/* Payment options */}
              <View style={styles.paymentContainer}>
                <Text style={styles.title}>Phương thức thanh toán</Text>

                <View style={styles.paymentMethodsList}>
                  {paymentMethods.map((method) => (
                    <PaymentMethodItem
                      key={method.id}
                      method={method}
                      isSelected={selectedPayment === method.id}
                      onSelect={handlePaymentSelect}
                    />
                  ))}
                </View>
              </View>

              {/* Checkbox */}
              <SaveInfoCheckbox value={saveInfo} onValueChange={setSaveInfo} />

              {/* Continue Button */}
              <View style={styles.continueButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    !selectedPayment && styles.continueButtonDisabled,
                  ]}
                  onPress={handleContinue}
                  disabled={!selectedPayment}
                >
                  <Text style={styles.continueButtonText}>
                    Tiếp tục thanh toán
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Payment Detail Screens */}
              {selectedPayment === "momo" && (
                <MoMoQRPayment
                  amount={price}
                  onBack={handleBackToSelection}
                  navigation={navigation}
                  route={route}
                  seatArray={seatArray}
                  time={time}
                  date={date}
                  PosterImage={PosterImage}
                />
              )}
              {selectedPayment === "card" && (
                <CardPaymentForm
                  amount={price}
                  onBack={handleBackToSelection}
                  navigation={navigation}
                  route={route}
                  seatArray={seatArray}
                  time={time}
                  date={date}
                  PosterImage={PosterImage}
                />
              )}
            </>
          )}

          {/* Security Info */}
          <View style={styles.securityContainer}>
            <Text style={styles.securityText}>
              🔒 Được bảo mật bởi SSL 256-bit =)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  safeAreaViewcontainer: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  imageBG: {
    width: "100%",
    aspectRatio: 3072 / 1727,
  },
  linearGradient: {
    height: "100%",
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_10 * 4,
  },
  paymentContainer: {
    padding: SPACING.space_16,
    paddingTop: SPACING.space_24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: SPACING.space_16,
    color: COLORS.Orange,
  },
  paymentMethodsList: {
    gap: SPACING.space_12,
  },
  continueButtonContainer: {
    margin: SPACING.space_16,
    marginTop: SPACING.space_24,
  },
  continueButton: {
    backgroundColor: COLORS.Orange,
    paddingVertical: SPACING.space_16,
    borderRadius: SPACING.space_12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.WhiteRGBA10,
  },
  continueButtonText: {
    color: COLORS.White,
    fontSize: 16,
    fontWeight: "600",
  },
  securityContainer: {
    alignItems: "center",
    marginBottom: SPACING.space_24,
    paddingHorizontal: SPACING.space_16,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.WhiteRGBA50,
  },
  movieNameText:{
    fontSize: FONT_SIZE.size_40,
    fontFamily: FONT_FAMILY.poppins_regular,
    color: COLORS.White,
    textAlign: "center",
  },
  movieNameContainer: {
    marginTop: SPACING.space_24,
  },
});
