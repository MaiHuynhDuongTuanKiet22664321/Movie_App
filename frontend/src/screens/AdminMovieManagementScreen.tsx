import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
  FlatList,
  Platform,
} from "react-native";

const isWeb = Platform.OS === 'web';
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { movieApi } from "../api/adminApi";
import { searchMovies, movieDetails, baseImagePath } from "../api/apicall";
import ConfirmDialog from "../components/ConfirmDialog";

const AdminMovieManagementScreen = () => {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [deletingMovie, setDeletingMovie] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMovies = async () => {
    try {
      const result = await movieApi.getAll();
      if (result.success) {
        setMovies(result.data);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách phim");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

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
        Alert.alert("Thành công", "Đã thêm phim vào hệ thống");
        setShowSearchModal(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchMovies();
      } else {
        Alert.alert("Lỗi", result.message || "Không thể thêm phim");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Không thể thêm phim");
    }
  };

  const handleDeleteMovie = (movie: any) => {
    setDeletingMovie(movie);
  };

  const confirmDeleteMovie = async () => {
    if (!deletingMovie) return;
    
    setDeleteLoading(true);
    try {
      const result = await movieApi.delete(deletingMovie._id);
      
      if (result.success) {
        setDeletingMovie(null);
        setDeleteLoading(false);
        setTimeout(() => {
          fetchMovies();
        }, 300);
      } else {
        setDeletingMovie(null);
        setDeleteLoading(false);
        setTimeout(() => {
          Alert.alert("Lỗi", result.message || "Không thể xóa phim");
        }, 300);
      }
    } catch (error: any) {
      setDeletingMovie(null);
      setDeleteLoading(false);
      setTimeout(() => {
        Alert.alert("Lỗi", error?.message || "Không thể kết nối đến server");
      }, 300);
    }
  };

  const renderMovieCard = (movie: any) => (
    <View key={movie._id} style={styles.movieCard}>
      <Image
        source={{ uri: movie.posterUrl || `${baseImagePath("w342", movie.posterPath)}` }}
        style={styles.moviePoster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.movieMetaRow}>
          <View style={styles.movieMeta}>
            <FontAwesome6 name="calendar" size={11} color={COLORS.WhiteRGBA75} />
            <Text style={styles.movieMetaText}>
              {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "N/A"}
            </Text>
          </View>
          <View style={styles.movieMeta}>
            <FontAwesome6 name="clock" size={11} color={COLORS.WhiteRGBA75} />
            <Text style={styles.movieMetaText}>
              {movie.runtime ? `${movie.runtime}p` : "N/A"}
            </Text>
          </View>
        </View>
        <View style={styles.movieRating}>
          <FontAwesome6 name="star" size={14} color={COLORS.Yellow} />
          <Text style={styles.movieRatingText}>{movie.voteAverage?.toFixed(1)}</Text>
          <Text style={styles.movieRatingCount}>({movie.voteCount || 0})</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteMovie(movie)}
        >
          <FontAwesome6 name="trash-can" size={14} color={COLORS.Red} />
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="movie-open" size={32} color={COLORS.Orange} />
          <Text style={styles.headerTitle}>Quản lý phim chiếu</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.Orange} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="movie-open" size={32} color={COLORS.Orange} />
        <Text style={styles.headerTitle}>Quản lý phim chiếu</Text>
      </View>

      <FlatList
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        data={movies}
        renderItem={({ item }) => renderMovieCard(item)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="movie-open"
              size={80}
              color={COLORS.WhiteRGBA25}
            />
            <Text style={styles.emptyTitle}>Chưa có phim nào</Text>
            <Text style={styles.emptySubtitle}>
              {"Nhấn Thêm phim để tìm kiếm và thêm phim vào hệ thống"}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.Orange}
          />
        }
      />

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.searchModalOverlay}>
          <View style={styles.searchModalContainer}>
            {/* Header */}
            <View style={styles.searchModalHeader}>
              <Text style={styles.searchModalTitle}>Tìm kiếm và thêm phim</Text>
              <TouchableOpacity 
                style={styles.searchCloseButton} 
                onPress={() => setShowSearchModal(false)}
              >
                <FontAwesome6 name="xmark" size={20} color={COLORS.White} />
              </TouchableOpacity>
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
                          <TouchableOpacity
                            style={styles.searchAddButton}
                            onPress={() => handleAddMovie(item)}
                          >
                            <FontAwesome6 name="plus" size={14} color={COLORS.White} />
                            <Text style={styles.searchAddButtonText}>Thêm</Text>
                          </TouchableOpacity>
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
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deletingMovie}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa phim "${deletingMovie?.title || 'này'}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDeleteMovie}
        onCancel={() => setDeletingMovie(null)}
        loading={deleteLoading}
        type="danger"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowSearchModal(true)}
        activeOpacity={0.8}
      >
        <FontAwesome6 name="plus" size={20} color={COLORS.White} />
      </TouchableOpacity>
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
  headerTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginTop: SPACING.space_12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.space_24,
    paddingTop: SPACING.space_20,
    paddingBottom: SPACING.space_36,
  },
  headerSection: {
    marginBottom: SPACING.space_24,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.poppins_bold,
    fontSize: FONT_SIZE.size_28,
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  headerSubtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA75,
  },
  fab: {
    position: "absolute",
    bottom: SPACING.space_24,
    right: SPACING.space_24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.Orange,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.Orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  moviesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.space_12,
  },
  movieCard: {
    width: "48%",
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    shadowColor: COLORS.Black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  moviePoster: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.WhiteRGBA10,
  },
  movieInfo: {
    padding: SPACING.space_12,
  },
  movieTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginBottom: SPACING.space_8,
    minHeight: 40,
  },
  movieMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_12,
    marginBottom: SPACING.space_8,
  },
  movieMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_4,
  },
  movieMetaText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA75,
  },
  movieRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.space_4,
    marginBottom: SPACING.space_12,
  },
  movieRatingText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.Yellow,
  },
  movieRatingCount: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA50,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.space_8,
    paddingVertical: SPACING.space_10,
    borderTopWidth: 1,
    borderTopColor: COLORS.WhiteRGBA15,
    marginTop: SPACING.space_8,
    backgroundColor: COLORS.Black + "40",
  },
  deleteButtonText: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.Red,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.space_64,
    gap: SPACING.space_16,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_20,
    color: COLORS.White,
    marginTop: SPACING.space_16,
  },
  emptySubtitle: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
    textAlign: "center",
    paddingHorizontal: SPACING.space_48,
  },
  // Search Modal styles
  searchModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: isWeb ? SPACING.space_32 : SPACING.space_16,
  },
  searchModalContainer: {
    width: isWeb ? "85%" : "100%",
    maxWidth: isWeb ? 900 : undefined,
    maxHeight: isWeb ? "85%" : "90%",
    backgroundColor: COLORS.Black,
    borderRadius: BORDER_RADIUS.radius_20,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
    overflow: "hidden",
  },
  searchModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isWeb ? SPACING.space_24 : SPACING.space_20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
    backgroundColor: COLORS.Black,
  },
  searchModalTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
    flex: 1,
  },
  searchCloseButton: {
    padding: SPACING.space_8,
    borderRadius: BORDER_RADIUS.radius_8,
    backgroundColor: COLORS.WhiteRGBA10,
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
    paddingBottom: isWeb ? SPACING.space_24 : SPACING.space_20,
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
  columnWrapper:{
    gap: SPACING.space_12,
    marginBottom: SPACING.space_12
  }
});

export default AdminMovieManagementScreen;
