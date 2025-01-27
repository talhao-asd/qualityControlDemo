import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {View, Text, FlatList, Image, StyleSheet, SafeAreaView, TouchableOpacity, Alert} from 'react-native';
import SkeletonLoader from '../components/Main/SkeletonLoader';
import NoDataView from '../components/Main/NoDataView';
import AnimatedTabs from '../components';
import ProductModal from '../components/Main/ProductModal';

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Memoize the tabs data to prevent recreation on each render
  const tabsData = useMemo(
    () => [
      {icon: 'Loader', label: 'Bekliyor'},
      {icon: 'AArrowUp', label: 'A Sevk'},
      {icon: 'Bold', label: 'B Sevk'},
      {icon: 'ShieldMinus', label: 'B Kalsın'},
    ],
    [],
  );

  // Memoize the fetch URL with base URL constant
  const BASE_URL = useMemo(() => 'http://192.168.0.88:90', []);
  const fetchUrl = useMemo(() => {
    const endpoint = '/api/Product/Listele';
    return selectedIndex === 3
      ? `${BASE_URL}${endpoint}`
      : `${BASE_URL}${endpoint}?karar=${selectedIndex + 1}`;
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

  // Memoize the photo keyExtractor
  const photoKeyExtractor = useCallback(photo => photo.id.toString(), []);

  const handlePressItem = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Memoize the renderItem function with its dependencies
  const renderItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        onPress={() => handlePressItem(item)}
        style={styles.card}>
        <Text style={styles.title}>{item.musteriAd?.slice(0, 15)}...</Text>
        <Text style={styles.siparisKodu}>{item.sipariskodu}</Text>
        <Text style={styles.subtitle}>{item.stokTanimi}</Text>
        <Text style={styles.description}>{item.hata} / {item.hataYeri}</Text>
        <Text style={styles.description}>Kayıt Tarihi: {new Date(item.kayitTarihi).toLocaleString('tr-TR')}</Text>
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

  const keyExtractor = useCallback(item => item.id.toString(), []);

  const handleTabChange = useCallback(index => {
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
  }, [selectedIndex, fetchUrl, fetchOptions, parseAndSetData]);

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
        // Show no data view if the array is empty
        setShowNoData(true);
      } else {
        setShowNoData(false);
        setData(responseData.data);
        setFilteredData(responseData.data);
      }
    } else {
      console.error('Expected an array but received:', responseData);
      setShowNoData(true);
    }
  }, []);

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
          onLongPress={() => Alert.alert('')}
          delayLongPress={5000}
          activeOpacity={1} style={{
            position: 'absolute',
            top: 12,
            right: 16,
          }}>
          <Image
            source={require('../assets/images/new.png')}
            style={{
              resizeMode: 'contain', 
              width: 125,
              height: 50,
            }}
          />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.skeletonContainer}><SkeletonLoader /></View>
      ) : showNoData ? (
        <NoDataView />
      ) : (
        ProductList
      )}
      <ProductModal
        visible={modalVisible}
        onClose={handleCloseModal}
        item={selectedItem}
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
    padding: 16,
    marginTop: 10
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  siparisKodu: {
    fontSize: 16,
    color: '#1981ef',
    marginVertical: 2,
  },

  description: {
    fontSize: 12,
    color: '#777',
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
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
});

export default HomeScreen;
