import React from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { LinearGradient } from "expo-linear-gradient";

const genreList: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

interface MoviesCardProps {
  title: string;
  imagePath: string;
  cardWidth: number;
  shouldMarginateAtEnd?: boolean;
  shouldMarginateAround?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  onAddPress?: () => void;
  genre?: number[];
  vote_average?: number;
  vote_count?: number;
}

const MoviesCard = ({
  title,
  imagePath,
  cardWidth,
  shouldMarginateAtEnd,
  shouldMarginateAround,
  isFirst,
  isLast,
  onPress: cardFunction,
  onAddPress,
  genre,
  vote_average,
  vote_count,
}: MoviesCardProps) => {
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
            resizeMode="cover"
            source={{
              uri:
                imagePath ||
                "https://via.placeholder.com/300x450.png?text=No+Image",
            }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />
        </View>

        <View style={styles.rateContainer}>
          <FontAwesome6 name="star" style={styles.starIcon} />
          <Text style={styles.voteText}>
            {vote_average} ({vote_count})
          </Text>
        </View>

        <Text numberOfLines={3} style={styles.textTitle}>
          {title}
        </Text>

        <View style={styles.genreContainer}>
          {genre?.map((item: any) => (
            <View key={item} style={styles.genreBox}>
              <Text style={styles.genreText}>{genreList[item]}</Text>
            </View>
          ))}
        </View>
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
    ...Platform.select({
      ios: {
        shadowColor: COLORS.Orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardImage: {
    aspectRatio: 2 / 3,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  addButton: {
    position: "absolute",
    top: SPACING.space_10,
    right: SPACING.space_10,
    backgroundColor: COLORS.Orange,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  textTitle: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
    textAlign: "center",
    paddingVertical: SPACING.space_10,
    letterSpacing: 0.5,
  },
  rateContainer: {
    flexDirection: "row",
    gap: SPACING.space_4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.space_10,
  },
  starIcon: {
    fontSize: FONT_SIZE.size_20,
    color: COLORS.Yellow,
  },
  voteText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  genreContainer: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  genreBox: {
    borderColor: COLORS.WhiteRGBA25,
    borderWidth: 1,
    paddingVertical: SPACING.space_4,
    paddingHorizontal: SPACING.space_10,
    borderRadius: BORDER_RADIUS.radius_20,
  },
  genreText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.White,
  },
});

export default MoviesCard;
