import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import { COLORS, SPACING } from '../theme/theme';

const SaveInfoCheckbox = ({ value, onValueChange } : any) => {
  return (
    <View style={styles.checkboxContainer}>
      <Checkbox
        value={value}
        onValueChange={onValueChange}
        color={value ? COLORS.Orange : "#aaa"}
        style={styles.checkbox}
      />
      
      <View style={styles.checkboxTextContainer}>
        <Text style={styles.checkboxText}>
          Lưu thông tin của tôi để thanh toán nhanh chóng hơn
        </Text>
        <Text style={styles.subText}>
          Thanh toán an toàn tại trang này và mọi nơi chấp nhận Link.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: "row",
    margin: SPACING.space_16,
    marginTop: SPACING.space_24,
    padding: SPACING.space_16,
    backgroundColor: COLORS.DarkGrey,
    borderRadius: SPACING.space_12,
    alignItems: "flex-start",
  },
  checkbox: {
    marginTop: 2,
  },
  checkboxTextContainer: {
    marginLeft: SPACING.space_12,
    flex: 1,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.White,
    lineHeight: 20,
  },
  subText: {
    fontSize: 12,
    color: COLORS.WhiteRGBA50,
    marginTop: 4,
    lineHeight: 16,
  },
});

export default SaveInfoCheckbox;