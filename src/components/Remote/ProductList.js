import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import {SafeAreaView} from 'moti';
import {fetchBarkodGruplari, fetchBarkodDetaylari} from './ApiRequest';
import SearchBar from './SearchBar';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const ProductList = ({onProductSelect}) => {
  const [products, setProducts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(
    text => {
      if (!text) {
        setFilteredData(products);
        return;
      }
      const filtered = products.filter(item =>
        item.sipariskodu.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered);
    },
    [products],
  );

  // Utility to add a timeout to a Promise:
  const fetchWithTimeout = (fetchPromise, timeout = 10000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('Timeout: Network request took too long')),
        timeout,
      );
    });
    return Promise.race([fetchPromise, timeoutPromise]).finally(() =>
      clearTimeout(timeoutId),
    );
  };

  // loadProducts accepts an optional flag that indicates if this call is from a pull-to-refresh.
  const loadProducts = async (isRefresh = false) => {
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchWithTimeout(fetchBarkodGruplari(), 10000);
      setProducts(data);
      setFilteredData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(true);
    setRefreshing(false);
  };

  const handleProductPress = async barkod => {
    try {
      const details = await fetchBarkodDetaylari(barkod);
      onProductSelect(details);
    } catch (err) {
      console.error('Error fetching details:', err);
      Alert.alert(
        'Network Error',
        'Could not load product details. Please check your network connection and try again.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  // While initially loading (and no data is available), show a full-screen ActivityIndicator.
  if (loading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.infoText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollView, {height: SCREEN_HEIGHT * 0.8}]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      {error && products.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={styles.infoText}>
            Lütfen ASD-PERSONEL WIFI ağına bağlanıp, uygulamayı yeniden başlatın.
          </Text>
        </View>
      ) : (
        <SafeAreaView>
          <SearchBar onSearch={handleSearch} />
          {filteredData.map(product => (
            <TouchableOpacity
              key={product.barkod}
              onPress={() => handleProductPress(product.barkod)}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.productTitle}>
                    {product.sipariskodu}
                  </Text>
                  <Text style={styles.productDate}>
                    {new Date(product.tarih).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.productDetail}>
                  {product.musteriAd}
                </Text>
                <Text style={styles.productDetail}>
                  {product.stokTanimi}
                </Text>
                <Text style={styles.plakaDetail}>
                  {product.plakaAdedi} / {product.miktar}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: SCREEN_HEIGHT * 0.8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: SCREEN_WIDTH * 0.05,
    marginVertical: SCREEN_HEIGHT * 0.01,
    padding: SCREEN_WIDTH * 0.05,
    borderWidth: 1,
    borderColor: '#007BFF', // Blue accent border
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productTitle: {
    fontWeight: 'bold',
    color: '#007BFF', // Blue accent color for headers
    fontSize: 16,
  },
  productDate: {
    fontSize: 14,
    color: '#555',
  },
  productDetail: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  plakaDetail: {
    fontSize: 14,
    color: 'red',
    marginVertical: 2,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});

export default ProductList;
