import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import { COLORS, SPACING } from "../theme/theme";
import { baseImagePath, searchMovies } from "../api/apicall";
import { useState } from "react";
import SubMoviesCard from "../components/SubMoviesCard";
import InputHeader from "../components/InputHeader";

const { width } = Dimensions.get("screen");

const SearchScreen = ({ navigation }: any) => {
  const [searchList, setSearchList] = useState<any>([]);

  const searchMoviesFuntion = async (name: string) => {
    try {
      let res = await fetch(searchMovies(name));
      let json = await res.json();
      setSearchList(json.results);
    } catch (error) {
      console.error("Somthing went wrong in SearchMovies ", error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        data={searchList}
        keyExtractor={(movie: any) => movie.id.toString()}
        bounces={false}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-around" }}
        ListHeaderComponent={
          <View style={styles.inputHeaderContainer}>
            <InputHeader searchFunction={searchMoviesFuntion} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyText}>
            <Text style={styles.emptyText}>Nhập tên phim để tìm kiếm</Text>
          </View>
        }
        contentContainerStyle={styles.centerContainer}
        renderItem={({ item: movie, index }) => (
          <SubMoviesCard
            onPress={() =>
              navigation.navigate("MovieDetails", { id: movie.id })
            }
            shouldMarginateAround={true}
            cardWidth={width / 2 - SPACING.space_24}
            isFirst={index === 0}
            isLast={index === searchList.length - 1}
            title={movie.original_title}
            imagePath={baseImagePath("w342", movie.poster_path)}
            shouldMarginateAtEnd={false}
          />
        )}
      />
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
    width,
  },
  inputHeaderContainer: {
    display: "flex",
    marginHorizontal: SPACING.space_28,
    marginTop: SPACING.space_24,
    marginBottom: SPACING.space_16,
  },
  emptyText: {
    color: COLORS.White,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  centerContainer:{
    alignContent: 'center',
  }
});
