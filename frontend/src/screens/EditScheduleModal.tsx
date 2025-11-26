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
  Dimensions,
  Platform,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import { scheduleApi, roomApi } from "../api/adminApi";
import { X, Film, ChevronDown, DoorOpen, Calendar as CalendarIcon, Clock, Check, CheckCircle, XCircle } from "lucide-react-native";
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

interface EditScheduleModalProps {
  visible: boolean;
  schedule: any;
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

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  visible,
  schedule,
  onClose,
  onSuccess,
}) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState(schedule?.room?._id || "");
  const [date, setDate] = useState(
    schedule?.date ? new Date(schedule.date).toISOString().split("T")[0] : ""
  );
  const [time, setTime] = useState(schedule?.time || "");
  const [basePrice, setBasePrice] = useState(schedule?.basePrice?.toString() || "75000");
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
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
      fetchRooms();
      fetchAllSchedules();
    }
  }, [visible]);

  const fetchRooms = async () => {
    try {
      const result = await roomApi.getAll();
      if (result.success) {
        setRooms(result.data.filter((r: any) => r.status === "active"));
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchAllSchedules = async () => {
    try {
      const result = await scheduleApi.getAll();
      if (result.success) {
        setAllSchedules(result.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  // Generate next 30 days from today
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Check if time slot is available
  const isTimeSlotAvailable = (timeSlot: string) => {
    if (!selectedRoom || !date) return true;
    
    // Kiểm tra xem có lịch nào trùng phòng, ngày, giờ không (trừ lịch hiện tại)
    return !allSchedules.some(
      (s) =>
        s._id !== schedule._id && // Không tính lịch hiện tại
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

  // Get min date (today)
  const getMinDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Get max date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  const showInfo = (type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setInfoDialog({ visible: true, type, title, message });
  };

  const handleUpdate = async () => {
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
      // Auto-calculate status based on date and time
      const scheduleDateTime = new Date(`${date}T${time}`);
      const now = new Date();
      const status = scheduleDateTime < now ? "completed" : "scheduled";

      const result = await scheduleApi.update(schedule._id, {
        room: selectedRoom,
        date,
        time,
        basePrice: price,
        status,
      });

      if (result.success) {
        showInfo("success", "Thành công", "Đã cập nhật lịch chiếu");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        showInfo("error", "Lỗi", result.message || "Không thể cập nhật lịch chiếu");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      showInfo("error", "Lỗi", "Không thể cập nhật lịch chiếu");
    } finally {
      setLoading(false);
    }
  };

  if (!schedule) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chỉnh sửa lịch chiếu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.White} />
            </TouchableOpacity>
          </View>

          {loadingRooms ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.Orange} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Movie Info */}
              <View style={styles.movieInfo}>
                <Film size={24} color={COLORS.Orange} />
                <Text style={styles.movieTitle}>{schedule.movie?.title}</Text>
              </View>

              {/* Room Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phòng chiếu *</Text>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowRoomPicker(true)}
                >
                  <DoorOpen size={20} color={COLORS.WhiteRGBA75} />
                  <Text style={styles.selectButtonText}>
                    {rooms.find((r) => r._id === selectedRoom)?.name || "Chọn phòng..."}
                  </Text>
                  <ChevronDown size={14} color={COLORS.WhiteRGBA50} />
                </TouchableOpacity>
              </View>

              {/* Date & Time - Single Row */}
              <View style={styles.formGroup}>
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeItem}>
                    <Text style={styles.label}>Ngày chiếu *</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <CalendarIcon size={16} color={COLORS.WhiteRGBA75} />
                      <Text style={styles.selectButtonTextCompact}>
                        {date || "Chọn..."}
                      </Text>
                      <ChevronDown size={12} color={COLORS.WhiteRGBA50} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateTimeItem}>
                    <Text style={styles.label}>Giờ chiếu *</Text>
                    <TouchableOpacity
                      style={styles.selectButton}
                      onPress={() => setShowTimePicker(true)}
                      disabled={!selectedRoom || !date}
                    >
                      <Clock size={16} color={COLORS.WhiteRGBA75} />
                      <Text style={styles.selectButtonTextCompact}>
                        {time || "Chọn..."}
                      </Text>
                      <ChevronDown size={12} color={COLORS.WhiteRGBA50} />
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
                  style={[styles.button, styles.updateButton, loading && styles.buttonDisabled]}
                  onPress={handleUpdate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.White} />
                  ) : (
                    <>
                      <Check size={16} color={COLORS.White} />
                      <Text style={styles.updateButtonText}>Cập nhật</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>

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
                <X size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={rooms}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roomItem,
                    selectedRoom === item._id && styles.roomItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedRoom(item._id);
                    setShowRoomPicker(false);
                    // Reset time khi đổi phòng
                    setTime("");
                  }}
                >
                  <DoorOpen
                    size={20}
                    color={selectedRoom === item._id ? COLORS.Orange : COLORS.WhiteRGBA75}
                  />
                  <Text
                    style={[
                      styles.roomItemText,
                      selectedRoom === item._id && styles.roomItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedRoom === item._id && (
                    <Check size={18} color={COLORS.Orange} />
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
                <X size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={date || getMinDate()}
              minDate={getMinDate()}
              maxDate={getMaxDate()}
              onDayPress={(day: any) => {
                setDate(day.dateString);
                setShowDatePicker(false);
                // Reset time khi đổi ngày
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
                <X size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={getTimeSlotsWithAvailability()}
              keyExtractor={(item) => item.time}
              renderItem={({ item }) => {
                return (
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
                      <Clock
                        size={18}
                        color={
                          !item.available
                            ? COLORS.WhiteRGBA25
                            : time === item.time
                            ? COLORS.Orange
                            : COLORS.WhiteRGBA75
                        }
                      />
                      <View style={styles.timeItemText}>
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
                    </View>
                    {item.available ? (
                      <>
                        {time === item.time ? (
                          <Check size={18} color={COLORS.Orange} />
                        ) : (
                          <View style={styles.availableBadge}>
                            <CheckCircle size={14} color={COLORS.Green} />
                            <Text style={styles.availableBadgeText}>Khả dụng</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.unavailableBadge}>
                        <XCircle size={14} color={COLORS.Red} />
                        <Text style={styles.unavailableBadgeText}>Đã có lịch</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
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
    padding: SPACING.space_16,
  },
  modalContainer: {
    width: isWeb ? "85%" : "100%",
    maxWidth: isWeb ? 900 : 500,
    maxHeight: SCREEN_HEIGHT * 0.9,
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_20,
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
    padding: isWeb ? SPACING.space_32 : SPACING.space_20,
  },
  movieInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    backgroundColor: COLORS.Orange + "20",
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    marginBottom: SPACING.space_20,
    borderWidth: 1,
    borderColor: COLORS.Orange + "40",
  },
  movieTitle: {
    flex: 1,
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  formGroup: {
    marginBottom: SPACING.space_20,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.space_12,
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
  updateButton: {
    backgroundColor: COLORS.Orange,
  },
  updateButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Room Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  pickerContent: {
    backgroundColor: COLORS.Black,
    borderTopLeftRadius: BORDER_RADIUS.radius_24,
    borderTopRightRadius: BORDER_RADIUS.radius_24,
    maxHeight: isWeb ? "80%" : "70%",
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
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    padding: SPACING.space_16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA10,
  },
  roomItemSelected: {
    backgroundColor: COLORS.Orange + "20",
  },
  roomItemText: {
    flex: 1,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  roomItemTextSelected: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    color: COLORS.Orange,
  },
  // Date Picker
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.space_16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA10,
  },
  dateItemSelected: {
    backgroundColor: COLORS.Orange + "20",
  },
  dateItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    flex: 1,
  },
  dateItemText: {
    flex: 1,
  },
  dateItemDay: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    textTransform: "capitalize",
  },
  dateItemDate: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
    marginTop: SPACING.space_2,
  },
  dateItemTextSelected: {
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
  timeItemText: {
    flex: 1,
  },
  timeItemTime: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
  },
  timeItemLabel: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
    marginTop: SPACING.space_2,
  },
  timeItemTextSelected: {
    color: COLORS.Orange,
  },
  timeItemLabelSelected: {
    color: COLORS.Orange + "CC",
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

export default EditScheduleModal;
