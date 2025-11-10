import { Text, View, StyleSheet } from 'react-native';
import { COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '../theme/theme';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface CategoryHeaderProps {
  title: string;
}

const getIconForCategory = (title: string) => {
  switch (title) {
    case 'Movies Schedule':
      return <MaterialIcons name="schedule" size={24} color={COLORS.Orange} />;
    case 'Now Playing':
      return <Ionicons name="play-circle" size={24} color={COLORS.Orange} />;
    case 'Popular Movies':
      return <FontAwesome5 name="fire" size={22} color={COLORS.Orange} />;
    case 'Upcoming Movies':
      return <MaterialIcons name="upcoming" size={24} color={COLORS.Orange} />;
    default:
      return null;
  }
};

const CategoryHeader = ({ title }: CategoryHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {getIconForCategory(title)}
        <Text style={styles.text}>{title}</Text>
      </View>
    </View>
  );
};

export default CategoryHeader;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.space_24,
    paddingTop: SPACING.space_20,
    paddingBottom: SPACING.space_12,
    backgroundColor: COLORS.Black, 
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.space_10,
  },
  text: {
    fontSize: FONT_SIZE.size_20,
    fontFamily: FONT_FAMILY.poppins_bold,
    color: COLORS.White,
    letterSpacing: 0.5,
  },
  underline: {
    height: 3,
    width: 50,
    backgroundColor: COLORS.Orange,
    marginTop: SPACING.space_8,
    borderRadius: 2,
  },
});
