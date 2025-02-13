import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getHataYeriDisplay = (hataYeri) => {
  const location = Number(hataYeri);
  switch (location) {
    case 1:
    case 4:
    case 9:
    case 12:
      return 'Ön - Köşe';
    case 2:
    case 3:
    case 5:
    case 8:
    case 10:
    case 11:
      return 'Ön - Kenar';
    case 6:
    case 7:
      return 'Ön - Orta';
    case 13:
    case 16:
    case 21:
    case 24:
      return 'Arka - Köşe';
    case 14:
    case 15:
    case 17:
    case 20:
    case 22:
    case 23:
      return 'Arka - Kenar';
    case 18:
    case 19:
      return 'Arka - Orta';
    default:
      return 'Bilinmiyor';
  }
};

const ProductItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.productCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={styles.productInfo}>
          <Text style={styles.plakaText}>Plaka No: {item.plaka}</Text>
        </View>
        <Text style={styles.description}>
          {new Date(item.tarih).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        {item.hata} / {getHataYeriDisplay(item.hataYeri)}
      </Text>
    </TouchableOpacity>
  );
};

ProductItem.propTypes = {
  item: PropTypes.object.isRequired,
  onPress: PropTypes.func.isRequired,
};

// All styles are declared below the component
const styles = StyleSheet.create({
    productCard: {
        padding: SCREEN_WIDTH * 0.04,
        borderTopWidth: 1,
        borderTopColor: '#eee',
      },
      productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      plakaText: {
        color: '#1981ef',
        fontSize: Math.min(SCREEN_WIDTH * 0.05, 16),
        fontWeight: '600',
      },
      subtitle: {
        fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
        color: '#555',
        marginBottom: SCREEN_HEIGHT * 0.005,
      },
  description: {
    fontSize: Math.min(SCREEN_WIDTH * 0.03, 12),
    color: '#777',
  },
});

export default ProductItem;