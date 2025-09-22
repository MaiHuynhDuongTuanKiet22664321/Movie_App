import * as React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";

const SettingComponent = (props: any) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      {/* Icon bên trái */}
      <View style={styles.iconWrapper}>
        <Ionicons name={props.icon} style={styles.iconStyle} />
      </View>

      {/* Nội dung */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.heading}</Text>
        <Text style={styles.subtitle}>{props.subheading}</Text>
        <Text style={styles.subtitle}>{props.subtitle}</Text>
      </View>

      {/* Mũi tên */}
      <Octicons name="chevron-right" size={22} color={COLORS.White} />
    </TouchableOpacity>
  );
};

export default SettingComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.space_16,
    paddingHorizontal: SPACING.space_20,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: 12,
    marginBottom: SPACING.space_16,
  },
  iconWrapper: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: COLORS.WhiteRGBA10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.space_16,
  },
  iconStyle: {
    color: COLORS.White,
    fontSize: FONT_SIZE.size_20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.Grey,
    lineHeight: 18,
  },
});
