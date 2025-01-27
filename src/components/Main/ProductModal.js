// src/components/ProductModal.js
import React, { useCallback, useMemo } from 'react';
import {Modal, View, Text, StyleSheet, Button, Image, FlatList} from 'react-native';

const ProductModal = ({visible, onClose, item}) => {
    const photoKeyExtractor = useCallback(photo => photo.id.toString(), []);
    const BASE_URL = useMemo(() => 'http://192.168.0.88:90', []);

    const renderImage = useCallback(
        
        ({item: photo}) => (
          <Image source={{uri: `${BASE_URL}${photo.yolu}`}} style={styles.image} />
        ),
        [BASE_URL],
      );

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {item ? (
              <>
                <Text style={styles.title}>{item.musteriAd}</Text>
                <Text style={styles.subtitle}>{item.stokTanimi}</Text>
                <Text style={styles.description}>{item.aciklama}</Text>
                <View style={styles.imageContainer}>
                  <FlatList
                    data={item.abFotolars}
                    horizontal
                    renderItem={renderImage}
                    keyExtractor={photoKeyExtractor}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContent}
                  />
                </View>
              </>
            ) : (
              <Text>No item data available</Text>
            )}
            <Button title="Close" onPress={onClose} />
          </View>
        </View>
      </Modal>
    );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  description: {
    fontSize: 12,
    color: '#777',
    marginVertical: 4,
  },
  imageContainer: {
    marginVertical: 10,
    width: '100%',
  },
  flatListContent: {
    paddingVertical: 10,
  },
  image: {
    width: 200,
    height: 300,
    marginRight: 8,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

export default ProductModal;
