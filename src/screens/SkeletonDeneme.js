import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonDeneme = () => {
  return (
    <View>


      <SkeletonPlaceholder>
        <View style={[styles.card, { shadowColor: 'transparent', elevation: 0 }]}>
          <View style={{width: '70%', height: 20, borderRadius: 4}} />
          <View
            style={{width: '50%', height: 15, borderRadius: 4, marginTop: 8}}
          />
          <View
            style={{width: '80%', height: 12, borderRadius: 4, marginTop: 8}}
          />
          <View style={{flexDirection: 'row', marginTop: 8}}>
            {[1, 2, 3].map((_, index) => (
              <View
                key={index}
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
      </SkeletonPlaceholder>

    </View>
  );
};


const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
      },
})


export default SkeletonDeneme;
