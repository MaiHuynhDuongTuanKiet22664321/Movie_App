/* eslint-disable import/no-named-as-default */
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
import { useUser } from "../context/UserContext";
import AdminScheduleManagementScreen from "./AdminScheduleManagementScreen";

const TicketScreen = ({ navigation, route }: any) => {
  const { user } = useUser();
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Nếu user là admin, hiển thị màn hình quản lý
  if (user?.role === "admin") {
    return <AdminScheduleManagementScreen navigation={navigation} />;
  }

  // Load ticket data từ route params hoặc API
  useEffect(() => {
    const loadTicketData = async () => {
      try {
        if (route.params?.ticketData) {
          // Nếu có ticketData từ PaymentScreen
          const ticket = route.params.ticketData;
          const formattedData = {
            _id: ticket._id,
            PosterImage: ticket.scheduleId.movie.posterUrl,
            movieTitle: ticket.scheduleId.movie.title,
            date: {
              date: new Date(ticket.scheduleId.date).toLocaleDateString("vi-VN"),
              day: new Date(ticket.scheduleId.date).toLocaleDateString("vi-VN", { weekday: "long" }),
            },
            time: ticket.scheduleId.time,
            room: ticket.scheduleId.room.name,
            seatArray: ticket.bookedSeats,
            totalPrice: ticket.totalPrice,
            transactionId: ticket.transactionId,
          };
          setTicketData(formattedData);
          await SecureStore.setItemAsync("lastTicket", JSON.stringify(formattedData));
        } else if (route.params?.ticketId) {
          // Nếu chỉ có ticketId, gọi API để lấy chi tiết
          const { bookingApi } = await import("../api/bookingApi");
          const result = await bookingApi.getTicketById(route.params.ticketId);
          if (result.success) {
            const ticket = result.data;
            const formattedData = {
              _id: ticket._id,
              PosterImage: ticket.scheduleId.movie.posterUrl,
              movieTitle: ticket.scheduleId.movie.title,
              date: {
                date: new Date(ticket.scheduleId.date).toLocaleDateString("vi-VN"),
                day: new Date(ticket.scheduleId.date).toLocaleDateString("vi-VN", { weekday: "long" }),
              },
              time: ticket.scheduleId.time,
              room: ticket.scheduleId.room.name,
              seatArray: ticket.bookedSeats,
              totalPrice: ticket.totalPrice,
              transactionId: ticket.transactionId,
            };
            setTicketData(formattedData);
            await SecureStore.setItemAsync("lastTicket", JSON.stringify(formattedData));
          }
        } else {
          // Không có params, load từ storage
          const lastTicket = await SecureStore.getItemAsync("lastTicket");
          if (lastTicket) {
            setTicketData(JSON.parse(lastTicket));
          }
        }
      } catch (error) {
        console.error("Error loading ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTicketData();
  }, [route.params]);

  // 🔹 Nếu chưa có dữ liệu ticket - hiển thị no-ticket
  if (loading || !ticketData) {
    return (
      <SafeAreaView style={styles.safeAreaViewContainer}>
        <View style={styles.container}>
          <StatusBar hidden />
          <View style={styles.noTicketContainer}>
            <Image
              source={require("../assets/image/no-ticket.png")}
              style={styles.noTicketImage}
            />
            <Text style={styles.noTicketText}>
              {loading ? "Đang tải..." : "Chưa có vé"}
            </Text>
            <Text style={styles.noTicketSubText}>
              {loading ? "Vui lòng đợi..." : "Đặt vé xem phim yêu thích để xem vé tại đây"}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView style={styles.container}>
        <StatusBar hidden />

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
            <Image source={require("../assets/image/barcode.png")} style={styles.barcodeImage}/>
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
    height: "100%",
  },
  linear: {
    borderTopColor: COLORS.Black,
    borderTopWidth: 2,
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
  noTicketContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.space_48,
  },
  noTicketImage: {
    width: 250,
    height: 250,
    marginBottom: SPACING.space_16,
  },
  noTicketText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
    marginBottom: SPACING.space_8,
  },
  noTicketSubText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
  },
});

export default TicketScreen;
