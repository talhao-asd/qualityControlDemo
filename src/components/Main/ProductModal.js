import React, {useCallback, useMemo, useEffect, useState, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  NativeViewGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import ImageViewer from './ImageViewer';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

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

const ProductModal = ({visible, onClose, item, onKararUpdate}) => {
  const photoKeyExtractor = useCallback((photo, index) => 
    `modal-photo-${photo.id}-${item?.id}-${index}-${photo.yolu}`,
  [item?.id],);
  const BASE_URL = useMemo(() => 'http://192.168.0.88:90', []);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const panRef = useRef(null);
  const scrollRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
        // Calculate opacity based on drag distance
        opacity.value = Math.max(0, 1 - event.translationY / 200);
      }
    },
    onEnd: event => {
      if (event.translationY > 50) {
        // Immediately close
        opacity.value = 0;
        runOnJS(onClose)();
      } else {
        // Spring back to original position
        translateY.value = withSpring(0, {
          damping: 50,
          stiffness: 200,
        });
        opacity.value = withSpring(1);
      }
    },
  });

  // Reset position and opacity when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      opacity.value = 1;
    }
  }, [visible]);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      opacity: opacity.value,
    };
  });

  const handleImagePress = imageUrl => {
    setSelectedImage(imageUrl);
    setImageViewerVisible(true);
  };

  const renderImage = useCallback(
    ({item: photo}) => (
      <TouchableOpacity
        onPress={() => handleImagePress(`${BASE_URL}${photo.yolu}`)}>
        <Image
          source={{uri: `${BASE_URL}${photo.yolu}`}}
          style={styles.image}
        />
      </TouchableOpacity>
    ),
    [BASE_URL],
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const handleDecision = async (karar) => {
    if (!item?.id) {
      console.error('No item selected');
      return;
    }
  
    setIsUpdating(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/Product/UpdateKarar/${item.id}?karar=${karar}`,
        {
          method: 'PUT',
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.ok) {
        console.log('Decision updated successfully');
        onKararUpdate();
        onClose();
      } else {
        console.error('Failed to update decision');
      }
    } catch (error) {
      console.error('Error updating decision:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Modal
        animationType="none"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <GestureHandlerRootView style={{flex: 1}}>
          <Animated.View style={[styles.centeredView, overlayStyle]}>
            <PanGestureHandler
              onGestureEvent={panGestureEvent}
              ref={panRef}
              simultaneousHandlers={scrollRef}>
              <Animated.View style={[styles.modalOuterContainer, rStyle]}>
                <View style={styles.modalContainer}>
                  <LinearGradient
                    colors={['#1981ef', '#084b8c']}
                    style={styles.modalView}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}>
                    <View style={styles.dragIndicator} />
                    {item ? (
                      <>
                        <View style={styles.modalContent}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            }}>
                            <Text style={styles.siparisKodu}>
                              {item.sipariskodu}
                            </Text>
                            <Text style={styles.subtitle}>
                              {new Date(item.kayitTarihi).toLocaleString(
                                'tr-TR',
                              )}
                            </Text>
                          </View>

                          <Text style={styles.title}>
                            {item.hata} / {getHataYeriDisplay(item.hataYeri)}
                          </Text>
                          <Text style={styles.description}>
                            {item.aciklama}
                          </Text>
                          <Text style={styles.subtitle}>{item.musteriAd}</Text>
                          <Text style={styles.subtitle}>{item.stokTanimi}</Text>
                        </View>
                        <View style={styles.imageContainer}>
                          <View style={{width: '100%'}}>
                            <NativeViewGestureHandler
                              ref={scrollRef}
                              simultaneousHandlers={panRef}>
                              <FlatList
                                ref={scrollRef}
                                data={item.abFotolars}
                                horizontal
                                renderItem={renderImage}
                                keyExtractor={photoKeyExtractor}
                                initialNumToRender={3}
                                maxToRenderPerBatch={3}
                                windowSize={3}
                                showsHorizontalScrollIndicator={true}
                                scrollEnabled={true}
                                contentContainerStyle={styles.flatListContent}
                                style={{flexGrow: 0, width: '100%'}}
                                bounces={false}
                                pagingEnabled={true}
                              />
                            </NativeViewGestureHandler>
                          </View>
                        </View>
                        <View style={styles.decisionContainer}>
                          {isUpdating ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="large" color="#1981ef" />
                              <Text style={styles.loadingText}>Güncelleniyor...</Text>
                            </View>
                          ) : (
                            <>
                              <TouchableOpacity 
                                style={[
                                  styles.decisionButton,
                                  item.karar === 1 ? styles.activeButton : styles.inactiveButton,
                                  styles.pendingButton
                                ]}
                                disabled={isUpdating}
                                onPress={() => handleDecision(1)}>
                                <LinearGradient
                                  colors={item.karar === 1 ? ['#4facfe', '#00f2fe'] : ['#e0e0e0', '#bdbdbd']}
                                  style={styles.gradient}
                                  start={{x: 0, y: 0}}
                                  end={{x: 1, y: 0}}>
                                  <Text style={styles.buttonText}>Onay Bekliyor</Text>
                                </LinearGradient>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={[
                                  styles.decisionButton,
                                  item.karar === 2 ? styles.activeButton : styles.inactiveButton,
                                  styles.approveButton
                                ]}
                                onPress={() => handleDecision(2)}>
                                <LinearGradient
                                  colors={item.karar === 2 ? ['#43e97b', '#38f9d7'] : ['#e0e0e0', '#bdbdbd']}
                                  style={styles.gradient}
                                  start={{x: 0, y: 0}}
                                  end={{x: 1, y: 0}}>
                                  <Text style={styles.buttonText}>A Sevk</Text>
                                </LinearGradient>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={[
                                  styles.decisionButton,
                                  item.karar === 3 ? styles.activeButton : styles.inactiveButton,
                                  styles.rejectButton
                                ]}
                                onPress={() => handleDecision(3)}>
                                <LinearGradient
                                  colors={item.karar === 3 ? ['#ff758c', '#ff7eb3'] : ['#e0e0e0', '#bdbdbd']}
                                  style={styles.gradient}
                                  start={{x: 0, y: 0}}
                                  end={{x: 1, y: 0}}>
                                  <Text style={styles.buttonText}>B Sevk</Text>
                                </LinearGradient>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={[
                                  styles.decisionButton,
                                  item.karar === 4 ? styles.activeButton : styles.inactiveButton,
                                  styles.holdButton
                                ]}
                                onPress={() => handleDecision(4)}>
                                <LinearGradient
                                  colors={item.karar === 4 ? ['#ff9a9e', '#fad0c4'] : ['#e0e0e0', '#bdbdbd']}
                                  style={styles.gradient}
                                  start={{x: 0, y: 0}}
                                  end={{x: 1, y: 0}}>
                                  <Text style={styles.buttonText}>B Kalsın</Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </>
                    ) : (
                      <Text>Loading...</Text>
                    )}
                  </LinearGradient>
                </View>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>

      <ImageViewer
        visible={imageViewerVisible}
        imageUrl={selectedImage}
        onClose={() => setImageViewerVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalOuterContainer: {
    width: '100%',
    height: '64%',
    overflow: 'hidden',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1981ef',
    borderTopLeftRadius: SCREEN_WIDTH * 0.08,
    borderTopRightRadius: SCREEN_WIDTH * 0.08,
    overflow: 'hidden',
  },
  modalView: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: SCREEN_WIDTH * 0.08,
    borderTopRightRadius: SCREEN_WIDTH * 0.08,
    padding: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  dragIndicator: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_HEIGHT * 0.006,
    backgroundColor: '#fff',
    borderRadius: 3,
    marginBottom: SCREEN_HEIGHT * 0.02,
    opacity: 0.7,
  },
  subtitle: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#555',
    marginBottom: SCREEN_HEIGHT * 0.004,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#000',
  },
  siparisKodu: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#1981ef',
    fontWeight: '800',
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  description: {
    fontSize: SCREEN_WIDTH * 0.032,
    color: '#aeaeae',
    lineHeight: SCREEN_HEIGHT * 0.022,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.04,
  },
  image: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_HEIGHT * 0.2,
    marginRight: SCREEN_WIDTH * 0.02,
    borderRadius: SCREEN_WIDTH * 0.03,
    resizeMode: 'cover',
  },
  flatListContent: {
    paddingVertical: SCREEN_HEIGHT * 0.012,
  },
  decisionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  decisionButton: {
    width: '24%',
    borderRadius: SCREEN_WIDTH * 0.02,
    overflow: 'hidden',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  gradient: {
    paddingVertical: SCREEN_HEIGHT * 0.015,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inactiveButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: SCREEN_WIDTH * 0.04,
  },
  loadingText: {
    marginTop: 10,
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#1981ef',
    fontWeight: '600',
  },
});

export default ProductModal;
