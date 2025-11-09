import React, { useState, useMemo, useCallback } from "react";
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
import Toast from "react-native-toast-message";
import Svg, { Defs, ClipPath, Image as SvgImage, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { createMovie, checkMovieExists } from "../service/movie.service";

const { width } = Dimensions.get("window");
const height = 260;
const bottomCurveHeight = 50;
const topCurveHeight = 50;

const generateDates = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getTime() + i * 86400000);
        return {
            day: days[d.getDay()],
            date: `${d.getDate()}/${d.getMonth() + 1}`,
            value: d.toISOString().split('T')[0],
        };
    });
};

const roomArray = ["Room A", "Room B", "Room C", "Room D"];
const timeArray = ["10:00", "12:30", "15:00", "17:30", "19:00", "21:30"];

const ScheduleSetupScreen = ({ navigation, route }: any) => {
    const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
    const [selectedDates, setSelectedDates] = useState<number[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
    const [dateArray] = useState<any>(generateDates());
    
    const movieData = route.params?.movieData; 

    const toggleSelection = (
        setState: React.Dispatch<React.SetStateAction<number[]>>,
        currentState: number[],
        index: number
    ) => {
        if (currentState.includes(index)) {
            setState(currentState.filter((i) => i !== index));
        } else {
            setState([...currentState, index]);
        }
    };

    const isSlotOccupied = useCallback(() => {
        return false;
    }, []);

    const scheduleListPreview = useMemo(() => {
        if (selectedRooms.length === 0 || selectedDates.length === 0 || selectedTimes.length === 0) {
            return [];
        }

        const list = [];
        for (const dIndex of selectedDates) {
            for (const tIndex of selectedTimes) {
                for (const rIndex of selectedRooms) {
                    const dateValue = dateArray[dIndex].value;
                    const timeValue = timeArray[tIndex];
                    const roomValue = roomArray[rIndex];

                    list.push({
                        id: `${dateArray[dIndex].date}-${timeValue}-${roomValue}`,
                        date: dateArray[dIndex].date,
                        day: dateArray[dIndex].day,
                        time: timeValue,
                        room: roomValue,
                        scheduleDateValue: dateValue,
                        scheduleTimeValue: timeValue,
                        isOccupied: false,
                    });
                }
            }
        }
        return list;
    }, [selectedRooms, selectedDates, selectedTimes, dateArray]);

    const availableOptions = useMemo(() => {
        return {
            rooms: roomArray, 
            dates: dateArray, 
            times: timeArray,
        };
    }, [dateArray]); 

    const saveSchedule = async () => {
        if (scheduleListPreview.length === 0) {
            Toast.show({
                type: "error",
                text1: "Vui lòng chọn ít nhất một tổ hợp Ngày/Phòng/Giờ.",
            });
            return;
        }

        const movieIdToSend = movieData?.tmdb_id;

        if (!movieIdToSend) {
            Toast.show({
                type: "error",
                text1: "Lỗi dữ liệu phim.",
                text2: "Không tìm thấy Movie ID để tạo lịch chiếu.",
            });
            return;
        }
        
        const schedulesCount = scheduleListPreview.length;

        const schedulesForServer = scheduleListPreview.map(item => ({
            movieId: movieIdToSend,
            date: item.scheduleDateValue,
            room: item.room,
            startTime: item.scheduleTimeValue,
        }));
        
        try {
            let movieExists = await checkMovieExists(String(movieData.tmdb_id));
            try {
                if (movieExists.exists) {
                    // console.log("Movie already exists, skip creation.");
                }
            } catch (fetchErr: any) {
                if (fetchErr?.response?.status === 404) {
                    // console.log("Movie not found, will create new.");
                    movieExists = false;
                } else {
                    // console.warn("Error checking movie existence:", fetchErr.message);
                }
            }

            if (!movieExists) {
                try {
                    const createMovieResponse = await createMovie({
                        tmdb_id: movieData.tmdb_id,
                        title: movieData.title,
                        original_title: movieData.original_title,
                        overview: movieData.overview,
                        runtime: movieData.runtime,
                        release_date: movieData.release_date,
                        poster_path: movieData.poster_path,
                        backdrop_path: movieData.backdrop_path,
                        vote_average: movieData.vote_average,
                        vote_count: movieData.vote_count,
                        genres: movieData.genres,
                        tagline: movieData.tagline
                    });
                    
                    if (createMovieResponse?._id || createMovieResponse?.status === "success") {
                        // console.log("Movie created successfully");
                    }
                } catch (movieErr: any) {
                    const status = movieErr?.response?.status;
                    const message = movieErr?.response?.data?.message;

                    if (status === 409 || (message && message.includes("exists"))) {
                        // console.log("Movie creation race condition (409), proceed to schedule creation.");
                    } else if (status === 400 || status === 500) {
                        // console.error(`Movie creation FAILED (Status: ${status}):`, movieErr.response?.data);
                        Toast.show({
                            type: "error",
                            text1: `Lỗi Server/Validation khi tạo phim (Status ${status}).`,
                            text2: message || "Vui lòng kiểm tra dữ liệu phim.",
                        });
                        return;
                    } else {
                        // console.error("Unknown error creating movie:", movieErr);
                        Toast.show({
                            type: "error",
                            text1: "Không thể tạo phim.",
                            text2: movieErr?.message || "Vui lòng kiểm tra kết nối.",
                        });
                        return;
                    }
                }
            }
            
            Toast.show({
                type: "success",
                text1: `Thành công! Đã "tạo" ${schedulesCount} lịch chiếu.`,
                text2: "Lưu ý: Chức năng lưu lịch chiếu thực tế đã bị vô hiệu hóa.",
            });

            navigation.goBack();
        } catch (error: any) {
            // console.error("Error in saveSchedule process:", error);
            Toast.show({
                type: "error",
                text1: "Lỗi trong quá trình (Movie Create).",
                text2: error?.message || "Vui lòng kiểm tra kết nối và dữ liệu.",
            });
        }
    };

    const PreviewCard = ({ schedule }: any) => {
        const cardStyle = styles.previewCard; 
        const borderColor = COLORS.WhiteRGBA10;

        return (
            <View style={[cardStyle, { borderColor }]}>
                <View style={styles.previewSection}>
                    <FontAwesome6 name="calendar-day" size={16} color={COLORS.Orange} />
                    <View>
                        <Text style={styles.cardDetailText}>{schedule.day}</Text>
                        <Text style={styles.cardTitleText}>{schedule.date}</Text>
                    </View>
                </View>

                <View style={styles.previewSection}>
                    <FontAwesome6 name="clock" size={16} color={COLORS.Orange} />
                    <View>
                        <Text style={styles.cardDetailText}>Start Time</Text>
                        <Text style={styles.cardTitleText}>{schedule.time}</Text>
                    </View>
                </View>

                <View style={styles.previewSection}>
                    <MaterialCommunityIcons name="projector-screen" size={18} color={COLORS.Orange} />
                    <View>
                        <Text style={styles.cardDetailText}>Room</Text>
                        <Text style={styles.cardTitleText}>{schedule.room}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView style={styles.container} bounces={false}>
                <StatusBar hidden />
                
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

                <Text style={styles.movieName}>{movieData?.title || route.params?.nameMovie}</Text>
                
                <Text style={styles.sectionTitle}>Select Room (Total: {availableOptions.rooms.length})</Text>
                <FlatList
                    data={availableOptions.rooms}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.flatListContainer}
                    renderItem={({ item, index }) => {
                        const originalIndex = index;
                        return (
                            <TouchableOpacity
                                onPress={() => toggleSelection(setSelectedRooms, selectedRooms, originalIndex)}
                                style={[
                                    styles.optionButton,
                                    selectedRooms.includes(originalIndex) && styles.selectedOption,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedRooms.includes(originalIndex) && { color: COLORS.White },
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />

                <Text style={styles.sectionTitle}>Select Date (Total: {availableOptions.dates.length})</Text>
                <FlatList
                    data={availableOptions.dates}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.date}
                    contentContainerStyle={styles.flatListContainer}
                    renderItem={({ item, index }) => {
                        const originalIndex = index;
                        return (
                            <TouchableOpacity
                                onPress={() => toggleSelection(setSelectedDates, selectedDates, originalIndex)}
                                style={[
                                    styles.dateContainer,
                                    selectedDates.includes(originalIndex) && styles.selectedOption,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dateText,
                                        selectedDates.includes(originalIndex) && { color: COLORS.White },
                                    ]}
                                >
                                    {item.date}
                                </Text>
                                <Text style={styles.dayText}>{item.day}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />

                <Text style={styles.sectionTitle}>Select Time (Total: {availableOptions.times.length})</Text>
                <FlatList
                    data={availableOptions.times}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.flatListContainer}
                    renderItem={({ item, index }) => {
                        const originalIndex = index;
                        return (
                            <TouchableOpacity
                                onPress={() => toggleSelection(setSelectedTimes, selectedTimes, originalIndex)}
                                style={[
                                    styles.optionButton,
                                    selectedTimes.includes(originalIndex) && styles.selectedOption,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedTimes.includes(originalIndex) && { color: COLORS.White },
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
                
                <View style={styles.previewWrapper}>
                    <Text style={styles.sectionTitle}>
                        Preview ({scheduleListPreview.length} Schedules)
                    </Text>
                    
                    {scheduleListPreview.length === 0 ? (
                        <View style={styles.emptyPreview}>
                            <Ionicons name="alert-circle-outline" size={24} color={COLORS.WhiteRGBA50} />
                            <Text style={styles.emptyPreviewText}>Please select a valid combination of Room, Date, and Time.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={scheduleListPreview}
                            keyExtractor={(item) => `${item.scheduleDateValue}-${item.scheduleTimeValue}-${item.room}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalListContainer}
                            renderItem={({ item }) => <PreviewCard schedule={item} />}
                        />
                    )}
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveSchedule}>
                    <Text style={styles.saveButtonText}>Save Schedule (Dummy)</Text>
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
        marginVertical: SPACING.space_36 * 2,
        paddingVertical: SPACING.space_15,
        borderRadius: BORDER_RADIUS.radius_24,
        alignItems: "center",
    },
    saveButtonText: {
        color: COLORS.White,
        fontSize: FONT_SIZE.size_18,
        fontFamily: FONT_FAMILY.poppins_semibold,
    },
    previewWrapper: {
        marginTop: SPACING.space_24,
    },
    horizontalListContainer: {
        paddingHorizontal: SPACING.space_20,
        marginTop: SPACING.space_16,
        gap: SPACING.space_16,
    },
    previewCard: {
        width: width * 0.7,
        backgroundColor: COLORS.BlackRGB5,
        borderRadius: BORDER_RADIUS.radius_12,
        padding: SPACING.space_16,
        borderWidth: 1,
        borderColor: COLORS.WhiteRGBA10,
        gap: SPACING.space_12,
    },
    previewSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.space_10,
        paddingVertical: SPACING.space_4,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.WhiteRGBA10,
    },
    cardTitleText: {
        fontFamily: FONT_FAMILY.poppins_semibold,
        fontSize: FONT_SIZE.size_14,
        color: COLORS.White,
    },
    cardDetailText: {
        fontFamily: FONT_FAMILY.poppins_light,
        fontSize: FONT_SIZE.size_10,
        color: COLORS.WhiteRGBA75,
    },
    emptyPreview: {
        marginHorizontal: SPACING.space_20,
        marginTop: SPACING.space_16,
        padding: SPACING.space_16,
        backgroundColor: COLORS.BlackRGB5,
        borderRadius: BORDER_RADIUS.radius_12,
        borderWidth: 1,
        borderColor: COLORS.WhiteRGBA10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyPreviewText: {
        color: COLORS.WhiteRGBA50,
        fontSize: FONT_SIZE.size_12,
        fontFamily: FONT_FAMILY.poppins_light,
        marginTop: SPACING.space_8,
        textAlign: 'center',
    }
});