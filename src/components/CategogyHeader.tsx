import { Text, View, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '../theme/theme';

interface CategoryHeaderProps {
  title: string;
}

const CategoryHeader = ({ title }: CategoryHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

export default CategoryHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.space_24,
    paddingVertical: 20,
    backgroundColor: COLORS.Black, // tuỳ bạn muốn để màu gì
  },
  text: {
    fontSize: FONT_SIZE.size_20,
    fontFamily: FONT_FAMILY.poppins_semibold,
    color: COLORS.White,
  },
});
