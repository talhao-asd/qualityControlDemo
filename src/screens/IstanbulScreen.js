import {View, Text} from 'react-native';
import React, {useState} from 'react';
import Header from '../components/Remote/Header';
import ProductList from '../components/Remote/ProductList';
import BarcodeModal from '../components/Remote/BarcodeModal';

const IstanbulScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState([]);
  const [productData, setProductData] = useState(null);

  const handleProductSelect = (details) => {
    setSelectedProductDetails(details);
    setModalVisible(true);
  };

  const handlePlakaSelect = (productDetails) => {
    setProductData(productDetails);
    setDetailsVisible(true);
    setModalVisible(false); // Close the barcode modal when showing details
  };

  const handleKararUpdate = () => {
    // Implement your karar update logic here
    console.log('Karar updated');
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ProductList onProductSelect={handleProductSelect} />
      
      <BarcodeModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        detailData={selectedProductDetails}
        onPlakaSelect={handlePlakaSelect}
      />

    </View>
  );
};

export default IstanbulScreen;
