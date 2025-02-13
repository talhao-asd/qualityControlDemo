import {
  View,
  Text,
  Image,
  Dimensions,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import SearchBar from './SearchBar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Header = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);

  const handlePinSubmit = () => {
    // Check if the entered PIN matches secret PIN 6161
    if (pin === '61331161') {
      setIsPinVerified(true);
    } else {
      Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect.');
    }
  };

  return (
    <>
      <Pressable onLongPress={() => setModalVisible(true)}>
        <SafeAreaView
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: SCREEN_HEIGHT * 0.02,
          }}>
          <Image
            source={require('../../assets/images/new.png')}
            style={{
              resizeMode: 'contain',
              width: SCREEN_WIDTH * 0.9,
              height: SCREEN_HEIGHT * 0.05,
            }}
          />

        </SafeAreaView>
      </Pressable>

      <Modal  transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {isPinVerified ? (
              <>
                <Text style={styles.modalText}>Select Screen to Navigate:</Text>
                <Pressable
                  style={styles.listButton}
                  onPress={() => {
                    navigation.navigate('ListScreen');
                    setModalVisible(false);
                    setIsPinVerified(false);
                    setPin('');
                  }}>
                  <Text style={styles.listButtonText}>ListScreen</Text>
                </Pressable>
                <Pressable
                  style={styles.listButton}
                  onPress={() => {
                    navigation.navigate('Istanbul');
                    setModalVisible(false);
                    setIsPinVerified(false);
                    setPin('');
                  }}>
                  <Text style={styles.listButtonText}>IstanbulScreen</Text>
                </Pressable>
                <Pressable
                  style={styles.listButton}
                  onPress={() => {
                    navigation.navigate('Home');
                    setModalVisible(false);
                    setIsPinVerified(false);
                    setPin('');
                  }}>
                  <Text style={styles.listButtonText}>HomeScreen</Text>
                </Pressable>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setIsPinVerified(false);
                    setPin('');
                  }}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.modalText}>Enter PIN:</Text>
                <TextInput
                  value={pin}
                  onChangeText={setPin}
                  placeholder="Enter PIN"
                  secureTextEntry={true}
                  keyboardType="numeric"
                  style={styles.textInput}
                />
                <Pressable style={styles.submitButton} onPress={handlePinSubmit}>
                  <Text style={styles.submitButtonText}>Submit PIN</Text>
                </Pressable>
                <Pressable
                  style={styles.closeButton}
                  onPress={() => {
                    setModalVisible(false);
                    setPin('');
                  }}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  submitButton: {
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  listButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Header;