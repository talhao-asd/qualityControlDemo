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
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const getIPAddress = async () => {
      try {
        const ip = await DeviceInfo.getIpAddress();
        if (ip) {
          setIpAddress(ip);
          console.log('Device Wi-Fi IP Address:', ip);
        } else {
          console.log('Device IP Address is unknown');
        }
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };

    getIPAddress();
  }, []);

  // Memoize the tabs data based on the IP address
  const tabsData = useMemo(() => {
    if (ipAddress.startsWith('10.0.0')) {
      return [
        { icon: 'Loader', label: 'Kayıt' }, // Extra tab for 10.0.0
        { icon: 'Loader', label: 'Bekliyor' },
        { icon: 'AArrowUp', label: 'A Sevk' },
        { icon: 'Bold', label: 'B Sevk' },
        { icon: 'ShieldMinus', label: 'B Kalsın' },
        { icon: 'Loader', label: 'Tümü' }, // Extra tab for 10.0.0
      ];
    } else if (ipAddress.startsWith('10.0.2')) {
      return [
        { icon: 'Loader', label: 'Bekliyor' },
        { icon: 'AArrowUp', label: 'A Sevk' },
        { icon: 'Bold', label: 'B Sevk' },
        { icon: 'ShieldMinus', label: 'B Kalsın' },
      ];
    }
    return []; // Return an empty array if the IP doesn't match
  }, [ipAddress]);

  // Memoize the fetch URL with base URL constant
  const BASE_URL = useMemo(() => 'http://192.168.0.88:90', []);
  const fetchUrl = useMemo(() => {
    const endpoint = '/api/Product/Listele';
    let url = selectedIndex === 3
      ? `${BASE_URL}${endpoint}`
      : `${BASE_URL}${endpoint}?karar=${selectedIndex + 1}`;
    
    // Add sonuc parameter only if it's not 'tumu'
    if (sonuc !== 'tumu') {
      url += `${url.includes('?') ? '&' : '?'}sonuc=${sonuc}`;
    }
    
    return url;
  }, [selectedIndex, BASE_URL, sonuc]);

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

  const handlePressItem = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

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

  // Memoize the data parser
  const parseAndSetData = useCallback(responseData => {
    // Clear existing data first
    setData([]);
    setFilteredData([]);

    if (responseData.data && Array.isArray(responseData.data)) {
      if (responseData.data.length === 0) {
        setShowNoData(true);
      } else {
        setShowNoData(false);
        const sortedData = responseData.data.sort((a, b) => 
          new Date(b.tarih) - new Date(a.tarih)
        );
        setData(sortedData);
        setFilteredData(sortedData);
      }
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

  const handleSearch = useCallback((searchText) => {
    if (!searchText) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item => 
      item.sipariskodu.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredData(filtered);
  }, [data]);

  useEffect(() => {
    if (headerVisible && searchText) {
      handleSearch(searchText);
    }
  }, [headerVisible, searchText, handleSearch]);

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

  const getPublicIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      console.log('Public IP Address:', data.ip); // Log the public IP address
    } catch (error) {
      console.error('Error fetching public IP address:', error);
    }
  };

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
          onPress={() => {
            setHeaderVisible(prevState => !prevState);
          }}
          onLongPress={() => Alert.alert('')}
          delayLongPress={5000}
          activeOpacity={1}
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
        ProductList
      )}
      <ProductModal
        visible={modalVisible}
        onClose={handleCloseModal}
        item={selectedItem}
        onKararUpdate={handleKararUpdate}
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
});

export default HomeScreen;
