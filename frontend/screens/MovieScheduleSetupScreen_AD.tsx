import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ScrollView,
    Dimensions,
    ActivityIndicator,
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
import { createSchedules, getOccupiedSlots } from "../service/schedule.service";
import { createMovie, checkMovieExists } from "../service/movie.service";

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
            value: d.toISOString().split('T')[0], // YYYY-MM-DD
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
    
    // --- STATE LOADING DỮ LIỆU ĐÃ CHIẾM ---
    const [occupiedSlots, setOccupiedSlots] = useState<any[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(true);
    
    const movieData = route.params?.movieData; 

    // --- useEffect: Lấy các slots đã bị chiếm ---
    useEffect(() => {
        const fetchOccupiedSlots = async () => {
            try {
                // Lấy TẤT CẢ các slot đã bị chiếm (dùng cho việc kiểm tra trùng lặp trên client)
                const response = await getOccupiedSlots();
                const mappedSlots = response.data?.occupiedSlots.map((slot: any) => ({
                    ...slot,
                    date: new Date(slot.date).toISOString().split('T')[0], 
                })) || [];
                
                setOccupiedSlots(mappedSlots);
            } catch (error) {
                console.error("Error fetching occupied slots:", error);
                Toast.show({
                    type: "error",
                    text1: "Không thể tải lịch chiếu đã tồn tại.",
                });
            } finally {
                setIsLoadingSlots(false);
            }
        };
        fetchOccupiedSlots();
    }, []);

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

    // ✅ HELPER: Kiểm tra slot có bị chiếm không
    const isSlotOccupied = useCallback((dateValue: string, timeValue: string, roomValue: string) => {
        return occupiedSlots.some(
            (slot) => 
                slot.date === dateValue && 
                slot.startTime === timeValue && 
                slot.room === roomValue
        );
    }, [occupiedSlots]);

    // ✅ CẬP NHẬT LOGIC: Tạo danh sách xem trước với cờ isOccupied
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
                        isOccupied: isSlotOccupied(dateValue, timeValue, roomValue), 
                    });
                }
            }
        }
        return list;
    }, [selectedRooms, selectedDates, selectedTimes, dateArray, isSlotOccupied]);

    // ✅ LOGIC: TRẢ VỀ CÁC MẢNG GỐC (KHÔNG LỌC)
    const availableOptions = useMemo(() => {
        return {
            rooms: roomArray, 
            dates: dateArray, 
            times: timeArray,
        };
    }, [dateArray]); 

    // ✅ CẬP NHẬT HÀM saveSchedule: LỌC BỎ LỊCH TRÙNG TRƯỚC KHI GỬI
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
        
        // --- LỌC BỎ CÁC LỊCH ĐÃ BỊ CHIẾM TRƯỚC KHI GỬI ---
        const validSchedules = scheduleListPreview.filter(item => !item.isOccupied);
        const conflictedCount = scheduleListPreview.length - validSchedules.length;

        if (validSchedules.length === 0) {
             Toast.show({
                type: "info",
                text1: "Không có lịch chiếu hợp lệ nào để tạo.",
                text2: `${conflictedCount} lịch đã chọn đều trùng với lịch đã tồn tại.`,
            });
            return;
        }
        // ------------------------------------

        const schedulesForServer = validSchedules.map(item => ({
            movieId: movieIdToSend,
            date: item.scheduleDateValue,
            room: item.room,
            startTime: item.scheduleTimeValue,
        }));
        
        try {
            // ✅ 1. KIỂM TRA MOVIE CÓ TỒN TẠI CHƯA 
            let movieExists = await checkMovieExists(String(movieData.tmdb_id));
            try {
                if (movieExists.exists) {
                    console.log("✅ Movie already exists, skip creation.");
                }
            } catch (fetchErr: any) {
                if (fetchErr?.response?.status === 404) {
                    console.log("ℹ️ Movie not found, will create new.");
                    movieExists = false;
                } else {
                    console.warn("⚠️ Error checking movie existence:", fetchErr.message);
                }
            }

            // ✅ 2. NẾU MOVIE CHƯA TỒN TẠI => TẠO MỚI
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
                        console.log("✅ Movie created successfully");
                    }
                } catch (movieErr: any) {
                    const status = movieErr?.response?.status;
                    const message = movieErr?.response?.data?.message;

                    if (status === 409 || (message && message.includes("exists"))) {
                        console.log("⚠️ Movie creation race condition (409), proceed to schedule creation.");
                    } else if (status === 400 || status === 500) {
                        console.error(`❌ Movie creation FAILED (Status: ${status}):`, movieErr.response?.data);
                        Toast.show({
                            type: "error",
                            text1: `Lỗi Server/Validation khi tạo phim (Status ${status}).`,
                            text2: message || "Vui lòng kiểm tra dữ liệu phim.",
                        });
                        return;
                    } else {
                        console.error("❌ Unknown error creating movie:", movieErr);
                        Toast.show({
                            type: "error",
                            text1: "Không thể tạo phim.",
                            text2: movieErr?.message || "Vui lòng kiểm tra kết nối.",
                        });
                        return;
                    }
                }
            }

            // ✅ 3. TẠO LỊCH CHIẾU (Chỉ gửi lịch hợp lệ)
            const response = await createSchedules(schedulesForServer);
            const totalCreated = response.results || response.insertedCount || 0;
            const totalFailedServer = response.errorDetails?.length || 0;

            if (totalCreated > 0) {
                let successText = `${totalCreated} lịch chiếu đã được tạo thành công!`;
                if (conflictedCount > 0) {
                    successText += ` (Đã bỏ qua ${conflictedCount} lịch trùng đã tồn tại).`;
                } else if (totalFailedServer > 0) {
                    successText += ` (${totalFailedServer} lịch bị lỗi/trùng do server).`;
                }

                Toast.show({
                    type: "success",
                    text1: successText,
                });
            } else if (conflictedCount > 0) {
                // Trường hợp tất cả đều bị lọc trước khi gửi
                 Toast.show({
                    type: "info",
                    text1: "Không có lịch chiếu hợp lệ nào được tạo.",
                    text2: `${conflictedCount} lịch đã chọn đều trùng với lịch đã tồn tại.`,
                });
            } else if (totalFailedServer > 0) {
                // Trường hợp không bị lọc, nhưng server báo lỗi/trùng
                Toast.show({
                    type: "info",
                    text1: "Không có lịch chiếu nào được tạo.",
                    text2: `${totalFailedServer} lịch bị bỏ qua do trùng/lỗi trên server.`,
                });
            } else {
                Toast.show({
                    type: "info",
                    text1: "Không có lịch chiếu nào được tạo.",
                });
            }

            navigation.goBack();
        } catch (error: any) {
            console.error("Error saving schedule:", error);
            Toast.show({
                type: "error",
                text1: "Lỗi tạo lịch chiếu.",
                text2: error?.response?.data?.message || "Vui lòng kiểm tra kết nối và dữ liệu.",
            });
        }
    };

    // --- COMPONENT CON CHO CARD XEM TRƯỚC (Logic màu cho lịch trùng) ---
    const PreviewCard = ({ schedule }: any) => {
        // Xác định màu dựa trên cờ isOccupied
        const cardStyle = schedule.isOccupied 
            ? styles.previewCardOccupied // Màu đỏ nhạt cho lịch trùng
            : styles.previewCard;         // Màu mặc định cho lịch còn trống
            
        const borderColor = schedule.isOccupied ? COLORS.Red : COLORS.WhiteRGBA10;

        return (
            <View style={[cardStyle, { borderColor }]}>
                <View style={styles.previewSection}>
                    <FontAwesome6 name="calendar-day" size={16} color={schedule.isOccupied ? COLORS.Red : COLORS.Orange} />
                    <View>
                        <Text style={styles.cardDetailText}>{schedule.day}</Text>
                        <Text style={styles.cardTitleText}>{schedule.date}</Text>
                    </View>
                </View>

                <View style={styles.previewSection}>
                    <FontAwesome6 name="clock" size={16} color={schedule.isOccupied ? COLORS.Red : COLORS.Orange} />
                    <View>
                        <Text style={styles.cardDetailText}>Start Time</Text>
                        <Text style={styles.cardTitleText}>{schedule.time}</Text>
                    </View>
                </View>

                <View style={styles.previewSection}>
                    <MaterialCommunityIcons name="projector-screen" size={18} color={schedule.isOccupied ? COLORS.Red : COLORS.Orange} />
                    <View>
                        <Text style={styles.cardDetailText}>Room</Text>
                        <Text style={styles.cardTitleText}>{schedule.room}</Text>
                    </View>
                </View>
                {schedule.isOccupied && (
                    <Text style={styles.occupiedText}>TRÙNG LỊCH ĐÃ TỒN TẠI</Text>
                )}
            </View>
        );
    };

    // --- HIỂN THỊ LOADING KHI ĐANG TẢI SLOTS ---
    if (isLoadingSlots) {
        return (
            <SafeAreaView style={styles.safeAreaView}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.Orange} />
                    <Text style={styles.loadingText}>Đang tải lịch chiếu đã tồn tại...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // --- RENDER UI ---
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
                <Text style={styles.movieName}>{movieData?.title || route.params?.nameMovie}</Text>
                
                {/* --- SECTION: SELECT ROOM --- */}
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

                {/* --- SECTION: SELECT DATE --- */}
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

                {/* --- SECTION: SELECT TIME --- */}
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
                
                {/* --- SECTION: VISUAL PREVIEW --- */}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.White,
        marginTop: SPACING.space_10,
        fontFamily: FONT_FAMILY.poppins_regular,
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
        borderColor: COLORS.WhiteRGBA10, // Mặc định
        gap: SPACING.space_12,
    },
    previewCardOccupied: {
        width: width * 0.7,
        // Sử dụng giá trị RedRGBA50 hoặc fallback an toàn
        backgroundColor: 'rgba(255, 0, 0, 0.2)', 
        borderRadius: BORDER_RADIUS.radius_12,
        padding: SPACING.space_16,
        borderWidth: 1,
        borderColor: COLORS.Red, // Viền đỏ đậm
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
    occupiedText: {
        fontFamily: FONT_FAMILY.poppins_bold,
        fontSize: FONT_SIZE.size_12,
        color: COLORS.Red,
        textAlign: 'center',
        marginTop: SPACING.space_8,
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