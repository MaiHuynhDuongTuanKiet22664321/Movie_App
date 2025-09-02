
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '../theme/theme';



const CategogyHeader = (props : any) => {
  return (
    <Text style={styles.text}>{props.title}</Text>
  );
};

export default CategogyHeader;

const styles = StyleSheet.create({
  container: {},
  text: {
    fontSize: FONT_SIZE.size_20,
    fontFamily : FONT_FAMILY.poppins_semibold,
    color: COLORS.White,
    paddingHorizontal: SPACING.space_24,
    paddingVertical: 20,
  },
});
