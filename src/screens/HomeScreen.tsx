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

const { width } = Dimensions.get("window");

const getNowPlayingMoviesList = async () => {
  let res = await fetch(nowPlayingMovie);
  let json = await res.json();
  return json.results;
};

const getPopularMoviesList = async () => {
  let res = await fetch(popularMovie);
  let json = await res.json();
  return json.results;
};

const getUpComingMoviesList = async () => {
  let res = await fetch(upComingMovie);
  let json = await res.json();
  return json.results;
};

const HomeScreen = ({ navigation }: any) => {
  const [nowPlayMoviesList, setNowPlayMoviesList] = useState<any>();
  const [popularMoviesList, setPopularMoviesList] = useState<any>();
  const [upComingMoviesList, setUpComingMoviesList] = useState<any>();

  useEffect(() => {
    (async () => {
      setNowPlayMoviesList(await getNowPlayingMoviesList());
      setPopularMoviesList(await getPopularMoviesList());
      setUpComingMoviesList(await getUpComingMoviesList());
    })();
  }, []);

  const searchMoviesFuntion = (text: string) => {
    navigation.navigate("Search", { query: text });
  };

  if (!nowPlayMoviesList || !popularMoviesList || !upComingMoviesList) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );
  }

  const sections = [
    { title: "Now Playing", data: nowPlayMoviesList },
    { title: "Popular Movies", data: popularMoviesList },
    { title: "Upcoming Movies", data: upComingMoviesList },
  ];

  return (
    <FlatList
      style={styles.container}
      data={sections}
      keyExtractor={(item) => item.title}
      ListHeaderComponent={
        <View style={styles.inputHeaderContainer}>
          <InputHeader searchFunction={searchMoviesFuntion} />
        </View>
      }
      renderItem={({ item }) => (
        <View>
          <CategogyHeader title={item.title} />
          {item.title === "Now Playing" ? (
            <FlatList
              data={item.data}
              keyExtractor={(movie: any) => movie.id.toString()}
              horizontal
              bounces={false}
              showsVerticalScrollIndicator={false}
              snapToInterval={width * 0.7 + SPACING.space_36}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.containerGap36}
              ListHeaderComponent={<View style={{ width: SPACING.space_28 }} />}
              ListFooterComponent={<View style={{ width: SPACING.space_28 }} />}
              renderItem={({ item: movie }) => (
                <MoviesCard
                  onPress={() =>
                    navigation.navigate("MovieDetails", { id: movie.id })
                  }
                  cardWidth={width * 0.7}
                  title={movie.title}
                  imagePath={baseImagePath("w780", movie.poster_path)}
                  shouldMarginateAtEnd={false}
                  genre={movie.genre_ids.slice(1, 4)}
                  vote_average={movie.vote_average}
                  vote_count={movie.vote_count}
                />
              )}
            />
          ) : (
            <FlatList
              data={item.data}
              keyExtractor={(movie: any) => movie.id.toString()}
              horizontal
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.containerGap36}
              renderItem={({ item: movie }) => (
                <SubMoviesCard
                  onPress={() =>
                    navigation.navigate("MovieDetails", { id: movie.id })
                  }
                  cardWidth={width / 2 - SPACING.space_24}
                  title={movie.original_title}
                  imagePath={baseImagePath("w342", movie.poster_path)}
                  shouldMarginateAtEnd={false}
                  shouldMarginateAround={true}
                />
              )}
            />
          )}
        </View>
      )}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
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
