import React, { useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import BarcodeModal from '../components/Remote/BarcodeModal';
import BarcodeDetails from '../components/Remote/BarcodeDetails';
import ProductDetails from '../components/Remote/ProductDetails';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


const BarcodeScreen = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailsVisible, setIsProductDetailsVisible] = useState(false);
  const [isBarcodeModalVisible, setIsBarcodeModalVisible] = useState(true);
  const [barcodeData, setBarcodeData] = useState([]); // Add your barcode data here
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const handlePlakaSelect = (productDetails) => {
    setSelectedProduct(productDetails);
    setIsProductDetailsVisible(true);
    setDetailsModalVisible(true);
  };

  const handleKararUpdate = () => {
    // Implement your karar update logic here
    console.log('Karar updated');
  };

  return (
    <View style={styles.container}>
      <BarcodeModal
        visible={isBarcodeModalVisible}
        onClose={() => setIsBarcodeModalVisible(false)}
        detailData={barcodeData}
        onPlakaSelect={handlePlakaSelect}
      />

      <ProductDetails
        visible={isProductDetailsVisible}
        onClose={() => setIsProductDetailsVisible(false)}
        item={selectedProduct}
        onKararUpdate={handleKararUpdate}
        loading={false}
      />

      <BarcodeDetails
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        details={selectedProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BarcodeScreen;
