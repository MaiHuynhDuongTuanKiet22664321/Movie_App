import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SPACING, FONT_FAMILY, FONT_SIZE, BORDER_RADIUS } from "../theme/theme";
import MovieDetailsHeader from "../components/MovieDetailsHeader";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import Svg, { Defs, ClipPath, Image as SvgImage, Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const height = 260;
const bottomCurveHeight = 50;
const topCurveHeight = 50;

// Tạo danh sách ngày (7 ngày tới)
const generateDates = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400000);
    return {
      day: days[d.getDay()],
      date: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });
};

const roomArray = ["Room A", "Room B", "Room C", "Room D"];
const timeArray = ["10:00", "12:30", "15:00", "17:30", "19:00", "21:30"];

const ScheduleSetupScreen = ({ navigation, route }: any) => {
  const [selectedRoom, setSelectedRoom] = useState<number>();
  const [selectedDate, setSelectedDate] = useState<number>();
  const [selectedTime, setSelectedTime] = useState<number>();
  const [dateArray, setDateArray] = useState<any>(generateDates());

  const saveSchedule = async () => {
    if (
      selectedRoom === undefined ||
      selectedDate === undefined ||
      selectedTime === undefined
    ) {
      Toast.show({
        type: "error",
        text1: "Please select room, date, and time.",
      });
      return;
    }

    const schedule = {
      movieName: route.params?.nameMovie,
      moviePoster: route.params?.PosterImage,
      room: roomArray[selectedRoom],
      date: dateArray[selectedDate],
      time: timeArray[selectedTime],
    };

    try {
      await SecureStore.setItemAsync("movie_schedule", JSON.stringify(schedule));
      Toast.show({
        type: "success",
        text1: "Schedule saved successfully!",
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error saving schedule:", error);
      Toast.show({
        type: "error",
        text1: "Failed to save schedule.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView style={styles.container} bounces={false}>
        <StatusBar hidden />
        {/* Header + Poster */}
        <View style={{ width, height }}>
          <Svg width={width} height={height}>
            <Defs>
              <ClipPath id="clip">
                <Path
                  d={`
                    M0,${topCurveHeight}
                    Q${width / 2},0 ${width},${topCurveHeight}
                    L${width},${height - bottomCurveHeight}
                    Q${width / 2},${height - bottomCurveHeight * 2.0} 0,${
                    height - bottomCurveHeight
                  }
                    Z
                  `}
                  fill="white"
                />
              </ClipPath>
            </Defs>

            <SvgImage
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
              href={{ uri: route.params?.PosterImage }}
              clipPath="url(#clip)"
            />
          </Svg>
          <LinearGradient
            colors={[COLORS.BlackRGB10, COLORS.Black]}
            style={[StyleSheet.absoluteFill, { height }]}
          >
            <View style={styles.appHeaderContainer}>
              <MovieDetailsHeader
                nameIcon="close-circle-outline"
                header=""
                action={() => navigation.goBack()}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Movie Title */}
        <Text style={styles.movieName}>{route.params?.nameMovie}</Text>

        {/* Select Room */}
        <Text style={styles.sectionTitle}>Select Room</Text>
        <FlatList
          data={roomArray}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.flatListContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedRoom(index)}
              style={[
                styles.optionButton,
                selectedRoom === index && styles.selectedOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedRoom === index && { color: COLORS.White },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Select Date */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <FlatList
          data={dateArray}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.flatListContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedDate(index)}
              style={[
                styles.dateContainer,
                selectedDate === index && styles.selectedOption,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === index && { color: COLORS.White },
                ]}
              >
                {item.date}
              </Text>
              <Text style={styles.dayText}>{item.day}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Select Time */}
        <Text style={styles.sectionTitle}>Select Time</Text>
        <FlatList
          data={timeArray}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.flatListContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => setSelectedTime(index)}
              style={[
                styles.optionButton,
                selectedTime === index && styles.selectedOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedTime === index && { color: COLORS.White },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSchedule}>
          <Text style={styles.saveButtonText}>Save Schedule</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleSetupScreen;

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_10 * 4,
  },
  movieName: {
    textAlign: "center",
    color: COLORS.White,
    fontSize: FONT_SIZE.size_24,
    fontFamily: FONT_FAMILY.poppins_bold,
    marginTop: SPACING.space_20,
  },
  sectionTitle: {
    color: COLORS.White,
    fontSize: FONT_SIZE.size_18,
    fontFamily: FONT_FAMILY.poppins_medium,
    marginTop: SPACING.space_24,
    marginLeft: SPACING.space_20,
  },
  flatListContainer: {
    paddingHorizontal: SPACING.space_20,
    marginTop: SPACING.space_10,
    gap: SPACING.space_16,
  },
  optionButton: {
    backgroundColor: COLORS.BlackRGB5,
    paddingVertical: SPACING.space_10,
    paddingHorizontal: SPACING.space_20,
    borderRadius: BORDER_RADIUS.radius_20,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA10,
  },
  selectedOption: {
    backgroundColor: COLORS.Orange,
    borderColor: COLORS.Orange,
  },
  optionText: {
    color: COLORS.White,
    fontFamily: FONT_FAMILY.poppins_regular,
  },
  dateContainer: {
    width: SPACING.space_10 * 7,
    height: SPACING.space_10 * 8,
    backgroundColor: COLORS.BlackRGB5,
    borderRadius: SPACING.space_10 * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
  },
  dayText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
  },
  saveButton: {
    backgroundColor: COLORS.Orange,
    marginHorizontal: SPACING.space_24,
    marginVertical: SPACING.space_36,
    paddingVertical: SPACING.space_15,
    borderRadius: BORDER_RADIUS.radius_24,
    alignItems: "center",
  },
  saveButtonText: {
    color: COLORS.White,
    fontSize: FONT_SIZE.size_18,
    fontFamily: FONT_FAMILY.poppins_semibold,
  },
});
