// ImageList.js
import React from 'react';
import {FlatList, Dimensions, Image, TouchableOpacity, StyleSheet} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const ImageList = ({photos, onImagePress, BASE_URL}) => {
  const renderImage = ({item}) => (
    <TouchableOpacity onPress={() => onImagePress(`${BASE_URL}${item.yolu}`)}>
      <Image
        source={{uri: `${BASE_URL}${item.yolu}`}}
        style={styles.image}
      />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={photos}
      horizontal
      renderItem={renderImage}
      keyExtractor={item => item.id.toString()}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={3}
      showsHorizontalScrollIndicator
      contentContainerStyle={styles.flatListContent}
      style={{flexGrow: 0, width: '100%'}}
      bounces={false}
      pagingEnabled
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_HEIGHT * 0.2,
    marginRight: SCREEN_WIDTH * 0.02,
    borderRadius: SCREEN_WIDTH * 0.03,
    resizeMode: 'cover',
  },
  flatListContent: {
    paddingVertical: SCREEN_HEIGHT * 0.012,
  },
});

export default ImageList;