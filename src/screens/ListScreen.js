import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image
} from 'react-native';
import SkeletonLoader from '../components/Main/SkeletonLoader';
import Header from '../components/Remote/Header';

// Helper function to add a timeout in fetch requests
const fetchWithTimeout = (resource, options = {}) => {
  const { timeout = 10000 } = options; // 10 seconds timeout by default
  return Promise.race([
    fetch(resource, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Lutfen ASD PERSONEL wifi agina baglanin')), timeout)
    )
  ]);
};

const ListScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the product data from your API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithTimeout('http://192.168.0.88:90/api/Product/Listele', { timeout: 10000 });
        const json = await response.json();
        if (json.statusCode === 200) {
          setData(json.data);
        } else {
          setError('Failed to load products.');
        }
      } catch (err) {
        setError(err.message || 'Lutfen ASD PERSONEL wifi agina baglanin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render each product in the list, including the image and extended details if available
  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        {item.fotoYolu ? (
          <Image 
            source={{ uri: `http://192.168.0.88:90${item.fotoYolu}` }} 
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : null}
        <Text style={styles.itemTitle}>{item.stokTanimi || "No Title"}</Text>
        <Text style={styles.itemData}>Barkod: {item.barkod}</Text>
        <Text style={styles.itemData}>Müşteri: {item.musteriAd}</Text>
        <Text style={styles.itemData}>
          Tarih: {item.tarih ? new Date(item.tarih).toLocaleDateString() : 'N/A'}
        </Text>
        <Text style={styles.itemData}>Miktar: {item.miktar}</Text>
        <Text style={styles.itemData}>Sipariş Kodu: {item.sipariskodu}</Text>
        <Text style={styles.itemData}>Karar Sonuc: {item.kararSonuc}</Text>
        <Text style={styles.itemData}>Plaka: {item.plaka}</Text>
        <Text style={styles.itemData}>Hata: {item.hata}</Text>
        <Text style={styles.itemData}>Hata Yeri: {item.hataYeri}</Text>
        <Text style={styles.itemData}>Açıklama: {item.aciklama}</Text>
      </View>
    );
  };

  // Render a loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render an error message if needed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />  
      <Text style={styles.header}>Ürün Listesi</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center'
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  itemImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemData: {
    fontSize: 14,
    marginTop: 4,
  },
  separator: {
    height: 10,
  },
});

export default ListScreen; 