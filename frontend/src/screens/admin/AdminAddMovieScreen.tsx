import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Hook điều hướng
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../../theme/theme";
import { movieApi, scheduleApi } from "../../api/adminApi";
import { searchMovies, movieDetails, baseImagePath } from "../../api/apicall";

const isWeb = Platform.OS === 'web';

const AdminAddMovieScreen = () => {
  const navigation = useNavigation(); // Sử dụng navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [scheduledMovies, setScheduledMovies] = useState<Set<number>>(new Set());

  const isMovieScheduled = (tmdbId: number) => {
    return scheduledMovies.has(tmdbId);
  };

  useEffect(() => {
    const fetchScheduledMovies = async () => {
      try {
        const response = await movieApi.getAll();
        
        let movies = [];
        if (response && response.success && Array.isArray(response.data)) {
          movies = response.data;
        }
        
        console.log("All movies array:", movies);
        
        const scheduledTmdbIds = new Set<number>();
        
        // Extract tmdbId from all saved movies
        movies.forEach((movie: any) => {
          if (movie?.tmdbId) {
            scheduledTmdbIds.add(movie.tmdbId);
          }
        });
        
        console.log("Scheduled TMDB IDs:", scheduledTmdbIds);
        setScheduledMovies(scheduledTmdbIds);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      }
    };

    fetchScheduledMovies();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(searchMovies(searchQuery));
      const result = await response.json();
      setSearchResults(result.results || []);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tìm kiếm phim");
    } finally {
      setSearching(false);
    }
  };

  const handleAddMovie = async (tmdbMovie: any) => {
    try {
      // Get full movie details
      const detailsResponse = await fetch(movieDetails(tmdbMovie.id));
      const details = await detailsResponse.json();
      
      const movieData = {
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        originalTitle: tmdbMovie.original_title,
        overview: tmdbMovie.overview,
        posterUrl: tmdbMovie.poster_path ? `${baseImagePath("w500", tmdbMovie.poster_path)}` : "",
        backdropUrl: tmdbMovie.backdrop_path ? `${baseImagePath("original", tmdbMovie.backdrop_path)}` : "",
        releaseDate: tmdbMovie.release_date,
        voteAverage: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        runtime: details.runtime,
        genres: details.genres,
        tagline: details.tagline,
      };

      const result = await movieApi.add(movieData);
      
      if (result.success) {
        Alert.alert("Thành công", "Đã thêm phim vào hệ thống", [
            { text: "OK", onPress: () => navigation.goBack() } // Quay lại trang danh sách sau khi thêm
        ]);
      } else {
        Alert.alert("Lỗi", result.message || "Không thể thêm phim");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể thêm phim");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header với nút Back */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome6 name="arrow-left" size={20} color={COLORS.White} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm phim mới</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập tên phim để tìm kiếm..."
          placeholderTextColor={COLORS.WhiteRGBA50}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={styles.searchSubmitButton} 
          onPress={handleSearch}
          disabled={!searchQuery.trim() || searching}
        >
          {searching ? (
            <ActivityIndicator size="small" color={COLORS.White} />
          ) : (
            <FontAwesome6 name="magnifying-glass" size={16} color={COLORS.White} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <View style={styles.searchResultsContainer}>
        {searching ? (
          <View style={styles.searchLoadingContainer}>
            <ActivityIndicator size="large" color={COLORS.Orange} />
            <Text style={styles.searchLoadingText}>Đang tìm kiếm phim...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            style={styles.searchResultsList}
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.searchResultCard}>
                <Image
                  source={{ uri: `${baseImagePath("w154", item.poster_path)}` }}
                  style={styles.searchResultPoster}
                />
                <View style={styles.searchResultContent}>
                  <Text style={styles.searchResultTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.searchResultDate}>
                    {item.release_date ? new Date(item.release_date).getFullYear() : "N/A"} • {item.original_language?.toUpperCase() || 'N/A'}
                  </Text>
                  <View style={styles.searchResultMeta}>
                    <Text style={styles.searchResultRating}>⭐ {item.vote_average?.toFixed(1) || 'N/A'}</Text>
                    {isMovieScheduled(item.id) ? (
                      <TouchableOpacity
                        style={[styles.searchAddButton, styles.searchAddButtonDisabled]}
                        disabled={true}
                      >
                        <FontAwesome6 name="check" size={14} color={COLORS.White} />
                        <Text style={styles.searchAddButtonText}>Đã thêm</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.searchAddButton}
                        onPress={() => handleAddMovie(item)}
                      >
                        <FontAwesome6 name="plus" size={14} color={COLORS.White} />
                        <Text style={styles.searchAddButtonText}>Thêm</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.searchEmptyContainer}>
            <MaterialCommunityIcons
              name="movie-search-outline"
              size={isWeb ? 80 : 60}
              color={COLORS.WhiteRGBA25}
            />
            <Text style={styles.searchEmptyTitle}>
              {searchQuery ? "Không tìm thấy phim nào" : "Bắt đầu tìm kiếm phim"}
            </Text>
            <Text style={styles.searchEmptySubtitle}>
              {searchQuery ? "Thử tìm với từ khóa khác" : "Nhập tên phim và nhấn tìm kiếm"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
    paddingTop: SPACING.space_36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_20,
    gap: SPACING.space_12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
  },
  backButton: {
    padding: SPACING.space_8,
    borderRadius: BORDER_RADIUS.radius_20,
    backgroundColor: COLORS.WhiteRGBA10,
  },
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: isWeb ? SPACING.space_24 : SPACING.space_20,
    marginBottom: isWeb ? SPACING.space_20 : SPACING.space_16,
    gap: SPACING.space_12,
  },
  searchInput: {
    flex: 1,
    height: isWeb ? 52 : 48,
    backgroundColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_12,
    paddingHorizontal: SPACING.space_16,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  searchSubmitButton: {
    width: isWeb ? 52 : 48,
    height: isWeb ? 52 : 48,
    backgroundColor: COLORS.Orange,
    borderRadius: BORDER_RADIUS.radius_12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: isWeb ? SPACING.space_24 : SPACING.space_20,
  },
  searchLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_16,
  },
  searchLoadingText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.WhiteRGBA75,
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultCard: {
    flexDirection: "row",
    backgroundColor: COLORS.WhiteRGBA5,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_12,
    marginBottom: SPACING.space_12,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA10,
  },
  searchResultPoster: {
    width: isWeb ? 80 : 60,
    height: isWeb ? 120 : 90,
    borderRadius: BORDER_RADIUS.radius_8,
    backgroundColor: COLORS.WhiteRGBA10,
  },
  searchResultContent: {
    flex: 1,
    marginLeft: SPACING.space_12,
    justifyContent: "space-between",
  },
  searchResultTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_16,
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  searchResultDate: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
    marginBottom: SPACING.space_8,
  },
  searchResultMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchResultRating: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.Orange,
  },
  searchAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.Green,
    paddingHorizontal: SPACING.space_12,
    paddingVertical: SPACING.space_8,
    borderRadius: BORDER_RADIUS.radius_8,
    gap: SPACING.space_8,
  },
  searchAddButtonDisabled: {
    backgroundColor: COLORS.WhiteRGBA50,
  },
  searchAddButtonText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.White,
  },
  searchEmptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_16,
  },
  searchEmptyTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
    textAlign: "center",
  },
  searchEmptySubtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
  },
});

export default AdminAddMovieScreen;