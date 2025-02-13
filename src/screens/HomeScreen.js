import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
  InteractionManager,
} from 'react-native';
import SkeletonLoader from '../components/Main/SkeletonLoader';
import NoDataView from '../components/Main/NoDataView';
import AnimatedTabs from '../components';
import ProductModal from '../components/Main/ProductModal';
import HeaderSecondBar from '../components/Main/HeaderSecondBar';
import { useSelector } from 'react-redux';
import ProductCard from '../components/Main/ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = () => {
  // Removed FastHomeScreen branch for a single optimized HomeScreen component

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoData, setShowNoData] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const { searchText, sonuc } = useSelector(state => state.search);

  const tabsData = useMemo(() => [
    { icon: 'Loader', label: 'Kayit' },
    { icon: 'Loader', label: 'Bekliyor' },
    { icon: 'AArrowUp', label: 'A Sevk' },
    { icon: 'Bold', label: 'B Sevk' },
    { icon: 'ShieldMinus', label: 'B Kalsın' },
    { icon: 'ShieldMinus', label: 'Tüm Ürünler' },
  ], []);

  const BASE_URL = useMemo(() => 'http://192.168.0.88:90', []);
  const fetchUrl = useMemo(() => {
    const endpoint = '/api/Product/Listele';
    let url = selectedIndex === 5
      ? `${BASE_URL}${endpoint}`
      : `${BASE_URL}${endpoint}?karar=${selectedIndex}`;

    if (sonuc !== 'tumu') {
      url += `${url.includes('?') ? '&' : '?'}sonuc=${sonuc}`;
    }
    return url;
  }, [selectedIndex, BASE_URL, sonuc]);

  const fetchOptions = useMemo(() => ({
    method: 'GET',
    headers: {
      accept: '*/*',
    },
  }), []);

  // Function to handle product selection
  const handlePressItem = useCallback(item => {
    setSelectedItem(item);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedItem(null);
    // Force re-mounting of FlatList to reset residual touch state
    setListKey(prev => prev + 1);
  }, []);

  const getHataYeriDisplay = useCallback(hataYeri => {
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
  }, []);

  // Memoized renderItem that uses the memoized ProductCard
  const renderItem = useCallback(({ item }) => (
    <ProductCard
      item={item}
      onPress={handlePressItem}
      getHataYeriDisplay={getHataYeriDisplay}
    />
  ), [handlePressItem, getHataYeriDisplay]);

  const keyExtractor = useCallback((item, index) =>
    `${item.id}-${item.sipariskodu}-${item.tarih}-${index}`, []
  );

  const parseAndSetData = useCallback(responseData => {
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

  const handleTabChange = useCallback(index => {
    setIsLoading(true);
    setShowNoData(false);
    setData([]);
    setFilteredData([]);
    setSelectedIndex(index);

    // Save the selected tab index asynchronously after UI interactions finish
    InteractionManager.runAfterInteractions(() => {
       AsyncStorage.setItem('selectedTabIndex', index.toString())
         .catch(err => console.error("Error saving tab index", err));
    });

    // Fetch new data immediately on tab change
    fetch(fetchUrl, fetchOptions)
      .then(response => response.json())
      .then(data => parseAndSetData(data))
      .catch(error => {
        console.error('Fetch error:', error);
        setShowNoData(true);
      })
      .finally(() => setIsLoading(false));
  }, [fetchUrl, fetchOptions, parseAndSetData]);

  const handleSort = useCallback((sortOrder) => {
    setFilteredData(prevData => {
      const newData = [...prevData];
      return newData.sort((a, b) => {
        const dateA = new Date(a.tarih);
        const dateB = new Date(b.tarih);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
    });
  }, []);

  const handleSearch = useCallback(text => {
    if (!text) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter(item =>
      item.sipariskodu.toLowerCase().includes(text.toLowerCase())
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
    // Removed artificial delay to load data faster
    fetch(fetchUrl, fetchOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
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
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [fetchUrl, fetchOptions, parseAndSetData]);

  const ProductList = useMemo(() => (
    <FlatList
      data={filteredData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={true}
    />
  ), [filteredData, renderItem, keyExtractor]);

  // Ensure you hold a ref to your FlatList and a key to force a refresh after modal close:
  const flatListRef = useRef(null);
  const currentOffsetRef = useRef(0);
  const [listKey, setListKey] = useState(0);

  // Track the FlatList offset using a ref to avoid re-renders on every scroll event:
  const handleScroll = event => {
    currentOffsetRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleSwipeDismiss = velocityY => {
    handleCloseModal(); // close the modal

    // Optionally, if you want to continue scrolling:
    if (flatListRef.current) {
      // Calculate additional offset based on velocity; adjust factor as needed.
      const additionalOffset = velocityY * 10; 
      flatListRef.current.scrollToOffset({
        offset: currentOffsetRef.current + additionalOffset,
        animated: true,
      });
    }
  };

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
          key={listKey}
          ref={flatListRef}
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onScroll={handleScroll}
          showsVerticalScrollIndicator={true}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 120,
            offset: 120 * index,
            index,
          })}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          ListHeaderComponent={headerVisible ? HeaderSecondBar : null}
          contentContainerStyle={styles.listContainer}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          bounces={false}
        />
      )}
      {modalVisible && (
        <ProductModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onSwipeDismiss={handleSwipeDismiss}
          item={selectedItem}
          onKararUpdate={() => handleTabChange(selectedIndex)}
          loading={isLoading}
        />
      )}
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
    width: '92%',
    alignSelf: 'center',
    padding: Math.min(SCREEN_WIDTH * 0.04, 12),
    marginVertical: SCREEN_HEIGHT * 0.008,
    borderRadius: Math.min(SCREEN_WIDTH * 0.02, 8),
    shadowColor: '#1981ef',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
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
  listContainer: {
    paddingBottom: SCREEN_HEIGHT * 0.02,
  },
});

export default HomeScreen;
