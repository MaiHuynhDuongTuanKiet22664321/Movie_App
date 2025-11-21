# 🔍 KIỂM TRA THANH TOÁN VÉ - CHECKLIST

## 1️⃣ Kiểm tra TOKEN (Frontend)

### ✅ Bước 1: Xác nhận token được lưu
```typescript
// Tại UserContext hoặc trước khi gọi booking API
import * as SecureStore from 'expo-secure-store';

const token = await SecureStore.getItemAsync('token');
console.log('Token:', token ? '✓ Có token' : '✗ Không có token');
```

### ✅ Bước 2: Xác nhận token format
Token phải có format: `eyJhbGc...` (JWT format)
- Nếu token để trống → **Người dùng chưa đăng nhập** ❌
- Nếu token lạ → **Token hết hạn hoặc không hợp lệ** ❌

---

## 2️⃣ Kiểm tra USER ID (Backend + Frontend)

### ✅ Backend: Auth Middleware
File: `backend/middleware/auth.js`
```javascript
// Middleware sẽ giải mã token và set req.user
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await User.findById(decoded.userId).select('-password');
req.user = user;  // ← Điều này PHẢI được set
```

### ✅ Frontend: User Context
File: `frontend/src/context/UserContext.tsx`
```typescript
// Kiểm tra user được lưu từ đăng nhập
const { user, token } = useUser();
console.log('User ID:', user?.id);
console.log('Token:', token);
```

---

## 3️⃣ Kiểm tra SCHEDULE ID (Frontend)

### ✅ Format hợp lệ của MongoDB ObjectId
MongoDB ObjectId là **24 ký tự HEX**: `5f7e3c4b1a2c3d4e5f6g7h8i`

### ✅ Kiểm tra trước khi gọi API
File: `frontend/src/screens/SeatBookingScreen.tsx`
```typescript
const { scheduleId, movieData, schedule } = route.params;

// Kiểm tra scheduleId
if (!scheduleId || scheduleId.length !== 24) {
  Alert.alert('Lỗi', 'ID lịch chiếu không hợp lệ');
  return;
}
```

### ✅ Kiểm tra trong Booking API
File: `frontend/src/api/bookingApi.ts` (đã cập nhật)
```typescript
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

if (!isValidObjectId(bookingData.scheduleId)) {
  throw new Error(`scheduleId không hợp lệ: ${bookingData.scheduleId}`);
}
```

---

## 4️⃣ LUỒNG YÊU CẦU ĐẬT VÉ

### 📡 Request Flow:
```
Frontend (PaymentScreen)
    ↓ gọi bookingApi.createBooking()
    ├─ Kiểm tra token ✓
    ├─ Kiểm tra scheduleId format ✓
    ├─ Kiểm tra selectedSeats ✓
    ├─ Gửi Authorization header: "Bearer {token}" ✓
    ↓
Backend API (POST /api/bookings)
    ├─ Middleware auth.js verify token ✓
    ├─ Kiểm tra req.user._id tồn tại ✓
    ├─ Kiểm tra scheduleId ObjectId valid ✓
    ├─ Tìm Schedule trong DB ✓
    ├─ Kiểm tra ghế trùng ✓
    ├─ Cập nhật Schedule seats status ✓
    ├─ Tạo Ticket ✓
    ↓
Response
    └─ Trả về ticket data
```

---

## 5️⃣ CÁC LỖI THƯỜNG GẶP

### ❌ Lỗi 1: "Token không hợp lệ"
**Nguyên nhân:** Token hết hạn hoặc không được gửi đúng
**Cách fix:**
```
1. Đăng xuất
2. Đăng nhập lại
3. Kiểm tra SecureStore lưu token đúng
```

### ❌ Lỗi 2: "ID lịch chiếu không hợp lệ"
**Nguyên nhân:** scheduleId không phải MongoDB ObjectId (24 HEX)
**Cách debug:**
```typescript
// Thêm console.log trước khi gọi booking
console.log('ScheduleId:', scheduleId);
console.log('Length:', scheduleId.length);
console.log('Is valid ObjectId:', /^[0-9a-fA-F]{24}$/.test(scheduleId));
```

### ❌ Lỗi 3: "Không tìm thấy lịch chiếu"
**Nguyên nhân:** Schedule không tồn tại hoặc được xóa
**Cách fix:**
```
1. Kiểm tra database có schedule chưa
2. Kiểm tra scheduleId gửi đúng không
3. Kiểm tra schedule không bị xóa
```

### ❌ Lỗi 4: "Ghế xxx đã được đặt"
**Nguyên nhân:** Ghế được đặt bởi người khác giữa lúc chọn ghế và thanh toán
**Cách fix:**
```
1. Hãy chọn ghế khác
2. Hoặc load lại danh sách ghế trống
```

### ❌ Lỗi 5: Status 401 "Người dùng không tồn tại"
**Nguyên nhân:** User không tìm thấy trong DB hoặc user bị xóa
**Cách debug:**
```typescript
// Backend auth middleware
const user = await User.findById(decoded.userId).select('-password');
if (!user) {
  console.log('User không tìm thấy:', decoded.userId);
  // return 401
}
```

---

## 6️⃣ TEST CURL COMMAND

### ✅ Test API trực tiếp (có token)
```bash
# 1. Thay token từ đăng nhập
TOKEN="your_jwt_token_here"

# 2. Thay scheduleId từ database
SCHEDULE_ID="66e7f4a1c1b2c3d4e5f6g7h8"

# 3. Gọi API
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "'$SCHEDULE_ID'",
    "selectedSeats": ["A1", "A2"],
    "totalPrice": 195000,
    "paymentMethod": "cash"
  }'
```

---

## 7️⃣ KIỂM TRA DATABASE

### ✅ Xác nhận User tồn tại
```javascript
// MongoDB
db.users.findOne({ email: "user@example.com" })
// Output: { _id: ObjectId(...), email: "...", ... }
```

### ✅ Xác nhận Schedule tồn tại
```javascript
db.schedules.findOne({ _id: ObjectId("...") })
// Output: { movie: ObjectId, room: ObjectId, date: "2025-11-21", ... }
```

### ✅ Xác nhận Ticket được tạo
```javascript
db.tickets.find({ userId: ObjectId("...") })
```

---

## 8️⃣ CHECKLIST TRƯỚC KHI THANH TOÁN

- [ ] Đã đăng nhập thành công
- [ ] Token được lưu trong SecureStore
- [ ] Chọn ít nhất 1 ghế
- [ ] scheduleId có 24 ký tự hex
- [ ] totalPrice > 0
- [ ] Chọn phương thức thanh toán
- [ ] Internet kết nối ổn định
- [ ] Backend server chạy bình thường
- [ ] Database MongoDB connect được

---

**✅ Nếu tất cả kiểm tra pass → Thanh toán sẽ hoạt động!**
