import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchText } from '../../store/searchSlice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function SearchBar({ onSearch }) {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { searchText, sortOrder, sonuc } = useSelector(state => state.search);

  // Fetch products from the API when the component mounts
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.0.88:90/api/Product/GetBarkodGruplari', {
        headers: {
          accept: '*/*',
        },
      });
      const json = await response.json();
      if (json.statusCode === 200 && Array.isArray(json.data)) {
        setProducts(json.data);
        setFilteredProducts(json.data);
      } else {
        console.error('API error:', json);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter the products based solely on the sipariskodu field.
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowerCaseQuery = searchText.toLowerCase();
      const filtered = products.filter(item => {
        return (
          item.sipariskodu &&
          item.sipariskodu.toLowerCase().includes(lowerCaseQuery)
        );
      });
      setFilteredProducts(filtered);
    }
  }, [searchText, products]);

  return (
    <View style={styles.container}>
      {/* Header Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Sipariş Kodu Ara..."
        placeholderTextColor="#3498db"
        value={searchText}
        onChangeText={text => {
          dispatch(setSearchText(text));
          onSearch(text);
        }}
      />
      {loading && <ActivityIndicator size="large" color="#3498db" style={styles.loading} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SCREEN_WIDTH * 0.05,
  },
  searchInput: {
    height: 40,
    width: SCREEN_WIDTH - SCREEN_WIDTH * 0.1,
    backgroundColor: '#fff',
    borderColor: '#3498db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
    alignSelf: 'center',
  },
  loading: {
    marginVertical: SCREEN_HEIGHT * 0.03,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3498db',
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3498db',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.03,
    color: '#3498db',
  },
});

export default SearchBar;
