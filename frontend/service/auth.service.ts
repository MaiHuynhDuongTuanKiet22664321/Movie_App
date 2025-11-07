
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// API endpoints
const AUTH_ENDPOINTS = {
  REGISTER: `${BASE_URL}/api/auth/register`,
  LOGIN: `${BASE_URL}/api/auth/login`,
  UPDATE_PROFILE: `${BASE_URL}/api/auth/profile`,
};


// Register user
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}) => {

  try {
    const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    return data;
  } catch (error: any) {
    console.error('Register Error:', error);
    throw new Error(error.message || 'Không thể kết nối đến server');
  }
};

// Login user
export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    return data;
  } catch (error: any) {
    console.error('Login Error:', error);
    throw new Error(error.message || 'Không thể kết nối đến server');
  }
};

// Update user profile (requires token)
export const updateUserProfile = async (
  updateData: {
    fullName?: string;
    phoneNumber?: string;
  },
  token: string
) => {

  try {
    const response = await fetch(AUTH_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (response.status === 401 && data.message?.includes('expired')) {
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Cập nhật thất bại');
    }

    return data;
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    throw new Error(error.message || 'Không thể kết nối đến server');
  }
};
