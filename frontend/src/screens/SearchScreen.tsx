import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { COLORS, SPACING, FONT_FAMILY, FONT_SIZE, BORDER_RADIUS } from "../theme/theme";
import { baseImagePath, searchMovies } from "../api/apicall";
import { useState, useEffect } from "react";
import InputHeader from "../components/InputHeader";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";

const { width } = Dimensions.get("screen");

const SearchScreen = ({ navigation, route }: any) => {
  const [searchList, setSearchList] = useState<any>([]);
  const [initialQuery, setInitialQuery] = useState<string>(
    route.params?.query || ""
  );
  const [refreshing, setRefreshing] = useState(false);

  const searchMoviesFuntion = async (name: string) => {
    try {
      let res = await fetch(searchMovies(name));
      let json = await res.json();
      // Lọc chỉ lấy phim có ID (để fetch details và kiểm tra runtime)
      const moviesWithDetails = await Promise.all(
        json.results.slice(0, 20).map(async (movie: any) => {
          try {
            const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=9cc4c7b681622f1ac6abb9bae36d6f86`);
            const details = await detailRes.json();
            return details.runtime >= 60 ? movie : null;
          } catch {
            return null;
          }
        })
      );
      setSearchList(moviesWithDetails.filter((m) => m !== null));
    } catch (error) {
      console.error("Something went wrong in SearchMovies ", error);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      searchMoviesFuntion(initialQuery);
    }
  }, [initialQuery]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.inputHeaderContainer}>
        <InputHeader
          searchFunction={(text) => {
            setInitialQuery(text);
            searchMoviesFuntion(text);
          }}
          defaultValue={initialQuery}
        />
      </View>
      
      {searchList.length > 0 ? (
        <FlatList
          data={searchList}
          keyExtractor={(movie: any, index: number) =>
            `${movie?.id ?? index}-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item: movie }) => (
            <TouchableOpacity
              style={styles.movieCard}
              onPress={() => navigation.navigate("MovieDetails", { id: movie.id })}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: baseImagePath("w342", movie.poster_path) }}
                style={styles.posterImage}
                resizeMode="cover"
              />
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle} numberOfLines={2}>
                  {movie.original_title || movie.title}
                </Text>
                <View style={styles.ratingContainer}>
                  <FontAwesome6 name="star" size={14} color={COLORS.Yellow} solid />
                  <Text style={styles.ratingText}>
                    {movie.vote_average?.toFixed(1) || "N/A"}
                  </Text>
                  <Text style={styles.voteCount}>
                    ({movie.vote_count || 0})
                  </Text>
                </View>
                {movie.release_date && (
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.WhiteRGBA50} />
                    <Text style={styles.dateText}>
                      {new Date(movie.release_date).getFullYear()}
                    </Text>
                  </View>
                )}
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Description:</Text>
                  <Text style={styles.overview} numberOfLines={2}>
                    {movie.overview || "No description available"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.decorativeContainer}>
            <Ionicons name="film-outline" size={64} color={COLORS.WhiteRGBA10} />
            <Text style={styles.decorativeText}>Discover Your Next Favorite Movie</Text>
            <View style={styles.decorativeSubContainer}>
              <Ionicons name="search-outline" size={16} color={COLORS.WhiteRGBA50} />
              <Text style={styles.decorativeSubText}>Search thousands of movies</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  inputHeaderContainer: {
    marginHorizontal: SPACING.space_28,
    marginTop: SPACING.space_24,
    marginBottom: SPACING.space_16,
  },
  listContainer: {
    paddingHorizontal: SPACING.space_20,
    paddingBottom: SPACING.space_24,
  },
  movieCard: {
    flexDirection: "row",
    backgroundColor: COLORS.BlackRGB5,
    borderRadius: BORDER_RADIUS.radius_15,
    marginBottom: SPACING.space_16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA10,
  },
  posterImage: {
    width: 120,
    height: 180,
  },
  movieInfo: {
    flex: 1,
    padding: SPACING.space_12,
    justifyContent: "space-between",
  },
  movieTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginBottom: SPACING.space_8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_4,
    marginBottom: SPACING.space_8,
  },
  ratingText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  voteCount: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA50,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_4,
    marginBottom: SPACING.space_8,
  },
  dateText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA50,
  },
  descriptionContainer: {
    marginBottom: SPACING.space_8,
  },
  descriptionLabel: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Orange,
    marginBottom: SPACING.space_4,
  },
  overview: {
    fontFamily: FONT_FAMILY.poppins_light,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
    lineHeight: 16,
    marginBottom: 0,
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_4,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.space_12,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDER_RADIUS.radius_15,
    borderWidth: 1,
    borderColor: COLORS.Orange,
  },
  scheduleButtonText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Orange,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.space_36,
  },
  decorativeContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  decorativeText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.WhiteRGBA50,
    marginTop: SPACING.space_20,
    textAlign: "center",
  },
  decorativeSubContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_8,
    marginTop: SPACING.space_16,
  },
  decorativeSubText: {
    fontFamily: FONT_FAMILY.poppins_light,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA50,
  },
});
