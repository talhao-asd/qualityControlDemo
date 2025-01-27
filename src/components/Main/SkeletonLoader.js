import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonLoader = () => (
  <ScrollView>
    <SkeletonPlaceholder>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={[styles.card, {shadowColor: 'transparent', elevation: 0}]}>
          <View style={{width: '70%', height: 20, borderRadius: 4}} />
          <View style={{width: '50%', height: 15, borderRadius: 4, marginTop: 8}} />
          <View style={{width: '80%', height: 12, borderRadius: 4, marginTop: 8}} />
          <View style={{flexDirection: 'row', marginTop: 8}}>
            {[1, 2, 3].map((_, subIndex) => (
              <View
                key={subIndex}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              />
            ))}
          </View>
        </View>
      ))}
    </SkeletonPlaceholder>
  </ScrollView>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
});

export default SkeletonLoader;
