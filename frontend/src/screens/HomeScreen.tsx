import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { COLORS, SPACING } from "../theme/theme";
import {
  upComingMovie,
  nowPlayingMovie,
  popularMovie,
  baseImagePath,
} from "../api/apicall";
import InputHeader from "../components/InputHeader";
import CategogyHeader from "../components/CategogyHeader";
import SubMoviesCard from "../components/SubMoviesCard";
import MoviesCard from "../components/MoviesCard";
import { fetchAllMovies } from "../service/movie.service";

const { width } = Dimensions.get("window");

// Giữ nguyên các hàm fetch từ TMDB
const getNowPlayingMoviesList = async () => {
  try {
    let res = await fetch(nowPlayingMovie);
    let json = await res.json();
    return json.results;
  } catch (error) {
    console.error("Error fetching Now Playing movies:", error);
    return []; // Trả về mảng rỗng nếu lỗi
  }
};

const getPopularMoviesList = async () => {
  try {
    let res = await fetch(popularMovie);
    let json = await res.json();
    return json.results;
  } catch (error) {
    console.error("Error fetching Popular movies:", error);
    return [];
  }
};

const getUpComingMoviesList = async () => {
  try {
    let res = await fetch(upComingMovie);
    let json = await res.json();
    return json.results;
  } catch (error) {
    console.error("Error fetching Upcoming movies:", error);
    return [];
  }
};

// SỬA LỖI CHÍNH: Không dùng JSON.stringify(), đảm bảo trả về mảng.
const getMoviesShechedule = async () => {
  try {
    let res = await fetchAllMovies();
    // Giả định res.data đã là mảng các đối tượng phim.
    // Nếu res.data là JSON string, bạn phải dùng JSON.parse(res.data)
    // Nhưng thông thường, fetchAllMovies() đã trả về đối tượng/mảng JS.
    if (Array.isArray(res.data)) {
        return res.data; 
    }
    // Trường hợp xấu nhất (res.data là chuỗi JSON), bạn cần parse:
    // return JSON.parse(res.data);
    
    // Nếu không phải mảng, trả về mảng rỗng để FlatList không lỗi
    return [];
  } catch (error) {
    console.error("Something went wrong in Movie Schedule fetching: ", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};


const HomeScreen = ({ navigation }: any) => {
  const [nowPlayMoviesList, setNowPlayMoviesList] = useState<any>();
  const [popularMoviesList, setPopularMoviesList] = useState<any>();
  const [upComingMoviesList, setUpComingMoviesList] = useState<any>();
  const [moviesShechedule, setMoviesShechedule] = useState<any>();
  const [isLoading, setIsLoading] = useState(true); // Thêm trạng thái loading

  useEffect(() => {
    (async () => {
      // Gọi tất cả API song song để cải thiện hiệu suất
      const [
        nowPlaying,
        popular,
        upcoming,
        schedule,
      ] = await Promise.all([
        getNowPlayingMoviesList(),
        getPopularMoviesList(),
        getUpComingMoviesList(),
        getMoviesShechedule(),
      ]);

      setNowPlayMoviesList(nowPlaying);
      setPopularMoviesList(popular);
      setUpComingMoviesList(upcoming);
      setMoviesShechedule(schedule);
      setIsLoading(false); // Kết thúc loading khi tất cả dữ liệu đã được fetch
    })();
  }, []);

  const searchMoviesFuntion = (text: string) => {
    navigation.navigate("Search", { query: text });
  };

  // SỬA ĐIỀU KIỆN LOADING
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, styles.container]}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );
  }

  // Đảm bảo item.data là một mảng trước khi dùng
  const sections = [
    // moviesShechedule đảm bảo là mảng (có thể rỗng)
    { title: "Movies Schedule", data: moviesShechedule || [] }, 
    { title: "Now Playing", data: nowPlayMoviesList || [] },
    { title: "Popular Movies", data: popularMoviesList || [] },
    { title: "Upcoming Movies", data: upComingMoviesList || [] },
  ];

  return (
    <FlatList
      style={styles.container}
      data={sections}
      keyExtractor={(item) => item.title}
      nestedScrollEnabled={true}
      ListHeaderComponent={
        <View style={styles.inputHeaderContainer}>
          <InputHeader searchFunction={searchMoviesFuntion} />
        </View>
      }
      renderItem={({ item }) => (
        <View>
          <CategogyHeader title={item.title} />
          {item.data && item.data.length > 0 ? (
            <FlatList
              data={item.data}
              keyExtractor={(movie: any, index: number) =>
                `${(movie?.id ?? movie?.tmdb_id ?? movie?.title ?? 'movie')}-${index}`
              }
              horizontal
              bounces={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.containerGap36}
              // Thêm snapToInterval chỉ cho phần Movies Schedule nếu cần
              {...(item.title === "Movies Schedule" && { snapToInterval: width * 0.7 + SPACING.space_36 })}
              ListHeaderComponent={<View style={{ width: SPACING.space_28 }} />}
              ListFooterComponent={<View style={{ width: SPACING.space_28 }} />}
              renderItem={({ item: movie }) => 
                item.title === "Movies Schedule" ? (
                  <MoviesCard
                    onPress={() =>
                      navigation.navigate("MovieDetails", { id:movie.tmdb_id })
                    }
                    cardWidth={width * 0.7}
                    title={movie.title}
                    imagePath={baseImagePath("w780", movie.poster_path)}
                    shouldMarginateAtEnd={false}
                    genre={movie.genre_ids ? movie.genre_ids.slice(1, 4) : []}
                    vote_average={movie.vote_average}
                    vote_count={movie.vote_count}
                    onAddPress={() =>
                      navigation.navigate("MovieScheduleScreen_AD", {
                      
                      })
                    }
                  />
                ) : (
                  <SubMoviesCard
                    onPress={() =>
                      navigation.navigate("MovieDetails", { id: movie.id })
                    }
                    cardWidth={width / 2 - SPACING.space_24}
                    title={movie.original_title}
                    imagePath={baseImagePath("w342", movie.poster_path)}
                    shouldMarginateAtEnd={false}
                    shouldMarginateAround={true}
                    onAddPress={() =>
                      navigation.navigate("MovieScheduleScreen_AD", {
                        id: movie.id,
                      })
                    }
                  />
                )
              }
            />
          ) : (
            // Thêm View trống hoặc thông báo nếu không có dữ liệu
            <View style={{ padding: SPACING.space_15 }}>
              <CategogyHeader title={"Không có dữ liệu phim."} />
            </View>
          )}
        </View>
      )}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: COLORS.Black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputHeaderContainer: {
    marginHorizontal: SPACING.space_28,
    marginTop: SPACING.space_24,
    marginBottom: SPACING.space_10,
  },
  containerGap36: {
    gap: SPACING.space_24,
  },
});