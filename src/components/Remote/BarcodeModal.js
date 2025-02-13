import React, { useState } from 'react';
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import BarcodeDetails from './BarcodeDetails';
import HataKararInfo from './HataKararInfo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');


/**
 * BarcodeModal Component
 *
 * Props:
 * - visible: Boolean to control modal visibility.
 * - onClose: Function to close the modal.
 * - detailData: Array of product items for the modal list.
 *
 * When a product is pressed, the component fetches product details from the API
 * and shows them in the BarcodeDetails modal.
 */
const BarcodeModal = ({ visible, onClose, detailData }) => {
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Called when a product item is pressed.
  const handleProductPress = async (product) => {
    if (!product?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.0.88:90/api/Product/${product.id}`);
      const data = await response.json();
      setProductDetails(data);
      setDetailsModalVisible(true);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleProductPress(item)}>
      {/* Display some summary information for your product */}
      <Text style={styles.itemText}>Plaka: {item.plaka}</Text>
      <Text style={styles.itemText}>Hata: {item.hata}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={detailData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Details Modal to show the fetched product details */}
      <BarcodeDetails
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        details={productDetails}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  itemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: "space-between",
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubText: {
    fontSize: 14,
    color: '#555',
  },
});

export default BarcodeModal;
