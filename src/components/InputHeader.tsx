import { useState } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_FAMILY, FONT_SIZE, SPACING } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface InputHeaderProps {
  searchFunction: (text: string) => void;
}

const InputHeader = ({ searchFunction }: InputHeaderProps) => {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.inputBox}>
      <TextInput
        style={styles.textInput}
        onChangeText={setSearchText}
        value={searchText}
        placeholder="Search your Movies..."
        placeholderTextColor={COLORS.Grey}
      />
      <TouchableOpacity onPress={() => searchFunction(searchText)}>
        <Ionicons
          name="search"
          color={COLORS.Orange}
          size={FONT_SIZE.size_20}
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default InputHeader;

const styles = StyleSheet.create({
  inputBox: {
    paddingVertical: SPACING.space_8,
    paddingHorizontal: SPACING.space_12,
    borderWidth: 2,
    borderColor: COLORS.WhiteRGBA10,
    borderRadius: BORDER_RADIUS.radius_15,
    flexDirection: 'row',
    alignItems: 'center', // thêm để icon canh giữa input
  },
  textInput: {
    flex: 1, // thay width 90% bằng flex
    fontFamily: FONT_FAMILY.poppins_regular,
    fontSize: FONT_SIZE.size_14,
    color: COLORS.White,
  },
  searchIcon: {
    padding: SPACING.space_8,
  },
});
