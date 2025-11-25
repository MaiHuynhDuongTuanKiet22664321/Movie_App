import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  CalendarX, 
  Clock, 
  DoorOpen, 
  Banknote, 
  ChevronRight 
} from "lucide-react-native";
import {
  COLORS,
  SPACING,
  FONT_FAMILY,
  FONT_SIZE,
  BORDER_RADIUS,
} from "../theme/theme";
import { scheduleApi } from "../api/adminApi";

const { width } = Dimensions.get("window");

const MovieScheduleScreen = ({ navigation, route }: any) => {
  const { movieData } = route.params;
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dates, setDates] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Refresh khi focus vào screen
  useFocusEffect(
    React.useCallback(() => {
      fetchSchedules();
    }, [])
  );

  const fetchSchedules = async () => {
    try {
      setRefreshing(true);
      const result = await scheduleApi.getAll();
      if (result.success) {
        // Lọc lịch chiếu của phim này
        const movieSchedules = result.data.filter(
          (s: any) => s.movie?._id === movieData._id
        );
        setSchedules(movieSchedules);

        // Tạo danh sách ngày unique
        const uniqueDates = [
          ...new Set(
            movieSchedules.map((s: any) =>
              new Date(s.date).toISOString().split("T")[0]
            )
          ),
        ].sort();

        const dateObjects = (uniqueDates as string[]).map((dateStr) => {
          const date = new Date(dateStr);
          return {
            value: dateStr,
            day: date.toLocaleDateString("vi-VN", { weekday: "short" }),
            date: date.getDate(),
            month: date.getMonth() + 1,
          };
        });

        setDates(dateObjects);
        if (dateObjects.length > 0) {
          setSelectedDate(dateObjects[0].value as string);
        }
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSchedulesForDate = () => {
    return schedules.filter(
      (s) => new Date(s.date).toISOString().split("T")[0] === selectedDate
    );
  };

  const handleSelectSchedule = (schedule: any) => {
    navigation.navigate("SeatBooking", {
      scheduleId: schedule._id,
      movieData: movieData,
      schedule: schedule,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with backdrop */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: movieData.backdropUrl }}
          style={styles.backdropImage}
          resizeMode="cover"
        />
        <View style={styles.backdropOverlay} />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", COLORS.Black]}
          style={styles.gradient}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={COLORS.White} />
        </TouchableOpacity>

        <View style={styles.movieInfo}>
          <Image source={{ uri: movieData.posterUrl }} style={styles.poster} />
          <View style={styles.movieDetails}>
            <Text style={styles.movieTitle} numberOfLines={2}>
              {movieData.title}
            </Text>
            <View style={styles.metaRow}>
              <Star size={14} color={COLORS.Yellow} fill={COLORS.Yellow} />
              <Text style={styles.rating}>{movieData.voteAverage?.toFixed(1)}</Text>
              <Text style={styles.metaText}>
                • {movieData.runtime}p •{" "}
                {new Date(movieData.releaseDate).getFullYear()}
              </Text>
            </View>
            {movieData.genres && movieData.genres.length > 0 && (
              <View style={styles.genresRow}>
                {movieData.genres.slice(0, 3).map((genre: any, index: number) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchSchedules}
            tintColor={COLORS.Orange}
          />
        }
      >
        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={COLORS.Orange} />
            <Text style={styles.sectionTitle}>Chọn ngày chiếu</Text>
          </View>

          {dates.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarX size={60} color={COLORS.WhiteRGBA25} />
              <Text style={styles.emptyText}>
                Chưa có lịch chiếu cho phim này
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesContainer}
            >
              {dates.map((dateObj) => (
                <TouchableOpacity
                  key={dateObj.value}
                  style={[
                    styles.dateCard,
                    selectedDate === dateObj.value && styles.dateCardActive,
                  ]}
                  onPress={() => setSelectedDate(dateObj.value)}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      selectedDate === dateObj.value && styles.dateDayActive,
                    ]}
                  >
                    {dateObj.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      selectedDate === dateObj.value && styles.dateNumberActive,
                    ]}
                  >
                    {dateObj.date}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      selectedDate === dateObj.value && styles.dateMonthActive,
                    ]}
                  >
                    Th{dateObj.month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Schedule List */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={24} color={COLORS.Orange} />  
              <Text style={styles.sectionTitle}>Chọn suất chiếu</Text>
            </View>

            {getSchedulesForDate().length === 0 ? (
              <View style={styles.emptyState}>
                <Clock size={60} color={COLORS.WhiteRGBA25} />
                <Text style={styles.emptyText}>
                  Không có suất chiếu trong ngày này
                </Text>
              </View>
            ) : (
              <View style={styles.schedulesGrid}>
                {getSchedulesForDate().map((schedule) => (
                  <TouchableOpacity
                    key={schedule._id}
                    style={styles.scheduleCard}
                    onPress={() => handleSelectSchedule(schedule)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.scheduleTime}>
                      <Clock size={18} color={COLORS.Orange} />
                      <Text style={styles.timeText}>{schedule.time}</Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      <View style={styles.infoRow}>
                        <DoorOpen size={16} color={COLORS.WhiteRGBA75} />
                        <Text style={styles.infoText}>
                          {schedule.room?.name || "N/A"}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Banknote size={14} color={COLORS.WhiteRGBA75} />
                        <Text style={styles.infoText}>
                          {(schedule.basePrice / 1000).toFixed(0)}K
                        </Text>
                      </View>
                    </View>
                    <View style={styles.arrowIcon}>
                      <ChevronRight size={16} color={COLORS.Orange} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  headerContainer: {
    height: 280,
    position: "relative",
  },
  backdropImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  backdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  backButton: {
    position: "absolute",
    top: SPACING.space_20,
    left: SPACING.space_20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.Black + "80",
    alignItems: "center",
    justifyContent: "center",
  },
  movieInfo: {
    position: "absolute",
    bottom: SPACING.space_20,
    left: SPACING.space_20,
    right: SPACING.space_20,
    flexDirection: "row",
    gap: SPACING.space_16,
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: BORDER_RADIUS.radius_12,
    borderWidth: 2,
    borderColor: COLORS.Orange,
  },
  movieDetails: {
    flex: 1,
    justifyContent: "flex-end",
  },
  movieTitle: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
    marginBottom: SPACING.space_8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
    marginBottom: SPACING.space_8,
  },
  rating: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.Yellow,
  },
  metaText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  genresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.space_8,
  },
  genreTag: {
    backgroundColor: COLORS.WhiteRGBA15,
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDER_RADIUS.radius_8,
  },
  genreText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA75,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.space_20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    marginBottom: SPACING.space_16,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
  },
  datesContainer: {
    gap: SPACING.space_12,
    paddingRight: SPACING.space_20,
  },
  dateCard: {
    width: 70,
    paddingVertical: SPACING.space_16,
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA15,
  },
  dateCardActive: {
    backgroundColor: COLORS.Orange + "20",
    borderColor: COLORS.Orange,
  },
  dateDay: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA50,
    marginBottom: SPACING.space_4,
  },
  dateDayActive: {
    color: COLORS.Orange,
  },
  dateNumber: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  dateNumberActive: {
    color: COLORS.Orange,
  },
  dateMonth: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
  },
  dateMonthActive: {
    color: COLORS.Orange,
  },
  schedulesGrid: {
    gap: SPACING.space_12,
  },
  scheduleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  scheduleTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
    minWidth: 80,
  },
  timeText: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  scheduleInfo: {
    flex: 1,
    gap: SPACING.space_8,
    marginLeft: SPACING.space_16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
  },
  infoText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  arrowIcon: {
    marginLeft: SPACING.space_12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.space_48,
    gap: SPACING.space_16,
  },
  emptyText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
  },
});

export default MovieScheduleScreen;
