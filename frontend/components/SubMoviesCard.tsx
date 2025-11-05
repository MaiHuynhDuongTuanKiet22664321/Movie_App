import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
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
    <TouchableOpacity onPress={cardFunction}>
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
        <View>
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
  cardImage: {
    aspectRatio: 2 / 3,
    borderRadius: BORDER_RADIUS.radius_20,
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
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    textAlign: "center",
    paddingVertical: SPACING.space_10,
  },
});

export default SubMoviesCard;
