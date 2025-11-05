import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { BORDER_RADIUS, COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from "../theme/theme";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
interface MovieDetailsHeaderProps {
  nameIcon: any;
  header: string;
  action : () => void;
}


const MovieDetailsHeader = ({ nameIcon, header, action }: MovieDetailsHeaderProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconBG} onPress={action}>
        <MaterialCommunityIcons name={nameIcon}  style={styles.iconStyle}/>
      </TouchableOpacity>
      <Text style={styles.headerText}>{header}</Text>
      <View style={styles.emptyContainer}></View>
    </View>
  );
};

export default MovieDetailsHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    color: COLORS.White,
    fontSize: 24,
  },
  headerText: {
    flex: 1,
    fontFamily: FONT_FAMILY.poppins_medium,
    fontSize: 25,
    textAlign: 'center',
    color: COLORS.Yellow,
  },
  emptyContainer: {
    height: 40,
    width: 40,
  },
  iconBG: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: COLORS.Orange,
  },
});
