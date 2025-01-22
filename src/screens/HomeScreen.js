import { View, Text, FlatList, Image, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import AnimatedTabs from '../components'
import { Home } from "lucide-react-native"

const HomeScreen = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const url = selectedIndex === 5
      ? 'http://10.0.0.38:2025/api/Product/Listele'
      : `http://10.0.0.38:2025/api/Product/Listele?karar=${selectedIndex}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'accept': '*/*'
      }
    })
    .then(response => response.json())
    .then(responseData => {
      if (Array.isArray(responseData.data)) {
        setData(responseData.data);
        setFilteredData(responseData.data);
      } else {
        console.error('Expected an array but received:', responseData);
      }
    })
    .catch(error => console.error('Error fetching data:', error))
    .finally(() => setIsLoading(false));
  }, [selectedIndex]);

  const handleTabChange = (index) => {
    console.log("Tab changed to:", index);
    setSelectedIndex(index);
    setIsLoading(true);
    filterData(index);
  };

  const filterData = (index) => {
    if (index === 5) { // "Tüm Ürünler" case, show all items
      setFilteredData(data);
      setIsLoading(false);
    } else {
      // Filter data based on kararId matching the selected index
      const filtered = data.filter(item => item.kararId === index);
      setFilteredData(filtered);
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.stokTanimi}</Text>
      <Text style={styles.subtitle}>Customer: {item.musteriAd}</Text>
      <Text style={styles.description}>Description: {item.aciklama}</Text>
      <FlatList
        data={item.abFotolars}
        horizontal
        renderItem={({ item: photo }) => (
          <Image
            source={{ uri: `http://10.0.0.38:2025${photo.yolu}` }}
            style={styles.image}
          />
        )}
        keyExtractor={photo => photo.id.toString()}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AnimatedTabs
          data={[
            { icon: "PencilLine", label: "Kayıt" },
            { icon: "Loader", label: "Bekliyor" },
            { icon: "AArrowUp", label: "A Sevk" },
            { icon: "Bold", label: "B Sevk" },
            { icon: "ShieldMinus", label: "B Kalsın" },
            { icon: "Folders", label: "Tüm Ürünler" },
          ]}
          onChange={handleTabChange}
          selectedIndex={selectedIndex}
          activeColor="#fff"
          inactiveColor="#999"
          activeBackgroundColor="#ff0051"
          inactiveBackgroundColor="#ddd"
        />

      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#ff0051" />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginTop: 20
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  description: {
    fontSize: 12,
    color: '#777',
    marginVertical: 4,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 8,
  },
  logo:{
  }
});

export default HomeScreen