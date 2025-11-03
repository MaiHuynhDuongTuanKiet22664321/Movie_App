import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { updateUserProfile } from '../api/authApi';
import { useUser } from '../context/UserContext';
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '../theme/theme';
import Toast from 'react-native-toast-message';
import AppHeader from '../components/MovieDetailsHeader';

const EditProfileScreen = ({ navigation }: any) => {
  const { user, token, setUser } = useUser();
  const nav = useNavigation<any>();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    setError('');

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return false;
    }

    if (fullName.trim().length < 2) {
      setError('Họ và tên phải có ít nhất 2 ký tự');
      return false;
    }

    if (phoneNumber && !/^[0-9]{10,11}$/.test(phoneNumber.trim())) {
      setError('Số điện thoại không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!token) {
      setError('Vui lòng đăng nhập lại');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await updateUserProfile(
        {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
        },
        token
      );

      if (response.success && response.data) {
        // Cập nhật user data trong context (giữ nguyên token)
        setUser(response.data.user, token);

        Toast.show({
          type: 'success',
          text1: 'Cập nhật thành công',
          text2: 'Thông tin của bạn đã được cập nhật',
        });

        // Quay lại màn hình trước
        nav.goBack();
      }
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      setError(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
      Toast.show({
        type: 'error',
        text1: 'Cập nhật thất bại',
        text2: error.message || 'Vui lòng thử lại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          nameIcon="close-circle-outline"
          header="Chỉnh sửa thông tin"
          action={() => nav.goBack()}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#FF6347" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Email (read-only) */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <View style={styles.inputDisabled}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.inputValue}>{user?.email || ''}</Text>
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại (tùy chọn)"
                  placeholderTextColor="#666"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thông tin</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_20 * 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.space_24,
    paddingBottom: SPACING.space_36,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 99, 71, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: SPACING.space_20,
    marginBottom: SPACING.space_16,
    borderWidth: 1,
    borderColor: '#FF6347',
  },
  errorText: {
    color: '#FF6347',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    marginTop: SPACING.space_24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  inputContainer: {
    flex: 1,
  },
  inputDisabled: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.poppins_regular,
  },
  input: {
    color: COLORS.White,
    fontSize: FONT_SIZE.size_16,
    fontFamily: FONT_FAMILY.poppins_regular,
    paddingVertical: 0,
  },
  inputValue: {
    color: COLORS.WhiteRGBA50,
    fontSize: FONT_SIZE.size_16,
    fontFamily: FONT_FAMILY.poppins_regular,
  },
  saveButton: {
    backgroundColor: COLORS.Orange,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.space_24,
    marginBottom: SPACING.space_24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.White,
    fontSize: FONT_SIZE.size_18,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.poppins_semibold,
  },
});

export default EditProfileScreen;

