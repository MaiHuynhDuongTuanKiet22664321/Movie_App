import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import * as SecureStore from "expo-secure-store";

import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import MovieDetailsHeader from "../components/MovieDetailsHeader";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";

const TicketScreen = ({ navigation, route }: any) => {
  const [ticketData, setTicketData] = useState<any>(null);

  // 🔹 Khi mở màn hình: lấy ticket trong storage
  useEffect(() => {
    (async () => {
      try {
        const ticket = await SecureStore.getItemAsync("ticket");
        if (ticket) {
          setTicketData(JSON.parse(ticket));
        }
      } catch (error) {
        console.error("Something went wrong while getting ticket:", error);
      }
    })();
  }, []);

  // 🔹 Khi có route.params mới: set state và lưu xuống storage
  useEffect(() => {
    if (route.params) {
      setTicketData(route.params);
      (async () => {
        try {
          await SecureStore.setItemAsync(
            "ticket",
            JSON.stringify(route.params)
          );
        } catch (error) {
          console.error("Something went wrong while saving ticket:", error);
        }
      })();
    }
  }, [route.params]);

  // 🔹 Nếu chưa có dữ liệu ticket
  if (!ticketData) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.appHeaderContainer}>
          <MovieDetailsHeader
            nameIcon="close-circle-outline"
            header=""
            action={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.appHeaderContainer}>
          <MovieDetailsHeader
            nameIcon="close-circle-outline"
            header={"My Tickets"}
            action={() => navigation.goBack()}
          />
        </View>

        <View style={styles.ticketContainer}>
          <ImageBackground
            source={{ uri: ticketData?.PosterImage }}
            resizeMode="cover"
            style={styles.ticketBGImage}
          >
            <LinearGradient
              colors={[COLORS.OrangeRGBBA0, COLORS.Orange]}
              style={styles.linearGradient}
            >
              <View
                style={[
                  styles.blackCircle,
                  { position: "absolute", bottom: -40, left: -40 },
                ]}
              />
              <View
                style={[
                  styles.blackCircle,
                  { position: "absolute", bottom: -40, right: -40 },
                ]}
              />
            </LinearGradient>
          </ImageBackground>

          <View style={styles.linear}></View>

          <View style={styles.ticketFooter}>
            <View
              style={[
                styles.blackCircle,
                { position: "absolute", top: -40, left: -40 },
              ]}
            />
            <View
              style={[
                styles.blackCircle,
                { position: "absolute", top: -40, right: -40 },
              ]}
            />

            {/* Ngày chiếu */}
            <View style={styles.ticketDateContainer}>
              <View style={styles.subtitleContainer}>
                <Text style={styles.dateTitle}>
                  {ticketData?.date?.date || ""}
                </Text>
                <Text style={styles.subtitle}>
                  {ticketData?.date?.day || ""}
                </Text>
              </View>
              <View style={styles.subtitleContainer}>
                <FontAwesome6
                  name="clock"
                  size={24}
                  color="white"
                />
                <Text style={styles.subtitle}>{ticketData?.time || ""}</Text>
              </View>
            </View>

            {/* Ghế */}
            <View style={styles.ticketSeatContainer}>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Hall</Text>
                <Text style={styles.subtitle}>02</Text>
              </View>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Row</Text>
                <Text style={styles.subtitle}>04</Text>
              </View>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subheading}>Seats</Text>
                <Text style={styles.subtitle}>
                  {ticketData?.seatArray
                    ?.slice(0, ticketData?.seatArray.length)
                    .map(
                      (item: any, index: number, arr: any) =>
                        item + (index === arr.length - 1 ? "" : ", ")
                    )}
                </Text>
              </View>
            </View>

            <Image
              source={require("../assets/image/barcode.png")}
              style={styles.barcodeImage}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_20 * 2,
  },
  ticketContainer: {
    flex: 1,
    justifyContent: "center",
  },
  ticketBGImage: {
    alignSelf: "center",
    width: 300,
    aspectRatio: 200 / 300,
    borderTopLeftRadius: BORDER_RADIUS.radius_24,
    borderTopRightRadius: BORDER_RADIUS.radius_24,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  linearGradient: {
    height: "70%",
  },
  linear: {
    borderTopColor: COLORS.Black,
    borderTopWidth: 3,
    width: 300,
    alignSelf: "center",
    backgroundColor: COLORS.Orange,
    borderStyle: "dashed",
  },
  ticketFooter: {
    backgroundColor: COLORS.Orange,
    width: 300,
    alignItems: "center",
    paddingBottom: SPACING.space_36,
    alignSelf: "center",
    borderBottomLeftRadius: BORDER_RADIUS.radius_24,
    borderBottomRightRadius: BORDER_RADIUS.radius_24,
  },
  ticketDateContainer: {
    flexDirection: "row",
    gap: SPACING.space_36,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: SPACING.space_10,
  },
  ticketSeatContainer: {
    flexDirection: "row",
    gap: SPACING.space_36,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: SPACING.space_10,
  },
  dateTitle: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  subheading: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
  },
  subtitleContainer: {
    alignItems: "center",
  },
  barcodeImage: {
    height: 50,
    aspectRatio: 158 / 52,
  },
  blackCircle: {
    height: 80,
    width: 80,
    borderRadius: 80,
    backgroundColor: COLORS.Black,
  },
});

export default TicketScreen;
