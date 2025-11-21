import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from "react-native";

import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";
import AdminScheduleManagementScreen from "./AdminScheduleManagementScreen";

const TicketScreen = ({ navigation, route }: any) => {
  const { user } = useUser();
  const [allTickets, setAllTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "upcoming" | "watched"
  >("all");

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [user?.role]);

  const formatTicket = (ticket: any) => {
    return {
      _id: ticket._id,
      PosterImage: ticket.scheduleId.movie.posterUrl,
      movieTitle: ticket.scheduleId.movie.title,
      date: {
        date: new Date(ticket.scheduleId.date).toLocaleDateString("vi-VN"),
        day: new Date(ticket.scheduleId.date).toLocaleDateString("vi-VN", {
          weekday: "long",
        }),
      },
      time: ticket.scheduleId.time,
      room: ticket.scheduleId.room.name,
      seatArray: ticket.bookedSeats,
      totalPrice: ticket.totalPrice,
      transactionId: ticket.transactionId,
      scheduleDate: new Date(ticket.scheduleId.date),
    };
  };

  const loadUserTickets = async () => {
    try {
      const { bookingApi } = await import("../api/bookingApi");
      const result = await bookingApi.getUserTickets();

      if (result.success && Array.isArray(result.data)) {
        const formatted = result.data.map((ticket: any) =>
          formatTicket(ticket)
        );
        setAllTickets(formatted);
        applyFilter(formatted, "all");
      }
    } catch (error) {
      console.error("Error loading user tickets:", error);
    }
  };

  useEffect(() => {
    const loadTicketData = async () => {
      try {
        await loadUserTickets();
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTicketData();
  }, [route.params]);

  if (isAdmin) {
    return (
      <AdminScheduleManagementScreen
        navigation={navigation}
        route={route}
      />
    );
  }

  const applyFilter = (tickets: any[], filter: "all" | "upcoming" | "watched") => {
    const now = new Date();
    let filtered = tickets;

    if (filter === "upcoming") {
      filtered = tickets.filter((t) => t.scheduleDate > now);
    } else if (filter === "watched") {
      filtered = tickets.filter((t) => t.scheduleDate <= now);
    }

    setFilteredTickets(
      filtered.sort((a, b) => b.scheduleDate.getTime() - a.scheduleDate.getTime())
    );
  };

  const handleFilterChange = (filter: "all" | "upcoming" | "watched") => {
    setSelectedFilter(filter);
    applyFilter(allTickets, filter);
  };

  const renderTicketItem = ({ item }: { item: any }) => (
    <View style={styles.ticketCard}>
      <ImageBackground source={{ uri: item.PosterImage }} style={styles.ticketBGImage}>
        <LinearGradient
          colors={[COLORS.OrangeRGBBA0, COLORS.Orange]}
          style={styles.linearGradient}
        >
          <View style={[styles.blackCircle, { position: "absolute", bottom: -40, left: -40 }]} />
          <View style={[styles.blackCircle, { position: "absolute", bottom: -40, right: -40 }]} />
        </LinearGradient>
      </ImageBackground>
      
      <View style={styles.linear} />
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
        <View style={styles.ticketDateContainer}>
          <View style={styles.subtitleContainer}>
            <Text style={styles.dateTitle}>{item.date.date}</Text>
            <Text style={styles.subtitle}>{item.date.day}</Text>
          </View>

          <View style={styles.subtitleContainer}>
            <Text style={styles.subheading}>{item.time}</Text>
            <Text style={styles.subtitle}>{item.room}</Text>
          </View>
        </View>

        <View style={styles.ticketSeatContainer}>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subheading}>Seats</Text>
            <Text style={styles.subtitle}>
              {item.seatArray.join(", ")}
            </Text>
          </View>
        </View>

        <Image
          source={require("../assets/image/barcode.png")}
          style={styles.barcodeImage}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.Black} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Vé của tôi</Text>
          </View>

          <View style={styles.filterWrapper}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "all" && styles.filterTabActive,
              ]}
              onPress={() => handleFilterChange("all")}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === "all" && styles.filterTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "upcoming" && styles.filterTabActive,
              ]}
              onPress={() => handleFilterChange("upcoming")}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === "upcoming" && styles.filterTextActive,
                ]}
              >
                Sắp tới
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "watched" && styles.filterTabActive,
              ]}
              onPress={() => handleFilterChange("watched")}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === "watched" && styles.filterTextActive,
                ]}
              >
                Đã xem
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredTickets}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item._id}
            horizontal   
            nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
            snapToInterval={320}
            decelerationRate="fast"
          />
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.DarkGrey,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SPACING.space_20,
    marginTop: SPACING.space_16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.Black,
  },
  headerContainer: {
    paddingHorizontal: SPACING.space_20,
    paddingVertical: SPACING.space_20,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_28,
    color: COLORS.White,
  },
  filterWrapper: {
    flexDirection: "row",
    paddingHorizontal: SPACING.space_12,
    paddingVertical: SPACING.space_12,
    gap: SPACING.space_8,
  },
  filterTab: {
    flex: 1,
    paddingHorizontal: SPACING.space_16,
    paddingVertical: SPACING.space_12,
    borderRadius: BORDER_RADIUS.radius_16,
    backgroundColor: COLORS.DarkGrey,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: COLORS.Orange,
  },
  filterText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  filterTextActive: {
    color: COLORS.White,
    fontFamily: FONT_FAMILY.poppins_semibold,
  },
  flatListContainer: {
    paddingHorizontal: SPACING.space_16,
    paddingVertical: SPACING.space_20,
  },
  ticketCard: {
    marginRight: SPACING.space_16,
    alignItems: "center",
  },
  ticketBGImage: {
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
    backgroundColor: COLORS.Orange,
    borderStyle: "dashed",
  },
  ticketFooter: {
    backgroundColor: COLORS.Orange,
    width: 300,
    alignItems: "center",
    paddingBottom: SPACING.space_36,
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