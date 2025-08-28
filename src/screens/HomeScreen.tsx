import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/theme';


const HomeScreen = ({navigation} : any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => {
        navigation.navigate('MovieDetail')
      }}>
        <Text>Home</Text>
      </TouchableOpacity>
      
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
  }
});

