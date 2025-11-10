import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";

interface SubMoviesCardProps {
  title: string;
  imagePath: string;
  cardWidth: number;
  shouldMarginateAtEnd?: boolean;
  shouldMarginateAround?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  onAddPress?: () => void;
}

const SubMoviesCard = ({
  title,
  imagePath,
  cardWidth,
  shouldMarginateAtEnd,
  shouldMarginateAround,
  isFirst,
  isLast,
  onPress: cardFunction,
  onAddPress,
}: SubMoviesCardProps) => {
  const { user } = useUser();
  return (
    <TouchableOpacity onPress={cardFunction} activeOpacity={0.8}>
      <View
        style={[
          styles.container,
          shouldMarginateAtEnd
            ? isFirst
              ? { marginLeft: SPACING.space_36 }
              : isLast
              ? { marginRight: SPACING.space_36 }
              : {}
            : {},
          shouldMarginateAround ? { margin: SPACING.space_12 } : {},
          { maxWidth: cardWidth },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            style={[styles.cardImage, { width: cardWidth }]}
            resizeMode="contain"
            source={{
              uri:
                imagePath ||
                "https://via.placeholder.com/300x450.png?text=No+Image",
            }}
          />

          {user?.role.trim() === "admin" && (
            <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
              <Ionicons name="add" size={18} color={COLORS.White} />
            </TouchableOpacity>
          )}
        </View>

        <Text numberOfLines={3} style={styles.textTitle}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.Black,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.radius_20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.Orange,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.Orange,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardImage: {
    aspectRatio: 2 / 3,
  },
  addButton: {
    position: "absolute",
    top: SPACING.space_10,
    right: SPACING.space_10,
    backgroundColor: COLORS.Orange,
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  textTitle: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    textAlign: "center",
    paddingVertical: SPACING.space_10,
    letterSpacing: 0.5,
  },
});

export default SubMoviesCard;
