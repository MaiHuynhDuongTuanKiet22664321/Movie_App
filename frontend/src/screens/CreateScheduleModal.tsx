import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import { scheduleApi, roomApi, movieApi } from "../api/adminApi";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import InfoDialog from "../components/InfoDialog";

// Configure Vietnamese locale
LocaleConfig.locales["vi"] = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
  dayNames: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  today: "Hôm nay",
};
LocaleConfig.defaultLocale = "vi";

interface CreateScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Time slots: 8 ca mỗi ca 3 tiếng - Sắp xếp từ 00:00 đến 24:00
const TIME_SLOTS = [
  { time: "00:00", range: "00:00 - 03:00" },
  { time: "03:00", range: "03:00 - 06:00" },
  { time: "06:00", range: "06:00 - 09:00" },
  { time: "09:00", range: "09:00 - 12:00" },
  { time: "12:00", range: "12:00 - 15:00" },
  { time: "15:00", range: "15:00 - 18:00" },
  { time: "18:00", range: "18:00 - 21:00" },
  { time: "21:00", range: "21:00 - 00:00" },
];

const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [basePrice, setBasePrice] = useState("75000");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showMoviePicker, setShowMoviePicker] = useState(false);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [infoDialog, setInfoDialog] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    try {
      const [moviesRes, roomsRes, schedulesRes] = await Promise.all([
        movieApi.getAll(),
        roomApi.getAll(),
        scheduleApi.getAll(),
      ]);

      if (moviesRes.success) {
        setMovies(moviesRes.data.filter((m: any) => m.status === "active"));
      }

      if (roomsRes.success) {
        setRooms(roomsRes.data.filter((r: any) => r.status === "active"));
      }

      if (schedulesRes.success) {
        setAllSchedules(schedulesRes.data);
      }
    } catch (error) {
      // Error fetching data
    } finally {
      setLoadingData(false);
    }
  };

  // Get min date (2 days from now)
  const getMinDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    return minDate.toISOString().split("T")[0];
  };

  // Get max date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (timeSlot: string) => {
    if (!selectedRoom || !date) return true;
    
    return !allSchedules.some(
      (s) =>
        s.room?._id === selectedRoom &&
        new Date(s.date).toISOString().split("T")[0] === date &&
        s.time === timeSlot
    );
  };

  const getTimeSlotsWithAvailability = () => {
    return TIME_SLOTS.map((slot) => ({
      ...slot,
      available: isTimeSlotAvailable(slot.time),
    }));
  };

  const showInfo = (type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setInfoDialog({ visible: true, type, title, message });
  };

  const handleCreate = async () => {
    // Validate movie
    if (!selectedMovie) {
      showInfo("error", "Lỗi", "Vui lòng chọn phim");
      return;
    }

    // Validate room
    if (!selectedRoom) {
      showInfo("error", "Lỗi", "Vui lòng chọn phòng chiếu");
      return;
    }

    // Validate date
    if (!date) {
      showInfo("error", "Lỗi", "Vui lòng chọn ngày chiếu");
      return;
    }

    // Validate time
    if (!time) {
      showInfo("error", "Lỗi", "Vui lòng chọn giờ chiếu");
      return;
    }

    // Validate price
    if (!basePrice.trim()) {
      showInfo("error", "Lỗi", "Vui lòng nhập giá vé");
      return;
    }

    const price = parseInt(basePrice);
    if (isNaN(price) || price <= 0) {
      showInfo("error", "Lỗi", "Giá vé phải là số dương hợp lệ");
      return;
    }

    if (price < 10000) {
      showInfo("error", "Lỗi", "Giá vé tối thiểu là 10,000 VNĐ");
      return;
    }

    if (price > 1000000) {
      showInfo("error", "Lỗi", "Giá vé tối đa là 1,000,000 VNĐ");
      return;
    }

    setLoading(true);
    try {
      const result = await scheduleApi.create({
        movie: selectedMovie,
        room: selectedRoom,
        date,
        time,
        basePrice: price,
        status: "scheduled",
      });

      if (result.success) {
        showInfo("success", "Thành công", "Đã tạo lịch chiếu mới");
        // Reset form
        setSelectedMovie("");
        setSelectedRoom("");
        setDate("");
        setTime("");
        setBasePrice("75000");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        showInfo("error", "Lỗi", result.message || "Không thể tạo lịch chiếu");
      }
    } catch (error) {
      showInfo("error", "Lỗi", "Không thể tạo lịch chiếu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tạo lịch chiếu mới</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome6 name="xmark" size={24} color={COLORS.White} />
            </TouchableOpacity>
          </View>

          {loadingData ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.Orange} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Movie Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phim *</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowMoviePicker(true)}
                >
                  <MaterialCommunityIcons name="movie-open" size={20} color={COLORS.WhiteRGBA75} />
                  <Text style={styles.selectButtonText}>
                    {movies.find((m) => m._id === selectedMovie)?.title || "Chọn phim..."}
                  </Text>
                  <FontAwesome6 name="chevron-down" size={14} color={COLORS.WhiteRGBA50} />
                </TouchableOpacity>
              </View>

              {/* Room Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phòng chiếu *</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowRoomPicker(true)}
                >
                  <MaterialCommunityIcons name="door" size={20} color={COLORS.WhiteRGBA75} />
                  <Text style={styles.selectButtonText}>
                    {rooms.find((r) => r._id === selectedRoom)?.name || "Chọn phòng..."}
                  </Text>
                  <FontAwesome6 name="chevron-down" size={14} color={COLORS.WhiteRGBA50} />
                </TouchableOpacity>
              </View>

              {/* Date & Time */}
              <View style={styles.formGroup}>
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeItem}>
                    <Text style={styles.label}>Ngày chiếu *</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <FontAwesome6 name="calendar-days" size={16} color={COLORS.WhiteRGBA75} />
                      <Text style={styles.selectButtonTextCompact}>
                        {date || "Chọn..."}
                      </Text>
                      <FontAwesome6 name="chevron-down" size={12} color={COLORS.WhiteRGBA50} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateTimeItem}>
                    <Text style={styles.label}>Giờ chiếu *</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowTimePicker(true)}
                      disabled={!selectedRoom || !date}
                    >
                      <FontAwesome6 name="clock" size={16} color={COLORS.WhiteRGBA75} />
                      <Text style={styles.selectButtonTextCompact}>
                        {time || "Chọn..."}
                      </Text>
                      <FontAwesome6 name="chevron-down" size={12} color={COLORS.WhiteRGBA50} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Price */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Giá vé cơ bản (VNĐ) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="75000"
                  placeholderTextColor={COLORS.WhiteRGBA50}
                  value={basePrice}
                  onChangeText={setBasePrice}
                  keyboardType="number-pad"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.createButton, loading && styles.buttonDisabled]}
                  onPress={handleCreate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.White} />
                  ) : (
                    <>
                      <FontAwesome6 name="check" size={16} color={COLORS.White} />
                      <Text style={styles.createButtonText}>Tạo lịch</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Movie Picker Modal */}
      <Modal
        visible={showMoviePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMoviePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Chọn phim</Text>
              <TouchableOpacity onPress={() => setShowMoviePicker(false)}>
                <FontAwesome6 name="xmark" size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={movies}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    selectedMovie === item._id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedMovie(item._id);
                    setShowMoviePicker(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name="movie-open"
                    size={20}
                    color={selectedMovie === item._id ? COLORS.Orange : COLORS.WhiteRGBA75}
                  />
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedMovie === item._id && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {selectedMovie === item._id && (
                    <FontAwesome6 name="check" size={18} color={COLORS.Orange} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Room Picker Modal */}
      <Modal
        visible={showRoomPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRoomPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Chọn phòng chiếu</Text>
              <TouchableOpacity onPress={() => setShowRoomPicker(false)}>
                <FontAwesome6 name="xmark" size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={rooms}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    selectedRoom === item._id && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedRoom(item._id);
                    setShowRoomPicker(false);
                    setTime("");
                  }}
                >
                  <MaterialCommunityIcons
                    name="door"
                    size={20}
                    color={selectedRoom === item._id ? COLORS.Orange : COLORS.WhiteRGBA75}
                  />
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedRoom === item._id && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedRoom === item._id && (
                    <FontAwesome6 name="check" size={18} color={COLORS.Orange} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.calendarPickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Chọn ngày chiếu</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <FontAwesome6 name="xmark" size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={date || getMinDate()}
              minDate={getMinDate()}
              maxDate={getMaxDate()}
              onDayPress={(day: any) => {
                setDate(day.dateString);
                setShowDatePicker(false);
                setTime("");
              }}
              markedDates={{
                [date]: {
                  selected: true,
                  selectedColor: COLORS.Orange,
                },
              }}
              theme={{
                calendarBackground: COLORS.Black,
                textSectionTitleColor: COLORS.WhiteRGBA75,
                selectedDayBackgroundColor: COLORS.Orange,
                selectedDayTextColor: COLORS.White,
                todayTextColor: COLORS.Orange,
                dayTextColor: COLORS.White,
                textDisabledColor: COLORS.WhiteRGBA25,
                monthTextColor: COLORS.White,
                textMonthFontFamily: FONT_FAMILY.poppins_semibold,
                textDayFontFamily: FONT_FAMILY.poppins_regular,
                textDayHeaderFontFamily: FONT_FAMILY.poppins_medium,
                textMonthFontSize: 18,
                textDayFontSize: 14,
                textDayHeaderFontSize: 12,
              }}
              style={styles.calendar}
            />
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Chọn ca chiếu</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <FontAwesome6 name="xmark" size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getTimeSlotsWithAvailability()}
              keyExtractor={(item) => item.time}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.timeItem,
                    !item.available && styles.timeItemDisabled,
                    time === item.time && styles.timeItemSelected,
                  ]}
                  onPress={() => {
                    if (item.available) {
                      setTime(item.time);
                      setShowTimePicker(false);
                    }
                  }}
                  disabled={!item.available}
                >
                  <View style={styles.timeItemContent}>
                    <FontAwesome6
                      name="clock"
                      size={18}
                      color={
                        !item.available
                          ? COLORS.WhiteRGBA25
                          : time === item.time
                          ? COLORS.Orange
                          : COLORS.WhiteRGBA75
                      }
                    />
                    <Text
                      style={[
                        styles.timeItemTime,
                        !item.available && styles.timeItemTimeDisabled,
                        time === item.time && styles.timeItemTextSelected,
                      ]}
                    >
                      {item.range}
                    </Text>
                  </View>
                  {item.available ? (
                    <>
                      {time === item.time ? (
                        <FontAwesome6 name="check" size={18} color={COLORS.Orange} />
                      ) : (
                        <View style={styles.availableBadge}>
                          <FontAwesome6 name="circle-check" size={14} color={COLORS.Green} />
                          <Text style={styles.availableBadgeText}>Khả dụng</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={styles.unavailableBadge}>
                      <FontAwesome6 name="circle-xmark" size={14} color={COLORS.Red} />
                      <Text style={styles.unavailableBadgeText}>Đã có lịch</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Info Dialog */}
      <InfoDialog
        visible={infoDialog.visible}
        type={infoDialog.type}
        title={infoDialog.title}
        message={infoDialog.message}
        onClose={() => setInfoDialog({ ...infoDialog, visible: false })}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_24,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.space_20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
    backgroundColor: COLORS.DarkGrey,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
  },
  closeButton: {
    padding: SPACING.space_4,
  },
  loadingContainer: {
    padding: SPACING.space_48,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    padding: SPACING.space_20,
  },
  formGroup: {
    marginBottom: SPACING.space_20,
  },
  label: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginBottom: SPACING.space_12,
  },
  input: {
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA25,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA25,
  },
  selectButtonText: {
    flex: 1,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: SPACING.space_8,
  },
  dateTimeItem: {
    flex: 1,
  },
  selectButtonTextCompact: {
    flex: 1,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
  },
  actions: {
    flexDirection: "row",
    gap: SPACING.space_12,
    marginTop: SPACING.space_8,
    marginBottom: SPACING.space_12,
  },
  button: {
    flex: 1,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.space_8,
  },
  cancelButton: {
    backgroundColor: COLORS.WhiteRGBA15,
  },
  cancelButtonText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  createButton: {
    backgroundColor: COLORS.Orange,
  },
  createButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  pickerContent: {
    backgroundColor: COLORS.Black,
    borderTopLeftRadius: BORDER_RADIUS.radius_24,
    borderTopRightRadius: BORDER_RADIUS.radius_24,
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  calendarPickerContent: {
    backgroundColor: COLORS.Black,
    borderTopLeftRadius: BORDER_RADIUS.radius_24,
    borderTopRightRadius: BORDER_RADIUS.radius_24,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    paddingBottom: SPACING.space_20,
  },
  calendar: {
    borderBottomLeftRadius: BORDER_RADIUS.radius_24,
    borderBottomRightRadius: BORDER_RADIUS.radius_24,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.space_24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
  },
  pickerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    padding: SPACING.space_16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA10,
  },
  pickerItemSelected: {
    backgroundColor: COLORS.Orange + "20",
  },
  pickerItemText: {
    flex: 1,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  pickerItemTextSelected: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    color: COLORS.Orange,
  },
  // Time Picker
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.space_16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA10,
  },
  timeItemSelected: {
    backgroundColor: COLORS.Orange + "20",
  },
  timeItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    flex: 1,
  },
  timeItemTime: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  timeItemTextSelected: {
    color: COLORS.Orange,
  },
  timeItemDisabled: {
    backgroundColor: COLORS.WhiteRGBA10,
    opacity: 0.6,
  },
  timeItemTimeDisabled: {
    color: COLORS.WhiteRGBA25,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_4,
    backgroundColor: COLORS.Green + "20",
    paddingHorizontal: SPACING.space_8,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDER_RADIUS.radius_8,
  },
  availableBadgeText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.Green,
  },
  unavailableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_4,
    backgroundColor: COLORS.Red + "20",
    paddingHorizontal: SPACING.space_8,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDER_RADIUS.radius_8,
  },
  unavailableBadgeText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.Red,
  },
});

export default CreateScheduleModal;
