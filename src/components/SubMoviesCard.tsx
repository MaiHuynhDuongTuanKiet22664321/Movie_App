import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";

interface SubMoviesCardProps {
  title: string;
  imagePath: string;
  cardWidth: number;
  shouldMarginateAtEnd?: boolean;
  shouldMarginateAround?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}

const SubMoviesCard = ({
  title,
  imagePath,
  cardWidth,
  shouldMarginateAtEnd,
  shouldMarginateAround,
  isFirst,
  isLast,
  onPress: cardFuntion,
}: SubMoviesCardProps) => {
  return (
    <TouchableOpacity onPress={cardFuntion}>
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
        <Image
          style={[styles.cardImage, { width: cardWidth }]}
          source={{
            uri:
              imagePath ||
              "https://via.placeholder.com/300x450.png?text=No+Image",
          }}
        />
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
    aspectRatio: 2/3,
    borderRadius: BORDER_RADIUS.radius_20,
    resizeMode: "cover",
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
