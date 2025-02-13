import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import ProductItem from './ProductItem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BarcodeGroup = ({ group, onProductPress }) => {
  const [expanded, setExpanded] = useState(true);
  const [plakaAdedi, setPlakaAdedi] = useState(null); // State for plaka adedi fetched separately
  const toggleExpand = () => setExpanded(!expanded);

  // Get the first product in this group if available
  const firstProduct = group.products[0] || {};
  const headerSiparisKodu = firstProduct.sipariskodu || '';
  const headerMiktar = firstProduct.miktar || '';

  // Attempt to fetch plakaAdedi from a separate API endpoint using the group barcode.
  // Replace the URL below with your actual endpoint.
  useEffect(() => {
    async function fetchPlakaAdedi() {
      try {
        const response = await fetch(`http://192.168.0.88:90/api/Product/GetPlakaAdedi?barkod=${group.barkod}`, {
          headers: {
            accept: '*/*',
          },
        });
        const json = await response.json();
        // Assuming your API returns { data: plakaAdedi }
        if (json && json.data) {
          setPlakaAdedi(json.data);
        }
      } catch (error) {
        console.error("Error fetching plaka adedi for barkod", group.barkod, error);
      }
    }
    fetchPlakaAdedi();
  }, [group.barkod]);

  // Use firstProduct.plakaAdedi if exists; otherwise, use the fetched value.
  // If neither is available, display a fallback (in this case, '...')
  const headerPlakaAdedi = firstProduct.plakaAdedi || (plakaAdedi !== null ? plakaAdedi : '...');

  return (
    <View style={styles.barcodeGroup}>
      <TouchableOpacity
        onPress={toggleExpand}
        style={[
          styles.barcodeHeader,
          { borderBottomWidth: expanded ? 1 : 0, borderBottomColor: '#eee' },
        ]}
      >
        <Text style={styles.barcodeText}>{headerSiparisKodu}</Text>
        <Text style={styles.barcodeText}>
          Miktar: {headerMiktar}/{headerPlakaAdedi}
        </Text>
        <Text style={styles.stockName}>{group.stokTanimi}</Text>
        <Text style={styles.customerName}>{group.musteriAd}</Text>
        <Text style={styles.expandIndicator}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {expanded && (
        <FlatList
          data={group.products}
          renderItem={({ item }) => <ProductItem item={item} onPress={onProductPress} />}
          keyExtractor={(product) => `${product.id}-${product.sipariskodu}`}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

BarcodeGroup.propTypes = {
  group: PropTypes.shape({
    barkod: PropTypes.string.isRequired,
    stokTanimi: PropTypes.string,
    musteriAd: PropTypes.string,
    products: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  onProductPress: PropTypes.func.isRequired,
};

// Inline styles declared under the component code
const styles = StyleSheet.create({
  barcodeGroup: {
    backgroundColor: '#fff',
    marginVertical: SCREEN_HEIGHT * 0.01,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: SCREEN_WIDTH * 0.02,
    overflow: 'hidden',
    shadowColor: '#1981ef',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  barcodeHeader: {
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: '#1981ef15',
    flexDirection: 'column',
  },
  barcodeText: {
    fontSize: Math.min(SCREEN_WIDTH * 0.045, 18),
    fontWeight: 'bold',
    color: '#1981ef',
    marginBottom: SCREEN_HEIGHT * 0.004,
  },
  stockName: {
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    color: '#333',
    marginTop: 4,
  },
  customerName: {
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    color: '#666',
    marginTop: 2,
  },
  expandIndicator: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    top: SCREEN_WIDTH * 0.04,
    color: '#1981ef',
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
  },
});

export default BarcodeGroup;