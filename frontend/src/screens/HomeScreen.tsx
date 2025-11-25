import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SPACING, FONT_SIZE, FONT_FAMILY } from "../theme/theme";
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
import { Search } from "lucide-react-native";
import React from "react";

const { width } = Dimensions.get("window");

// Fetch TMDB
const getNowPlayingMoviesList = async () => {
  try {
    let res = await fetch(nowPlayingMovie);
    let json = await res.json();
    return json.results;
  } catch (error) {
    console.error("Error fetching Now Playing movies:", error);
    return [];
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

// Fetch từ backend
const getMoviesSchedule = async () => {
  try {
    console.log("Fetching movies from backend...");
    let res = await fetchAllMovies();
    console.log("Movies response:", res);
    if (res && res.success && Array.isArray(res.data)) {
      console.log("Movies data:", res.data);
      return res.data;
    }
    console.log("No movies data or invalid format");
    return [];
  } catch (error) {
    console.error("Error fetching Movie Schedule:", error);
    return [];
  }
};

const HomeScreen = ({ navigation }: any) => {
  const [nowPlayMoviesList, setNowPlayMoviesList] = useState<any>([]);
  const [popularMoviesList, setPopularMoviesList] = useState<any>([]);
  const [upComingMoviesList, setUpComingMoviesList] = useState<any>([]);
  const [moviesShechedule, setMoviesShechedule] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs for each FlatList
  const scheduleListRef = useRef<FlatList>(null);
  const nowPlayingListRef = useRef<FlatList>(null);
  const popularListRef = useRef<FlatList>(null);
  const upcomingListRef = useRef<FlatList>(null);

  // Track current scroll positions
  const [scrollPositions, setScrollPositions] = useState({
    schedule: 0,
    nowPlaying: 0,
    popular: 0,
    upcoming: 0,
  });

  // Track selected center item for each section
  const [centerItems, setCenterItems] = useState({
    schedule: 0,
    nowPlaying: 0,
    popular: 0,
    upcoming: 0,
  });

  // Debounce state to prevent quick clicks during scroll
  const [isScrolling, setIsScrolling] = useState({
    schedule: false,
    nowPlaying: false,
    popular: false,
    upcoming: false,
  });

  // ✅ Fetch TMDB dữ liệu chỉ 1 lần
  useEffect(() => {
    (async () => {
      const [nowPlaying, popular, upcoming] = await Promise.all([
        getNowPlayingMoviesList(),
        getPopularMoviesList(),
        getUpComingMoviesList(),
      ]);

      setNowPlayMoviesList(nowPlaying);
      setPopularMoviesList(popular);
      setUpComingMoviesList(upcoming);
      setIsLoading(false);
    })();
  }, []);

  // ✅ Fetch lại lịch chiếu mỗi khi quay lại Home
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchSchedule = async () => {
        const schedule = await getMoviesSchedule();
        if (isActive) setMoviesShechedule(schedule);
      };

      fetchSchedule();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const searchMoviesFuntion = (text: string) => {
    navigation.navigate("Search", { query: text });
  };

  const handleMoviePress = (index: number, movieId: number, sectionKey: string, itemWidth: number, listRef: any) => {
    // Ngăn chặn click khi đang scroll
    if (isScrolling[sectionKey as keyof typeof isScrolling]) {
      return;
    }

    const centerIndex = centerItems[sectionKey as keyof typeof centerItems];
    
    // Chỉ vào chi tiết nếu đang ở giữa VÀ đã click vào phim đó rồi
    if (index === centerIndex) {
      navigation.navigate("MovieDetails", { id: movieId });
    } else {
      // Bắt đầu scroll
      setIsScrolling({ ...isScrolling, [sectionKey]: true });
      setCenterItems({ ...centerItems, [sectionKey]: index });
      
      listRef.current?.scrollToIndex({
        index: index,
        animated: true,
        viewPosition: 0.5,
      });

      // Cho phép click lại sau 500ms
      setTimeout(() => {
        setIsScrolling({ ...isScrolling, [sectionKey]: false });
      }, 500);
    }
  };

  const getListRef = (sectionTitle: string) => {
    switch (sectionTitle) {
      case "Movies Schedule":
        return scheduleListRef;
      case "Now Playing":
        return nowPlayingListRef;
      case "Popular Movies":
        return popularListRef;
      case "Upcoming Movies":
        return upcomingListRef;
      default:
        return null;
    }
  };

  const getItemWidth = (sectionTitle: string) => {
    return sectionTitle === "Movies Schedule"
      ? width * 0.7 + SPACING.space_24
      : width / 2;
  };

  const getSectionKey = (sectionTitle: string) => {
    switch (sectionTitle) {
      case "Movies Schedule":
        return 'schedule';
      case "Now Playing":
        return 'nowPlaying';
      case "Popular Movies":
        return 'popular';
      case "Upcoming Movies":
        return 'upcoming';
      default:
        return 'schedule';
    }
  };

  const getInitialScrollIndex = (sectionTitle: string) => {
    // Chỉ Movies Schedule bắt đầu từ 0, các section khác không scroll ban đầu
    return sectionTitle === "Movies Schedule" ? 0 : undefined;
  };

  const getContentOffset = (sectionTitle: string) => {
    if (sectionTitle === "Movies Schedule") {
      return SPACING.space_28;
    }
    const cardWidth = width * 0.45;
    return (width - cardWidth) / 2 - 35;
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, styles.container]}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );
  }

  const sections = [
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
      renderItem={({ item }) => {
        const listRef = getListRef(item.title);
        const itemWidth = getItemWidth(item.title);
        const sectionKey = getSectionKey(item.title);
        const currentPos = scrollPositions[sectionKey as keyof typeof scrollPositions];
        const canGoPrev = currentPos > 0;
        const canGoNext = item.data && item.data.length > 1;
        
        return (
        <View>
          <CategogyHeader title={item.title} />
          {item.data && item.data.length > 0 ? (
            <FlatList
              ref={getListRef(item.title)}
              data={item.data}
              keyExtractor={(movie: any, index: number) =>
                `${movie?.id ?? movie?.tmdb_id ?? movie?.title ?? "movie"}-${index}`
              }
              horizontal
              bounces={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.containerGap36}
              {...(item.title === "Movies Schedule" && {
                snapToInterval: width * 0.7 + SPACING.space_36,
              })}
              ListHeaderComponent={<View style={{ width: getContentOffset(item.title) }} />}
              ListFooterComponent={<View style={{ width: getContentOffset(item.title) }} />}
              renderItem={({ item: movie, index }) =>
                item.title === "Movies Schedule" ? (
                  <MoviesCard
                    onPress={() => {
                      navigation.navigate("MovieScheduleScreen", {
                        id: movie.tmdbId,
                        movieData: movie
                      });
                    }}
                    cardWidth={width * 0.7}
                    title={movie.title}
                    imagePath={movie.posterUrl || baseImagePath("w780", movie.poster_path)}
                    shouldMarginateAtEnd={false}
                    genre={movie.genres ? movie.genres.map((g: any) => g.id) : movie.genre_ids ? movie.genre_ids.slice(1, 4) : []}
                    vote_average={movie.voteAverage || movie.vote_average}
                    vote_count={movie.voteCount || movie.vote_count}
                    onAddPress={() =>
                      navigation.navigate("MovieScheduleScreen", {
                        id: movie.tmdbId,
                        movieData: movie
                      })
                    }
                  />
                ) : (
                  <SubMoviesCard
                    onPress={() => handleMoviePress(index, movie.id, sectionKey, itemWidth, listRef)}
                    cardWidth={width * 0.45}
                    title={movie.original_title}
                    imagePath={baseImagePath("w342", movie.poster_path)}
                    shouldMarginateAtEnd={false}
                    shouldMarginateAround={true}
                    onAddPress={() =>
                      navigation.navigate("MovieScheduleScreen", {
                        id: movie.id,
                      })
                    }
                  />
                )
              }
            />
          ) : (
            <View style={{ padding: SPACING.space_15 }}>
              <CategogyHeader title={"Không có dữ liệu phim."} />
            </View>
          )}  
        </View>
      );
      }}
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
  categoryTitle: {
    fontSize: FONT_SIZE.size_20,
    fontFamily: FONT_FAMILY.poppins_semibold,
    color: COLORS.White,
  },
});
