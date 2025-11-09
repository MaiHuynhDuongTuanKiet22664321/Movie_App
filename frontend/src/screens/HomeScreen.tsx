import { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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
const getMoviesShechedule = async () => {
  try {
    let res = await fetchAllMovies();
    if (Array.isArray(res.data)) {
      return res.data;
    }
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
        const schedule = await getMoviesShechedule();
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
      renderItem={({ item }) => (
        <View>
          <CategogyHeader title={item.title} />
          {item.data && item.data.length > 0 ? (
            <FlatList
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
              ListHeaderComponent={<View style={{ width: SPACING.space_28 }} />}
              ListFooterComponent={<View style={{ width: SPACING.space_28 }} />}
              renderItem={({ item: movie }) =>
                item.title === "Movies Schedule" ? (
                  <MoviesCard
                    onPress={() =>
                      navigation.navigate("MovieDetails", { id: movie.tmdb_id })
                    }
                    cardWidth={width * 0.7}
                    title={movie.title}
                    imagePath={baseImagePath("w780", movie.poster_path)}
                    shouldMarginateAtEnd={false}
                    genre={movie.genre_ids ? movie.genre_ids.slice(1, 4) : []}
                    vote_average={movie.vote_average}
                    vote_count={movie.vote_count}
                    onAddPress={() =>
                      navigation.navigate("MovieScheduleScreen_AD", {})
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
