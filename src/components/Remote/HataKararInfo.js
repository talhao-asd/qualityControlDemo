import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * HataKararInfo Component
 * Displays the Hata and Karar information.
 *
 * Props:
 * - hata: The hata value
 * - hataYeri: The hataYeri value
 * - karar: The karar value
 * - style: Additional styling for the container (optional)
 */
const HataKararInfo = ({ hata, hataYeri, karar, style }) => {
  const getHataYeriDisplay = useCallback((hataYeri) => {
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

  const getKararDisplay = useCallback((karar) => {
    const decision = Number(karar);
    switch (decision) {
      case 0:
        return 'Kayıt';
      case 1:
        return 'Onay Bekliyor';
      case 2:
        return 'A Sevk';
      case 3:
        return 'B Sevk';
      case 4:
        return 'B Kalsın';
      default:
        return 'Bilinmiyor';
    }
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={styles.label}>Hata:</Text>
        <Text style={styles.value}>
          {hata} / {getHataYeriDisplay(hataYeri)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Karar:</Text>
        <Text style={styles.value}>{getKararDisplay(karar)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
 },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between', 
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF', // Blue accent color for labels
    marginRight: 6,
  },
  value: {
    fontSize: 16,
    color: '#333333', // Dark gray value text
    flexShrink: 1,
  },
});

export default HataKararInfo; 