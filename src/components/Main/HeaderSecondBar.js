import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React from 'react';
import {ArrowDown, ArrowUp, Search} from 'lucide-react-native';
import {useSelector, useDispatch} from 'react-redux';
import {setSearchText, setSortOrder, setSonuc} from '../../store/searchSlice';
import {Picker} from '@react-native-picker/picker';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const HeaderSecondBar = ({onSort, onSearch, setIsLoading}) => {
  const dispatch = useDispatch();
  const {searchText, sortOrder, sonuc} = useSelector(state => state.search);

  const handleSortPress = () => {
    const newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    dispatch(setSortOrder(newSortOrder));
    onSort(newSortOrder);
  };

  const handlePickerChange = itemValue => {
    setIsLoading(true);
    dispatch(setSonuc(itemValue));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Sipariş Kodu Ara..."
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={text => {
          dispatch(setSearchText(text));
          onSearch(text);
        }}
      />
      {/* <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sonuc}
          style={styles.pickerStyle}
          onValueChange={handlePickerChange}
          dropdownIconColor="#1981ef"
          numberOfLines={1}>
          <Picker.Item 
            label="Tümü" 
            value="tumu" 
            style={[styles.pickerItem, { width: '100%' }]} 
          />
          <Picker.Item
            label="Sonuçlandırılmamış"
            value="0"
            style={[styles.pickerItem, { width: '100%' }]}
          />
          <Picker.Item
            label="Sonuçlandırılmış"
            value="1"
            style={[styles.pickerItem, { width: '100%' }]}
          />
        </Picker>
      </View> */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSortPress}>
        {sortOrder === 'desc' ? (
          <ArrowDown size={24} color="#fff" />
        ) : (
          <ArrowUp size={24} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#fff',
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.03,
    height: SCREEN_HEIGHT * 0.06,
    borderRadius: SCREEN_WIDTH * 0.02,
    shadowColor: '#1981ef',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    fontSize: Math.min(SCREEN_WIDTH * 0.04, 14),
  },
  pickerContainer: {
    backgroundColor: '#fff',

    borderRadius: SCREEN_WIDTH * 0.02,
    shadowColor: '#1981ef',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginRight: SCREEN_WIDTH * 0.03,
    flex: 1,
    maxWidth: SCREEN_WIDTH * 0.45,
  },
  pickerStyle: {
    height: SCREEN_HEIGHT * 0.06,
    color: '#1981ef',
  },
  pickerItem: {
    fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
    color: '#1981ef',
  },
  searchButton: {
    backgroundColor: '#1981ef',
    padding: Math.min(SCREEN_WIDTH * 0.02, SCREEN_HEIGHT * 0.015),
    borderRadius: SCREEN_WIDTH * 0.02,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HeaderSecondBar;
