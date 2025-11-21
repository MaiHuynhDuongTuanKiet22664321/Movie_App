import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
  FlatList,
} from "react-native";
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.Orange}
          />
        }
      >


        {movies.length === 0 ? (
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
        ) : (
          <View style={styles.moviesGrid}>
            <FlatList data={movies} renderItem={({ item }) => renderMovieCard(item)} numColumns={2} columnWrapperStyle={styles.columnWrapper} />
          </View>
        )}
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tìm kiếm phim</Text>
              <TouchableOpacity onPress={() => setShowSearchModal(false)}>
                <FontAwesome6 name="xmark" size={24} color={COLORS.White} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Nhập tên phim..."
                placeholderTextColor={COLORS.WhiteRGBA50}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <FontAwesome6 name="magnifying-glass" size={18} color={COLORS.White} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.searchResults}>
              {searching ? (
                <View style={styles.searchingContainer}>
                  <ActivityIndicator size="large" color={COLORS.Orange} />
                  <Text style={styles.searchingText}>Đang tìm kiếm...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                searchResults.map((movie) => (
                  <View key={movie.id} style={styles.searchResultItem}>
                    <Image
                      source={{ uri: `${baseImagePath("w92", movie.poster_path)}` }}
                      style={styles.searchResultPoster}
                    />
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>
                        {movie.title}
                      </Text>
                      <Text style={styles.searchResultYear}>
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addMovieButton}
                      onPress={() => handleAddMovie(movie)}
                    >
                      <FontAwesome6 name="plus" size={18} color={COLORS.White} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <MaterialCommunityIcons
                    name="movie-search"
                    size={60}
                    color={COLORS.WhiteRGBA25}
                  />
                  <Text style={styles.noResultsText}>
                    {searchQuery ? "Không tìm thấy phim nào" : "Nhập tên phim để tìm kiếm"}
                  </Text>
                </View>
              )}
            </ScrollView>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.Black,
    borderTopLeftRadius: BORDER_RADIUS.radius_24,
    borderTopRightRadius: BORDER_RADIUS.radius_24,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.space_24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WhiteRGBA15,
  },
  modalTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_18,
    color: COLORS.White,
  },
  searchContainer: {
    flexDirection: "row",
    padding: SPACING.space_16,
    gap: SPACING.space_12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA25,
  },
  searchButton: {
    backgroundColor: COLORS.Orange,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_16,
    justifyContent: "center",
    alignItems: "center",
    width: 56,
  },
  searchResults: {
    flex: 1,
    padding: SPACING.space_16,
  },
  searchingContainer: {
    padding: SPACING.space_48,
    alignItems: "center",
    justifyContent: "center",
  },
  searchingText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginTop: SPACING.space_12,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.DarkGrey,
    borderRadius: BORDER_RADIUS.radius_12,
    padding: SPACING.space_12,
    marginBottom: SPACING.space_12,
    borderWidth: 1,
    borderColor: COLORS.WhiteRGBA15,
  },
  searchResultPoster: {
    width: 60,
    height: 90,
    borderRadius: BORDER_RADIUS.radius_8,
    backgroundColor: COLORS.WhiteRGBA10,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: SPACING.space_12,
  },
  searchResultTitle: {
    fontFamily: FONT_FAMILY.poppins_semibold,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    marginBottom: SPACING.space_4,
  },
  searchResultYear: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_12,
    color: COLORS.WhiteRGBA75,
  },
  addMovieButton: {
    backgroundColor: COLORS.Orange,
    borderRadius: BORDER_RADIUS.radius_8,
    padding: SPACING.space_12,
  },
  noResultsContainer: {
    padding: SPACING.space_48,
    alignItems: "center",
    justifyContent: "center",
  },
  noResultsText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.WhiteRGBA50,
    marginTop: SPACING.space_16,
    textAlign: "center",
  },
  columnWrapper:{
    gap: SPACING.space_12,
    marginBottom: SPACING.space_12
  }
});

export default AdminMovieManagementScreen;
