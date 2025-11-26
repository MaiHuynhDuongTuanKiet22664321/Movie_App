import React, { useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; // Import hook cần thiết
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import { movieApi } from "../api/adminApi";
import { baseImagePath } from "../api/apicall";
import ConfirmDialog from "../components/ConfirmDialog";

const AdminMovieManagementScreen = () => {
  const navigation = useNavigation<any>(); // Sử dụng navigation
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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

  // Tự động load lại danh sách mỗi khi màn hình này được focus (quay lại từ màn thêm)
  useFocusEffect(
    useCallback(() => {
      fetchMovies();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMovies();
  };

  // Logic xóa phim (Giữ nguyên)
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

  if (loading && !refreshing && movies.length === 0) {
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
              {"Nhấn nút + bên dưới để thêm phim vào hệ thống"}
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

      {/* Floating Action Button - Điều hướng sang trang Add */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AdminAddMovie")} 
        activeOpacity={0.8}
      >
        <FontAwesome6 name="plus" size={20} color={COLORS.White} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Giữ nguyên style cũ của màn hình chính, xóa các style của Search Modal
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
    paddingBottom: SPACING.space_10*8, // Tăng padding bottom để không bị FAB che
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
  // Các style cho Movie Card giữ nguyên như cũ
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
  columnWrapper:{
    gap: SPACING.space_12,
    marginBottom: SPACING.space_12
  }
});

export default AdminMovieManagementScreen;