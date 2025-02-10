import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import SkeletonLoader from '../components/Main/SkeletonLoader';
import NoDataView from '../components/Main/NoDataView';
import AnimatedTabs from '../components';
import ProductModal from '../components/Main/ProductModal';
import HeaderSecondBar from '../components/Main/HeaderSecondBar';
import { useSelector } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const { searchText, sonuc } = useSelector(state => state.search);
  const [modalLoading, setModalLoading] = useState(false);

  // Add new state for grouped data
  const [groupedData, setGroupedData] = useState([]);

  // Add new state for original data
  const [originalGroupedData, setOriginalGroupedData] = useState([]);

  // Simplify tabsData to a static array
  const tabsData = useMemo(() => [
    { icon: 'Loader', label: 'Bekliyor' },
    { icon: 'AArrowUp', label: 'A Sevk' },
    { icon: 'Bold', label: 'B Sevk' },
    { icon: 'ShieldMinus', label: 'B Kalsın' },
  ], []); // Empty dependency array since it's now static

  // Memoize the fetch URL with base URL constant
  const BASE_URL = useMemo(() => 'http://192.168.0.88:90', []);
  const fetchUrl = useMemo(() => {
    const endpoint = '/api/Product/Listele';
    let url = `${BASE_URL}${endpoint}?karar=${selectedIndex + 1}&sonuc=0`;
    return url;
  }, [selectedIndex, BASE_URL]);

  // Memoize the fetch options
  const fetchOptions = useMemo(
    () => ({
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    }),
    [],
  );

  // Memoize the image renderer for nested FlatList
  const renderImage = useCallback(
    ({item: photo}) => (
      <Image source={{uri: `${BASE_URL}${photo.yolu}`}} style={styles.image} />
    ),
    [BASE_URL],
  );

  // Update the keyExtractor to include more unique identifiers
  const keyExtractor = useCallback((item, index) => 
    `${item.id}-${item.sipariskodu}-${item.tarih}-${index}`,
  []);

  // Update the photo keyExtractor if you re-enable the photo FlatList
  const photoKeyExtractor = useCallback((photo, index) => 
    `photo-${photo.id}-${index}`,
  []);

  // Add fetchProductPhotos function
  const fetchProductPhotos = useCallback(async (productId) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/Product/GetPhotosByProductId?productId=${productId}`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        }
      );
      const result = await response.json();
      if (result.statusCode === 200 && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching photos:', error);
      return [];
    }
  }, [BASE_URL]);

  // Update handlePressItem to use fetchProductPhotos
  const handlePressItem = useCallback(async (item) => {
    setModalLoading(true);
    try {
      const photos = await fetchProductPhotos(item.id);
      console.log('Fetched photos:', photos);
      setSelectedItem({ 
        ...item, 
        photos: photos
      });
      setModalVisible(true);
    } catch (error) {
      console.error('Error in handlePressItem:', error);
      setSelectedItem(item);
      setModalVisible(true);
    } finally {
      setModalLoading(false);
    }
  }, [fetchProductPhotos]);

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  const getHataYeriDisplay = hataYeri => {
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
  // Memoize the renderItem function with its dependencies
  const renderItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        onPress={() => handlePressItem(item)}
        style={styles.card}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.title}>{item.musteriAd?.slice(0, 15)}...</Text>
          <Text style={styles.description}>
            {new Date(item.tarih).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <Text style={styles.siparisKodu}>{item.sipariskodu}</Text>
        <Text style={styles.subtitle}>{item.stokTanimi}</Text>
        <Text style={styles.description}>
          {item.hata} / {getHataYeriDisplay(item.hataYeri)}
        </Text>

        {/* <FlatList
          data={item.abFotolars}
          horizontal
          renderItem={renderImage}
          keyExtractor={photoKeyExtractor}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
        /> */}
      </TouchableOpacity>
    ),
    [handlePressItem, renderImage, photoKeyExtractor],
  );

  const handleTabChange = useCallback(
    index => {
      // Reduce delay or optimize here
      setIsLoading(true);
      setShowNoData(false);
      setData([]);
      setFilteredData([]);

      if (index === selectedIndex) {
        // Immediate fetch without waiting for useEffect
        fetch(fetchUrl, fetchOptions)
          .then(response => response.json())
          .then(data => {
            if (data) {
              parseAndSetData(data);
            }
          })
          .catch(error => {
            console.error('Fetch error:', error);
            setShowNoData(true);
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setSelectedIndex(index);
      }
    },
    [selectedIndex, fetchUrl, fetchOptions, parseAndSetData],
  );

  // Memoize the error handler
  const handleError = useCallback(error => {
    console.error('Error details:', error.message);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowNoData(true);
    }, 500);
    setData([]);
    setFilteredData([]);
  }, []);

  // Update parseAndSetData to store both original and filtered data
  const parseAndSetData = useCallback(responseData => {
    if (responseData.data && Array.isArray(responseData.data)) {
      if (responseData.data.length === 0) {
        setShowNoData(true);
        return;
      }
      
      setShowNoData(false);
      
      // Group by barcode
      const groupedByBarcode = responseData.data.reduce((acc, current) => {
        if (!acc[current.barkod]) {
          acc[current.barkod] = {
            barkod: current.barkod,
            stokTanimi: current.stokTanimi,
            musteriAd: current.musteriAd,
            products: []
          };
        }
        
        const existingProduct = acc[current.barkod].products.find(
          item => item.id === current.id && item.sipariskodu === current.sipariskodu
        );
        
        if (!existingProduct) {
          acc[current.barkod].products.push(current);
        }
        
        return acc;
      }, {});

      // Convert to array and sort
      const groupedArray = Object.values(groupedByBarcode).map(group => ({
        ...group,
        products: group.products.sort((a, b) => new Date(b.tarih) - new Date(a.tarih))
      }));

      setOriginalGroupedData(groupedArray); // Store original data
      setGroupedData(groupedArray); // Set current filtered data
    } else {
      console.error('Expected an array but received:', responseData);
      setShowNoData(true);
    }
  }, []);

  const handleSort = useCallback((sortOrder) => {
    setFilteredData(prevData => {
      const newData = [...prevData];
      return newData.sort((a, b) => {
        const dateA = new Date(a.tarih);
        const dateB = new Date(b.tarih);
        return sortOrder === 'desc' 
          ? dateB - dateA  // Newer to older
          : dateA - dateB; // Older to newer
      });
    });
  }, []);

  // Update handleSearch to safely check properties
  const handleSearch = useCallback((searchText) => {
    if (!searchText) {
      setGroupedData(originalGroupedData);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = originalGroupedData.filter(group => {
      return group.products.some(product => 
        (product.sipariskodu?.toLowerCase()?.includes(searchLower)) 
      );
    });
    
    setGroupedData(filtered);
  }, [originalGroupedData]);

  // Update the search effect
  useEffect(() => {
    if (searchText) {
      handleSearch(searchText);
    } else {
      setGroupedData(originalGroupedData);
    }
  }, [searchText, handleSearch, originalGroupedData]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    // Delay the API call slightly to ensure animation completes
    timeoutId = setTimeout(() => {
      if (!isMounted) return;

      fetch(fetchUrl, fetchOptions)
        .then(response => {
          console.log('Response received:', response);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Data parsed:', data);
          if (isMounted) {
            parseAndSetData(data);
          }
        })
        .catch(error => {
          console.error('Fetch error:', error);
          if (isMounted) {
            setShowNoData(true);
            setData([]);
            setFilteredData([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }, 300); // 300ms delay to match the handleTabChange delay

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchUrl, fetchOptions, parseAndSetData]);

  // Memoize the FlatList component
  const ProductList = useMemo(
    () => (
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
    ),
    [filteredData, renderItem, keyExtractor],
  );

  // Add this memoized skeleton list
  const SkeletonList = useMemo(
    () => (
      <FlatList
        data={[1, 2, 3, 4]} // Show 4 skeleton items
        renderItem={() => <SkeletonLoader />}
        keyExtractor={item => item.toString()}
      />
    ),
    [],
  );

  const handleKararUpdate = useCallback(() => {
    // Trigger a refresh by simulating a tab change to the current tab
    handleTabChange(selectedIndex);
  }, [selectedIndex, handleTabChange]);

  // Render a single product item
  const [expandedGroups, setExpandedGroups] = useState({});

  // Update renderBarcodeGroup to show sipariskodu in header
  const renderBarcodeGroup = useCallback(({item}) => {
    const isExpanded = expandedGroups[item.barkod] !== false;

    const toggleExpand = () => {
      setExpandedGroups(prev => ({
        ...prev,
        [item.barkod]: !isExpanded
      }));
    };

    // Get the first product's sipariskodu to display in header
    const headerSiparisKodu = item.products[0]?.sipariskodu || '';

    return (
      <View style={styles.barcodeGroup}>
        <TouchableOpacity 
          onPress={toggleExpand}
          style={[
            styles.barcodeHeader,
            { borderBottomWidth: isExpanded ? 1 : 0, borderBottomColor: '#eee' }
          ]}>
          <Text style={styles.barcodeText}>{headerSiparisKodu}</Text>
          <Text style={styles.stockName}>{item.stokTanimi}</Text>
          <Text style={styles.customerName}>{item.musteriAd}</Text>
          <Text style={styles.expandIndicator}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        {isExpanded && (
          <FlatList
            data={item.products}
            renderItem={renderProductItem}
            keyExtractor={(product) => `${product.id}-${product.sipariskodu}`}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  }, [expandedGroups, renderProductItem]);

  // Update renderProductItem to show plaka in main content
  const renderProductItem = useCallback(({item}) => (
    <TouchableOpacity
      onPress={() => handlePressItem(item)}
      style={styles.productCard}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={styles.productInfo}>
          <Text style={styles.plakaText}>Plaka No: {item.plaka}</Text>
        </View>
        <Text style={styles.description}>
          {new Date(item.tarih).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      <Text style={styles.subtitle}>{item.hata} / {getHataYeriDisplay(item.hataYeri)}</Text>
    </TouchableOpacity>
  ), [handlePressItem]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AnimatedTabs
          data={tabsData}
          onChange={handleTabChange}
          selectedIndex={selectedIndex}
          activeColor="#fff"
          inactiveColor="#999"
          activeBackgroundColor="#1981ef"
          inactiveBackgroundColor="#ddd"
        />
        <TouchableOpacity
          onPress={() => setHeaderVisible(prevState => !prevState)}
          style={styles.headerLogo}>
          <Image
            source={require('../assets/images/new.png')}
            style={styles.headerImage}
          />
        </TouchableOpacity>
      </View>
      
      {headerVisible && (
        <HeaderSecondBar 
          onSort={handleSort} 
          onSearch={handleSearch} 
          setIsLoading={setIsLoading}
        />
      )}

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonLoader />
        </View>
      ) : showNoData ? (
        <NoDataView />
      ) : (
        <FlatList
          data={groupedData}
          renderItem={renderBarcodeGroup}
          keyExtractor={(item) => item.barkod}
          contentContainerStyle={styles.listContainer}
        />
      )}
      <ProductModal
        visible={modalVisible}
        onClose={handleCloseModal}
        item={selectedItem}
        onKararUpdate={handleKararUpdate}
        loading={modalLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    height: SCREEN_HEIGHT * 0.08,
    maxHeight: 80,
  },
  headerLogo: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    height: '100%',
    justifyContent: 'center',
  },
  headerImage: {
    resizeMode: 'contain',
    width: Math.min(SCREEN_WIDTH * 0.25, 100),
    height: '80%',
  },
  card: {
    backgroundColor: '#fff',
    padding: Math.min(SCREEN_WIDTH * 0.04, 12),
    marginVertical: SCREEN_HEIGHT * 0.01,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: Math.min(SCREEN_WIDTH * 0.02, 8),
    shadowColor: '#1981ef',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: Math.min(SCREEN_WIDTH * 0.045, 18),
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    color: '#555',
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  siparisKodu: {
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
    color: '#1981ef',
    marginVertical: SCREEN_HEIGHT * 0.003,
  },
  description: {
    fontSize: Math.min(SCREEN_WIDTH * 0.03, 12),
    color: '#777',
  },
  image: {
    width: Math.min(SCREEN_WIDTH * 0.25, 100),
    height: Math.min(SCREEN_WIDTH * 0.25, 100),
    marginRight: SCREEN_WIDTH * 0.02,
    borderRadius: Math.min(SCREEN_WIDTH * 0.02, 8),
  },
  logo: {},
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSecondBar: {
    backgroundColor: '#f5f5f5',
    padding: SCREEN_WIDTH * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerSecondBarText: {
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
    color: '#333',
  },
  barcodeGroup: {
    backgroundColor: '#fff',
    marginVertical: SCREEN_HEIGHT * 0.01,
    marginHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: SCREEN_WIDTH * 0.02,
    overflow: 'hidden',
    shadowColor: '#1981ef',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  productCard: {
    padding: SCREEN_WIDTH * 0.04,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  listContainer: {
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  expandIndicator: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.04,
    top: SCREEN_WIDTH * 0.04,
    color: '#1981ef',
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plakaContainer: {
    backgroundColor: '#1981ef15',
    borderRadius: SCREEN_WIDTH * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingVertical: SCREEN_HEIGHT * 0.004,
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  plakaText: {
    color: '#1981ef',
    fontSize: Math.min(SCREEN_WIDTH * 0.05, 16),
    fontWeight: '600',
  },
});

export default HomeScreen;
