import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import ImageList from '../Main/ImageList'; // Import the ImageList component
import HataKararInfo from './HataKararInfo'; // Import the HataKararInfo component
import ImageViewer from '../Main/ImageViewer'; // Import the ImageViewer component

const BASE_URL = 'http://192.168.0.88:90'; // Update if needed

/**
 * BarcodeDetails Modal Component
 *
 * This component adapts its layout based on the current device width and height.
 * It uses the Dimensions API to retrieve the screen size and listens for any changes.
 */
const BarcodeDetails = ({visible, onClose, details}) => {
  // Use the Dimensions API to get initial screen dimensions.
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  // Listen for dimension changes (e.g., orientation changes) to update the dimensions.
  useEffect(() => {
    const handler = ({window}) => {
      setDimensions(window);
    };
    const subscription = Dimensions.addEventListener('change', handler);
    return () => {
      subscription?.remove();
    };
  }, []);

  // Destructure the current width and height from dimensions.
  const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = dimensions;
  const styles = getStyles(SCREEN_WIDTH, SCREEN_HEIGHT);

  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  // Local state to maintain the current decision value.
  const [currentKarar, setCurrentKarar] = useState(
    details ? details.karar : null,
  );

  // Update local decision state if new details are provided.
  useEffect(() => {
    if (details) {
      setCurrentKarar(details.karar);
    }
  }, [details]);

  // Called when the user taps an image in the list.
  const handleImagePress = imageUrl => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  // Updated renderDetailItem function.
  // When called with only one parameter (i.e. value is undefined),
  // the text is rendered using a black color.
  const renderDetailItem = (label, value) => {
    if (typeof value === 'undefined') {
      return (
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, {color: '#000'}]}>{label}</Text>
        </View>
      );
    }
    return (
      <View style={styles.detailItem}>
        {label ? <Text style={styles.detailLabel}>{label}</Text> : null}
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  // Function to update the decision via the API.
  const handleDecision = async karar => {
    if (!details?.id) return;
    setIsUpdating(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/Product/UpdateKarar/${details.id}?karar=${karar}`,
        {
          method: 'PUT',
          headers: {
            accept: '*/*',
          },
        },
      );
      if (response.ok) {
        alert('Decision updated successfully!');
        // Update the local decision state to refresh the UI.
        setCurrentKarar(karar);
        // Optionally, you can update or refresh the parent state here.
      } else {
        alert('Failed to update decision.');
      }
    } catch (error) {
      console.error('Error updating decision:', error);
      alert('Error updating decision.');
    }
    setIsUpdating(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Barcode Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            {details ? (
              <>
                {renderDetailItem(details.stokTanimi)}

                {/* Display an extra value without a dedicated label */}
                {renderDetailItem(details.musteriAd)}

                {renderDetailItem('Plaka:', details.plaka)}
                {renderDetailItem(
                  'Tarih:',
                  new Date(details.tarih).toLocaleDateString(),
                )}
                {renderDetailItem('Miktar:', details.miktar)}
                {renderDetailItem('Sipariş Kodu:', details.sipariskodu)}
                {renderDetailItem('Açıklama:', details.aciklama)}

                {renderDetailItem(
                  'Kayıt Tarihi:',
                  new Date(details.kayitTarihi).toLocaleString(),
                )}

                <HataKararInfo
                  hata={details.hata}
                  hataYeri={details.hataYeri}
                  karar={currentKarar}
                />

                {details.abFotolars && details.abFotolars.length > 0 && (
                  <View style={styles.photoSection}>
                    <ImageList
                      photos={details.abFotolars}
                      onImagePress={handleImagePress}
                      BASE_URL={BASE_URL}
                    />
                  </View>
                )}

                {/* Decision Update Section */}
                <View style={styles.decisionContainer}>
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#1981ef" />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.decisionButton,
                          currentKarar === 1 ? styles.activeButton : styles.inactiveButton,
                        ]}
                        onPress={() => handleDecision(1)}>
                        <Text style={styles.decisionText}>Onay Bekliyor</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.decisionButton,
                          currentKarar === 2 ? styles.activeButton : styles.inactiveButton,
                        ]}
                        onPress={() => handleDecision(2)}>
                        <Text style={styles.decisionText}>A Sevk</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.decisionButton,
                          currentKarar === 3 ? styles.activeButton : styles.inactiveButton,
                        ]}
                        onPress={() => handleDecision(3)}>
                        <Text style={styles.decisionText}>B Sevk</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.decisionButton,
                          currentKarar === 4 ? styles.activeButton : styles.inactiveButton,
                        ]}
                        onPress={() => handleDecision(4)}>
                        <Text style={styles.decisionText}>B Kalsın</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            ) : (
              <Text style={styles.loadingText}>Loading details...</Text>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Full-Screen Image Viewer */}
      {selectedImage && (
        <ImageViewer
          visible={isImageViewerVisible}
          onClose={() => setImageViewerVisible(false)}
          imageUrl={selectedImage}
        />
      )}
    </Modal>
  );
};

/**
 * Create responsive styles based on the current device width and height.
 */
const getStyles = (width, height) =>
  StyleSheet.create({
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: width * 0.92,
      maxHeight: height * 0.85,
      backgroundColor: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      paddingBottom: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 5,
    },
    header: {
      backgroundColor: '#007BFF',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: width * 0.04,
      paddingVertical: 12,
    },
    headerText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    closeButton: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 6,
    },
    closeButtonText: {
      color: '#007BFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    contentContainer: {
      paddingHorizontal: width * 0.04,
      paddingVertical: 12,
    },
    detailItem: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detailLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#007BFF',
    },
    detailValue: {
      fontSize: 16,
      color: '#333',
      marginTop: 2,
      width: '50%',
      textAlign: 'right',
    },
    divider: {
      height: 1,
      backgroundColor: '#007BFF',
      opacity: 0.2,
      marginVertical: 10,
      marginHorizontal: -width * 0.04, // Extend the divider to the container edges
    },

    sectionHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#007BFF',
      marginBottom: 10,
      textAlign: 'center',
    },
    loadingText: {
      fontSize: 16,
      textAlign: 'center',
      paddingVertical: 20,
    },
    decisionContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    decisionButton: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 5,
      marginBottom: 10,
      width: '48%', // Ensures two buttons per row with space between
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e0e0e0',
    },
    activeButton: {
      backgroundColor: '#4facfe',
    },
    inactiveButton: {
      backgroundColor: '#e0e0e0',
    },
    decisionText: {
      fontSize: 14,
      color: '#fff',
      fontWeight: 'bold',
    },
    photoSection: {
      marginTop: 10,
    },
  });

export default BarcodeDetails;
