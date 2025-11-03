# Movie App Backend API

Backend API cho ứng dụng Movie App sử dụng Node.js, Express, MongoDB Atlas theo mô hình MVC.

## Cấu trúc thư mục

```
backend/
├── config/
│   └── db.js              # Cấu hình kết nối MongoDB
├── controllers/
│   └── authController.js  # Controller xử lý authentication
├── middleware/
│   └── auth.js            # Middleware xác thực JWT
├── models/
│   └── User.js            # User model
├── routes/
│   └── authRoutes.js      # Routes cho authentication
├── .env.example            # File mẫu cho environment variables
├── .gitignore
├── package.json
├── server.js               # File chính của server
└── README.md
```

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

3. Cập nhật các biến môi trường trong file `.env`:
   - `MONGODB_URI`: Connection string từ MongoDB Atlas
   - `JWT_SECRET`: Secret key cho JWT (nên đặt một giá trị bảo mật cao)
   - `PORT`: Port để chạy server (mặc định: 5000)

4. Chạy server:
```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Đăng ký
- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "password": "password123",
    "phoneNumber": "0912345678" // Optional
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Đăng ký thành công",
    "data": {
      "user": {
        "id": "...",
        "fullName": "Nguyễn Văn A",
        "email": "user@example.com",
        "phoneNumber": "0912345678",
        "role": "user"
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### Đăng nhập
- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "data": {
      "user": {
        "id": "...",
        "fullName": "Nguyễn Văn A",
        "email": "user@example.com",
        "phoneNumber": "0912345678",
        "role": "user"
      },
      "token": "jwt_token_here"
    }
  }
  ```

#### Lấy thông tin user hiện tại (Protected)
- **GET** `/api/auth/me`
- Headers:
  ```
  Authorization: Bearer <token>
  ```
- Response:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "...",
        "fullName": "Nguyễn Văn A",
        "email": "user@example.com",
        "phoneNumber": "0912345678",
        "role": "user",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
  ```

#### Health Check
- **GET** `/api/health`
- Response:
  ```json
  {
    "success": true,
    "message": "Server is running",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

## Cấu hình MongoDB Atlas

1. Đăng ký/đăng nhập vào [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo một cluster mới
3. Tạo database user
4. Whitelist IP address (hoặc `0.0.0.0/0` cho development)
5. Lấy connection string và cập nhật vào file `.env`

Format connection string:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## Bảo mật

- Passwords được hash bằng bcryptjs
- JWT tokens được sử dụng cho authentication
- Validation input bằng express-validator
- CORS được cấu hình để cho phép requests từ client

## Lưu ý

- Đảm bảo thay đổi `JWT_SECRET` trong production
- Không commit file `.env` lên git
- Sử dụng HTTPS trong production

