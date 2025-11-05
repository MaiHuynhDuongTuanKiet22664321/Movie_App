import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  ImageBackground,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { baseImagePath, movieCastDetails, movieDetails } from "../api/apicall";
import {
  BORDER_RADIUS,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
  SPACING,
} from "../theme/theme";
import MovieDetailsHeader from "../components/MovieDetailsHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import CategoryHeader from "../components/CategogyHeader";
import CastCard from "../components/CastCard";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const getMovieDetails = async (id: number) => {
  try {
    let res = await fetch(movieDetails(id));
    let json = await res.json();
    return json;
  } catch (error) {
    console.error("Something went wrong in MovieDetails ", error);
  }
};
const getMovieCastDetails = async (id: number) => {
  try {
    let res = await fetch(movieCastDetails(id));
    let json = await res.json();
    return json.cast;
  } catch (error) {
    console.error("Something went wrong in MovieDetails ", error);
  }
};

const MovieDetailScreen = ({ navigation, route }: any) => {
  const [movieData, setMovieData] = useState<any>(undefined);
  const [movieCastData, setMovieCastData] = useState<any>(undefined);

  // Fetch data song song
  useEffect(() => {
    const fetchData = async () => {
      const moviePromise = getMovieDetails(route.params?.id);
      const castPromise = getMovieCastDetails(route.params?.id);

      const [movie, cast] = await Promise.all([moviePromise, castPromise]);
      setMovieData(movie);
      setMovieCastData(cast);
    };
    fetchData();
  }, [route.params?.id]);

  // Loading spinner
  if (!movieData || !movieCastData) {
    return (
      <SafeAreaView style={styles.container}>
        <MovieDetailsHeader
          nameIcon="close-circle-outline"
          header={"Movie Details"}
          action={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.Orange} />
        </View>
      </SafeAreaView>
    );
  }

  // Main content
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar hidden />

        <View>
          <ImageBackground
            source={{
              uri: baseImagePath("w780", movieData?.backdrop_path),
            }}
            style={styles.imageBG}
          >
            <LinearGradient
              colors={[COLORS.BlackRGB10, COLORS.Black]}
              style={styles.linearGradient}
            >
              <View style={styles.appHeaderContainer}>
                <MovieDetailsHeader
                  nameIcon="close-circle-outline"
                  header=""
                  action={() => navigation.goBack()}
                />
              </View>
            </LinearGradient>
          </ImageBackground>
          <View style={styles.imageBG}></View>
          <Image
            source={{ uri: baseImagePath("w342", movieData?.poster_path) }}
            style={styles.cardImage}
          />
        </View>
        <View style={styles.timeContainer}>
          <FontAwesome6
            name="clock"
            size={24}
            color="black"
            style={styles.clockIcon}
          />
          <Text style={styles.runtimeText}>
            {Math.floor(movieData?.runtime / 60)}h{" "}
            {Math.floor(movieData?.runtime % 60)}m
          </Text>
        </View>
        <View>
          <Text style={styles.title}>{movieData?.original_title}</Text>
          <View style={styles.genreContainer}>
            {movieData?.genres.map((item: any) => {
              return (
                <View style={styles.genreBox} key={item.id}>
                  <Text style={styles.genreText}>{item.name}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.tagline}>{movieData?.tagline}</Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={[styles.rateContainer, styles.containerGap24]}>
            <FontAwesome6 name="star" style={styles.starIcon} />
            <Text style={styles.runtimeText}>
              {movieData?.vote_average.toFixed(1)} ({movieData?.vote_count})
            </Text>
            <Text style={styles.runtimeText}>
              {movieData?.release_date.substring(8, 10)}{" "}
              {new Date(movieData?.release_date).toLocaleString("default", {
                month: "long",
              })}{" "}
              {movieData?.release_date.substring(0, 4)}
            </Text>
          </View>
          <Text style={styles.descriptionText}>{movieData?.overview}</Text>
        </View>

        <View style={styles.castContainer}>
          <CategoryHeader title="Top Cast" />
          <FlatList
            data={movieCastData}
            keyExtractor={(item: any) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.containerGap24}
            renderItem={({ item, index }) => (
              <CastCard
                shouldMarginatedAtEnd={true}
                cardWidth={80}
                isFirst={index === 0}
                isLast={index === movieCastData?.length - 1}
                imagePath={baseImagePath("w185", item.profile_path)}
                title={item.original_name}
                subtitle={item.character}
              />
            )}
          />
        </View>
      </ScrollView>
      <View>
            <TouchableOpacity
              style={styles.buttonBG}
              onPress={() => {
                navigation.push("MovieScheduleSetupScreen_AD", {
                  BgImage: baseImagePath("w780", movieData.backdrop_path),
                  PosterImage: baseImagePath("original", movieData.poster_path),
                  nameMovie: movieData.original_title,
                });
              }}
            >
              <MaterialCommunityIcons name="ticket" style={styles.ticketIcon}/>
              <Text style={styles.buttonText}>Schedule movie</Text>
            </TouchableOpacity>
          </View>
    </SafeAreaView>
  );
};

export default MovieDetailScreen;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  loadingContainer: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
  },
  scrollViewContainer: {
    flex: 1,
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_10 * 4,
  },
  imageBG: {
    width: "100%",
    aspectRatio: 3072 / 1727,
  },
  linearGradient: {
    height: "100%",
  },
  cardImage: {
    width: "60%",
    aspectRatio: 200 / 300,
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
  clockIcon: {
    fontSize: FONT_SIZE.size_20,
    color: COLORS.WhiteRGBA50,
    marginRight: SPACING.space_8,
  },
  timeContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SPACING.space_16,
  },
  runtimeText: {
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  title: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
    marginHorizontal: SPACING.space_36,
    marginVertical: SPACING.space_16,
    textAlign: "center",
  },
  genreContainer: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING.space_10 * 2,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  genreBox: {
    borderColor: COLORS.WhiteRGBA50,
    borderWidth: 1,
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDER_RADIUS.radius_24,
  },
  genreText: {
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_10,
    color: COLORS.WhiteRGBA75,
  },
  tagline: {
    fontFamily: FONT_FAMILY.poppins_thin,
    fontSize: FONT_SIZE.size_14,
    fontStyle: "italic",
    color: COLORS.White,
    marginHorizontal: SPACING.space_36,
    marginVertical: SPACING.space_16,
    textAlign: "center",
  },
  infoContainer: {
    marginHorizontal: SPACING.space_24,
  },
  rateContainer: {
    flexDirection: "row",
    gap: SPACING.space_10,
    alignItems: "center",
  },
  starIcon: {
    fontSize: FONT_SIZE.size_20,
    color: COLORS.Yellow,
  },
  descriptionText: {
    fontFamily: FONT_FAMILY.poppins_light,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
    textAlign: "justify",
    paddingTop: SPACING.space_10,
  },
  containerGap24: {
    gap: SPACING.space_24,
  },
  ticketIcon:{
    fontSize: FONT_SIZE.size_24,
    color: COLORS.White,
    paddingHorizontal: SPACING.space_4,
    paddingVertical: SPACING.space_4,
  },
  buttonBG: {
    position: "absolute",
    bottom: 20, // cách mép dưới 20px
    left: "50%",
    transform: [{ translateX: -75 }], // căn giữa (nếu width ~150)
    backgroundColor: COLORS.Orange,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    borderRadius: BORDER_RADIUS.radius_24 * 2,
    paddingHorizontal: SPACING.space_4,
    paddingVertical: SPACING.space_4,
    backgroundColor: COLORS.Orange,
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  castContainer:{
    marginBottom: SPACING.space_96
  }
});
