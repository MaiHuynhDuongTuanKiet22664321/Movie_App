
import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// Define ticket type
interface Ticket {
  _id: string;
  PosterImage: string;
  movieTitle: string;
  date: {
    date: string;
    day: string;
  };
  time: string;
  room: string;
  seatArray: string[];
  totalPrice: number;
  transactionId: string;
  scheduleDate: Date;
}

import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../theme/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../context/UserContext";
import AdminScheduleManagementScreen from "../admin/AdminScheduleManagementScreen";
import QRCode from "react-native-qrcode-svg";

const TicketScreen = ({ navigation, route }: any) => {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [upcomingDays, setUpcomingDays] = useState<string[]>([]);
  const [selectedUpcomingDay, setSelectedUpcomingDay] = useState<string | null>(
    null
  );
  const [filter, setFilter] = useState("upcoming");
  const [selectedFilter, setSelectedFilter] = useState<"today" | "upcoming" | "expired">("upcoming");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatTicket = (ticket: any) => ({
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
  });

  const loadUserTickets = async () => {
    try {
      setRefreshing(true);
      const { bookingApi } = await import("../../api/bookingApi");
      const result = await bookingApi.getUserTickets();
      if (result.success && Array.isArray(result.data)) {
        const formatted = result.data.map((ticket: any) =>
          formatTicket(ticket)
        );
        setAllTickets(formatted);
        applyFilter(formatted, "today");
      }
    } catch (error) {
      console.error("Error loading user tickets:", error);
    } finally {
      setRefreshing(false);
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

  useFocusEffect(
    React.useCallback(() => {
      loadUserTickets();
    }, [])
  );

  if (isAdmin)
    return (
      <AdminScheduleManagementScreen navigation={navigation} route={route} />
    );

  const applyFilter = (
    tickets: any[],
    filter: "today" | "upcoming" | "expired"
  ) => {
    const now = new Date();
    let filtered = tickets;
    if (filter === "today") {
      filtered = tickets.filter((t) => {
        const d = t.scheduleDate;
        return (
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      });
    } else if (filter === "upcoming") {
      filtered = tickets.filter((t) => t.scheduleDate > now);
      const days = Array.from(new Set(filtered.map((t) => t.date.date)));
      setUpcomingDays(days);
      setSelectedUpcomingDay(null);
    } else if (filter === "expired") {
      filtered = tickets.filter((t) => t.scheduleDate < now);
    }
    setFilteredTickets(
      filtered.sort(
        (a, b) => b.scheduleDate.getTime() - a.scheduleDate.getTime()
      )
    );
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (selectedFilter === "upcoming" && selectedUpcomingDay) {
      const filtered = allTickets.filter(
        (t) =>
          t.scheduleDate > new Date() && t.date.date === selectedUpcomingDay
      );
      setFilteredTickets(filtered);
    } else {
      applyFilter(allTickets, selectedFilter);
    }
  }, [selectedUpcomingDay]);

  const handleFilterChange = (filter: "today" | "upcoming" | "expired") => {
    setSelectedFilter(filter);
    setSelectedUpcomingDay(null);
    applyFilter(allTickets, filter);
  };

  const renderTicketItem = ({ item }: { item: any }) => (
    <View style={styles.ticketCard}>
      <ImageBackground
        source={{ uri: item.PosterImage }}
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
            <Text style={styles.subtitle}>{item.seatArray.join(", ")}</Text>
          </View>
        </View>

        <View style={styles.qrWrapper}>
          <LinearGradient
            colors={["#ffffff", "#f5f2e8"]}
            style={styles.qrBackground}
          >
            <QRCode
              value={JSON.stringify({
                id: item._id,
                transactionId: item.transactionId,
                seats: item.seatArray,
                date: item.date.date,
                movie: item.movieTitle,
                time: item.time,
                room: item.room,
                name: user?.fullName || "Guest",
                email: user?.email || "Guest",
                phoneNumber: user?.phoneNumber || "Guest",
              })}
              size={130}
              backgroundColor="transparent"
              color="black"
              logoSize={32}
              logoBackgroundColor="transparent"
            />
          </LinearGradient>
        </View>
      </View>
    </View>
  );

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );

  // Render ticket list as a single item for vertical FlatList
  const renderTicketSection = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.flatListContainer}
      snapToInterval={320}
      decelerationRate="fast"
    >
      {filteredTickets.length > 0 ? (
        filteredTickets.map((item: any) => (
          <View key={item._id}>
            {renderTicketItem({ item })}
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có vé nào</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.Black} />
      <FlatList
        data={[{ key: 'tickets' }]}
        renderItem={() => renderTicketSection()}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadUserTickets();
            }}
            tintColor={COLORS.Orange}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Vé của tôi</Text>
            </View>

            <View style={styles.filterWrapper}>
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  selectedFilter === "today" && styles.filterTabActive,
                ]}
                onPress={() => handleFilterChange("today")}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === "today" && styles.filterTextActive,
                  ]}
                >
                  Hôm nay
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
                  selectedFilter === "expired" && styles.filterTabActive,
                ]}
                onPress={() => handleFilterChange("expired")}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === "expired" && styles.filterTextActive,
                  ]}
                >
                  Hết hạn
                </Text>
              </TouchableOpacity>
            </View>

            {selectedFilter === "upcoming" && upcomingDays.length > 0 && (
              <View style={styles.upcomingDaysRow}>
                {upcomingDays.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.filterDayTab,
                      selectedUpcomingDay === day && styles.filterTabActive,
                    ]}
                    onPress={() => setSelectedUpcomingDay(day)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedUpcomingDay === day && styles.filterTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: { flex: 1, backgroundColor: COLORS.Black },
  container: { flex: 1, backgroundColor: COLORS.Black },
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
  filterTabActive: { backgroundColor: COLORS.Orange },
  filterText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  filterTextActive: {
    color: COLORS.White,
    fontFamily: FONT_FAMILY.poppins_semibold,
  },
  filterDayTab: {
    paddingHorizontal: SPACING.space_12,
    paddingVertical: SPACING.space_8,
    borderRadius: BORDER_RADIUS.radius_16,
    backgroundColor: COLORS.DarkGrey,
    alignItems: "center",
  },
  flatListContainer: {
    paddingHorizontal: SPACING.space_16,
    paddingVertical: SPACING.space_20,
  },
  ticketCard: { marginRight: SPACING.space_16, alignItems: "center" },
  ticketBGImage: {
    width: 300,
    aspectRatio: 200 / 300,
    borderTopLeftRadius: BORDER_RADIUS.radius_24,
    borderTopRightRadius: BORDER_RADIUS.radius_24,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  linearGradient: { height: "100%" },
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
  subtitleContainer: { alignItems: "center" },
  blackCircle: {
    height: 80,
    width: 80,
    borderRadius: 80,
    backgroundColor: COLORS.Black,
  },
  qrWrapper: { marginTop: 15, padding: 10 },
  qrBackground: {
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerWrapper: {
    marginRight: SPACING.space_16,
  },
  upcomingDaysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
    paddingHorizontal: SPACING.space_12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.space_36,
  },
  emptyText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
  },
});

export default TicketScreen;
