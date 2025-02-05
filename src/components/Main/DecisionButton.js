// DecisionButton.js
import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const DecisionButton = ({label, isActive, colors, onPress}) => (
  <TouchableOpacity
    style={[
      styles.decisionButton,
      isActive ? styles.activeButton : styles.inactiveButton,
    ]}
    onPress={onPress}>
    <LinearGradient
      colors={isActive ? colors : ['#e0e0e0', '#bdbdbd']}
      style={styles.gradient}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}>
      <Text style={[styles.buttonText, {color: isActive ? '#fff' : '#666'}]}>
        {label}
      </Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  decisionButton: {
    width: '24%',
    borderRadius: SCREEN_WIDTH * 0.02,
    overflow: 'hidden',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  gradient: {
    paddingVertical: SCREEN_HEIGHT * 0.015,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inactiveButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DecisionButton;