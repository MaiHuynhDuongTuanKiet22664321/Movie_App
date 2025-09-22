import { useMemo, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import * as SecureStore from "expo-secure-store";
import MovieDetailsHeader from "../components/MovieDetailsHeader";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import Svg, { Defs, ClipPath, Image as SvgImage } from "react-native-svg";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const timeArray = [
  "10:30",
  "12:30",
  "14:30",
  "15:00",
  "19:30",
  "20:30",
  "21:00",
  "22:30",
];

const { width } = Dimensions.get("window");
const height = 260; // chiều cao banner
const bottomCurveHeight = 50; // độ cong
const topCurveHeight = 50;

const generateDates = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    return {
      day: days[d.getDay()],
      date: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  });
};

const generateSeats = () => {
  const rowCount = 8;
  const maxCols = 10;
  const seats = [];
  let peakRow = Math.ceil(rowCount / 2);
  let seatNumber = 1;

  for (let i = 0; i < rowCount; i++) {
    let cols;
    if (i < peakRow) {
      cols = 4 + 2 * i;
      if (cols > maxCols) cols = maxCols;
    } else {
      cols = 4 + 2 * (rowCount - i - 1);
      if (cols > maxCols) cols = maxCols;
    }

    const row = Array.from({ length: cols }, (_, j) => ({
      number: seatNumber++,
      taken: Math.random() < 0.5,
      selected: false,
    }));
    seats.push(row);
  }

  return seats;
};

const SeatBookingScreen = ({ navigation, route }: any) => {
  const [dateArray, setdateArray] = useState<any>(generateDates());
  const [selectedDateIndex, setSelectedDateIndex] = useState<any>();
  const [price, setPrice] = useState<number>(0);
  const [twoDSeatArray, setTwoDSeatArray] = useState<any>();
  const [selectedSeatArray, setSelectedSeatArray] = useState<any>([]);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<any>();
  const checkSelectedDateTime = useMemo(() => {
    setTwoDSeatArray(generateSeats());
    return selectedDateIndex !== undefined && selectedTimeIndex !== undefined;
  }, [selectedDateIndex, selectedTimeIndex]);

  const BookSeats = async () => {
    if (
      selectedSeatArray.length !== 0 &&
      timeArray[selectedTimeIndex] !== undefined &&
      dateArray[selectedDateIndex] !== undefined
    ) {
      try {
        // Lưu vé vào SecureStore
        await SecureStore.setItemAsync(
          "ticket",
          JSON.stringify({
            seatArray: selectedSeatArray,
            time: timeArray[selectedTimeIndex],
            date: dateArray[selectedDateIndex],
            PosterImage: route.params.PosterImage,
            price: price,
          })
        );
      } catch (error) {
        console.error(
          "Something went Wrong while storing in BookSeats Functions",
          error
        );
      }

      // Điều hướng sang Payment + gửi params
      navigation.navigate("Payment", {
        seatArray: selectedSeatArray,
        time: timeArray[selectedTimeIndex],
        date: dateArray[selectedDateIndex],
        PosterImage: route.params.PosterImage,
        nameMovie: route.params.nameMovie,
        price: price,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Please Select Seats, Date and Time of the Show",
      });
    }
  };

  const selectedSeatArr = (index: number, subIndex: number, num: number) => {
    if (!twoDSeatArray[index][subIndex].taken) {
      let array: any = [...selectedSeatArray];
      let temp = [...twoDSeatArray];
      temp[index][subIndex].selected = !temp[index][subIndex].selected;
      if (!array.includes(num)) {
        array.push(num);
        setSelectedSeatArray(array);
      } else {
        const tempIndex = array.indexOf(num);
        if (tempIndex > -1) {
          array.splice(tempIndex, 1);
          setSelectedSeatArray(array);
        }
      }
      setPrice(array.length * 5.0);
      setTwoDSeatArray(temp);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewcontainer}>
      <ScrollView style={styles.container} bounces={false}>
        <StatusBar hidden />
        <View>
          {/* Banner cong */}
          <View style={{ width: width, height }}>
            <Svg width={width} height={height}>
              <Defs>
                <ClipPath id="clip">
                  <path
                    d={`
                      M0,${topCurveHeight} 
                      Q${width / 2},0 ${width},${topCurveHeight}  
                      L${width},${height - bottomCurveHeight}      
                      Q${width / 2},${height - bottomCurveHeight * 2.0} 0,${
                      height - bottomCurveHeight
                    } 
                      L0,${topCurveHeight}                         
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
                href={{ uri: route.params.PosterImage }}
                clipPath="url(#clip)"
              />
            </Svg>
            {/* Gradient phủ + Header */}
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

          <View>
            <FlatList
              data={dateArray}
              keyExtractor={(item) => item.date}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.containerGap24}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedDateIndex(index);
                    }}
                  >
                    <View
                      style={[
                        styles.dateContainer,
                        index === 0
                          ? { marginLeft: SPACING.space_24 }
                          : index === dateArray.length - 1
                          ? { marginRight: SPACING.space_24 }
                          : {},

                        selectedDateIndex === index
                          ? { backgroundColor: COLORS.Orange }
                          : {},
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          selectedDateIndex === index
                            ? { color: COLORS.White }
                            : {},
                        ]}
                      >
                        {item.date}
                      </Text>
                      <Text style={styles.dayText}>{item.day}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={styles.OutterContainer}>
            <FlatList
              data={timeArray}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.containerGap24}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity onPress={() => setSelectedTimeIndex(index)}>
                    <View
                      style={[
                        styles.timeContainer,
                        index === 0
                          ? { marginLeft: SPACING.space_24 }
                          : index === timeArray.length - 1
                          ? { marginRight: SPACING.space_24 }
                          : {},
                        index === selectedTimeIndex
                          ? { backgroundColor: COLORS.Orange }
                          : {},
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedTimeIndex === index
                            ? { color: COLORS.White }
                            : {},
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <Text style={styles.screenText}>Screen this side</Text>
        </View>
        {checkSelectedDateTime && (
          <>
            <View style={styles.seatContainer}>
              <View style={styles.containerGap20}>
                {twoDSeatArray.map((item: any, index: number) => {
                  return (
                    <View key={index} style={styles.seatRow}>
                      {item?.map((subItem: any, subIndex: number) => {
                        return (
                          <TouchableOpacity
                            key={subIndex}
                            onPress={() => {
                              selectedSeatArr(index, subIndex, subItem.number);
                            }}
                          >
                            <MaterialIcons
                              name="event-seat"
                              style={[
                                styles.seatIcon,
                                subItem.taken ? { color: COLORS.Grey } : {},
                                subItem.selected
                                  ? { color: COLORS.Orange }
                                  : {},
                              ]}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
              <View style={styles.seatRadioContainer}>
                <View style={styles.radioContainer}>
                  <MaterialIcons
                    name="radio-button-on"
                    style={[styles.radioIcon]}
                  />
                  <Text style={styles.radioText}>Available</Text>
                </View>

                <View style={styles.radioContainer}>
                  <MaterialIcons
                    name="radio-button-on"
                    style={[styles.radioIcon, { color: COLORS.Grey }]}
                  />
                  <Text style={styles.radioText}>Taken</Text>
                </View>

                <View style={styles.radioContainer}>
                  <MaterialIcons
                    name="radio-button-on"
                    style={[styles.radioIcon, { color: COLORS.Orange }]}
                  />
                  <Text style={styles.radioText}>Selected</Text>
                </View>
              </View>
            </View>
            <View style={styles.buttonPriceContainer}>
              <View style={styles.priceContainer}>
                <Text style={styles.totalPriceText}>Total Price</Text>
                <Text style={styles.price}>$ {price}.00</Text>
              </View>
              <TouchableOpacity
                onPress={BookSeats}
                style={styles.buttonBookSeat}
              >
                <MaterialCommunityIcons
                  name="ticket"
                  style={styles.ticketIcon}
                />
                <Text style={styles.buttonText}>Buy Tickets</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SeatBookingScreen;

const styles = StyleSheet.create({
  safeAreaViewcontainer: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  imageBG: {
    width: "100%",
    aspectRatio: 3072 / 1727,
    borderRadius: BORDER_RADIUS.radius_40,
    overflow: "hidden",
  },
  linearGradient: {
    height: "100%",
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_10 * 4,
  },
  screenText: {
    textAlign: "center",
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.Orange,
  },
  seatContainer: {
    marginVertical: SPACING.space_10 * 2,
  },
  containerGap20: {
    gap: SPACING.space_10 * 2,
  },
  seatRow: {
    flexDirection: "row",
    gap: SPACING.space_16,
    justifyContent: "center",
  },
  seatIcon: {
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
  },
  seatRadioContainer: {
    flexDirection: "row",
    marginTop: SPACING.space_36,
    marginBottom: SPACING.space_10,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  radioContainer: {
    flexDirection: "row",
    gap: SPACING.space_10,
    alignItems: "center",
  },
  radioIcon: {
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
  },
  radioText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
  },
  containerGap24: {
    gap: SPACING.space_24,
  },
  dateContainer: {
    width: SPACING.space_10 * 6,
    height: SPACING.space_10 * 8,
    borderColor: COLORS.WhiteRGBA5,
    borderRadius: SPACING.space_10 * 2,
    backgroundColor: COLORS.BlackRGB5,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
  },
  dayText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
  },
  OutterContainer: {
    marginVertical: SPACING.space_24,
  },
  timeContainer: {
    paddingVertical: SPACING.space_10,
    borderWidth: 1,
    borderColor: COLORS.BlackRGB5,
    paddingHorizontal: SPACING.space_10 * 2,
    borderRadius: BORDER_RADIUS.radius_20,
    backgroundColor: COLORS.BlackRGB5,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  buttonPriceContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: SPACING.space_24,
    paddingBottom: SPACING.space_24,
  },
  priceContainer: {
    alignItems: "center",
  },
  totalPriceText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.Orange,
  },
  price: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
  },
  buttonBookSeat: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.radius_24,
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_10,
    backgroundColor: COLORS.Orange,
  },
  buttonText: {
    borderRadius: BORDER_RADIUS.radius_24,
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_10,
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    backgroundColor: COLORS.Orange,
  },
  ticketIcon: {
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
    paddingHorizontal: SPACING.space_4,
    paddingVertical: SPACING.space_4,
  },
});
