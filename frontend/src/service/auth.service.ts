
export const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

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
    console.log('🔍 Attempting login to:', AUTH_ENDPOINTS.LOGIN);
    console.log('🔍 Credentials:', { email: credentials.email, password: '***' });
    
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('🔍 Response status:', response.status);
    console.log('🔍 Response ok:', response.ok);

    const data = await response.json();
    console.log('🔍 Response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    return data;
  } catch (error: any) {
    console.error('Login Error:', error);
    console.error('Error details:', error.message);
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
