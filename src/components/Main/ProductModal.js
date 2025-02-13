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

const ProductModal = ({visible, onClose, onSwipeDismiss, item, onKararUpdate, loading}) => {
  if (!visible) return null;

  const photoKeyExtractor = useCallback((photo, index) => 
    `modal-photo-${photo.id}-${item?.id}-${index}-${photo.fotoYolu}`,
  [item?.id],);
  const BASE_URL = useMemo(() => 'http://192.168.0.88:90', []);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const scrollRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const panGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      if (
        Math.abs(event.translationY) > Math.abs(event.translationX) &&
        event.translationY > 0
      ) {
        translateY.value = event.translationY;
        opacity.value = Math.max(0, 1 - event.translationY / 200);
      }
    },
    onEnd: event => {
      if (event.translationY > 30) {
        opacity.value = 0;
        runOnJS(onSwipeDismiss ? onSwipeDismiss : onClose)(event.velocityY);
      } else {
        translateY.value = withSpring(0, {
          damping: 50,
          stiffness: 200,
        });
        opacity.value = withSpring(1);
      }
    },
  });

  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      opacity.value = 1;
    }
  }, [visible, translateY, opacity]);

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
    ({item: photo}) => {
      if (!photo?.fotoYolu) return null;
      const imageUrl = `${BASE_URL}${photo.fotoYolu}`;
      console.log(`Trying to fetch foto from: ${imageUrl}`);
      return (
        <TouchableOpacity onPress={() => handleImagePress(imageUrl)}>
          <Image
            source={{uri: imageUrl}}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => console.log(`Successfully loaded image from: ${imageUrl}`)}
            onError={error => console.warn('Image load error:', error)}
            defaultSource={require('../../assets/images/ASD.png')}
          />
        </TouchableOpacity>
      );
    },
    [BASE_URL, handleImagePress]
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (item) {
      console.log('Modal item:', item);
      console.log('Photos:', item.photos);
    }
  }, [item]);

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

  useEffect(() => {
    return () => {
      // Cleanup when modal unmounts
      if (visible) {
        onClose();
      }
    };
  }, [visible, onClose]);

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
              waitFor={scrollRef}
              simultaneousHandlers={scrollRef}
              activeOffsetY={20}>
              <Animated.View style={[styles.modalOuterContainer, rStyle]}>
                <View style={styles.modalContainer}>
                  <LinearGradient
                    colors={['#1981ef', '#084b8c']}
                    style={styles.modalView}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}>
                    <View style={styles.dragIndicator} />
                    {loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1981ef" />
                      </View>
                    ) : item ? (
                      <>
                        <View style={styles.modalContent}>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.siparisKodu}>{item.sipariskodu}</Text>
                            <Text style={styles.subtitle}>
                              {new Date(item.kayitTarihi).toLocaleString('tr-TR')}
                            </Text>
                          </View>
                          <Text style={styles.title}>
                            {item.hata} / {getHataYeriDisplay(item.hataYeri)}
                          </Text>
                          <Text style={styles.description}>{item.aciklama}</Text>
                          <Text style={styles.subtitle}>{item.musteriAd}</Text>
                          <Text style={styles.subtitle}>{item.stokTanimi}</Text>
                        </View>

                        <View style={styles.imageContainer}>
                          {item?.photos && item.photos.length > 0 ? (
                            <FlatList
                              data={item.photos}
                              horizontal
                              renderItem={renderImage}
                              keyExtractor={(photo, index) =>
                                `modal-photo-${photo.id}-${index}-${photo.fotoYolu}`
                              }
                              initialNumToRender={3}
                              maxToRenderPerBatch={3}
                              windowSize={3}
                              showsHorizontalScrollIndicator={true}
                              style={{ flexGrow: 0, width: '100%' }}
                              bounces={false}
                              pagingEnabled={true}
                            />
                          ) : item?.fotoYolu ? (
                            <TouchableOpacity
                              onPress={() => handleImagePress(`${BASE_URL}${item.fotoYolu}`)}>
                              <Image
                                source={{ uri: `${BASE_URL}${item.fotoYolu}` }}
                                style={styles.image}
                                resizeMode="cover"
                                onLoad={() =>
                                  console.log(
                                    `Successfully loaded image from: ${BASE_URL}${item.fotoYolu}`
                                  )
                                }
                                onError={error => console.warn('Image load error:', error)}
                                defaultSource={require('../../assets/images/ASD.png')}
                              />
                            </TouchableOpacity>
                          ) : (
                            <Text style={styles.noImagesText}>No images available</Text>
                          )}
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
                                style={[styles.decisionButton, item.karar === 1 ? styles.activeButton : styles.inactiveButton]}
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
                                style={[styles.decisionButton, item.karar === 2 ? styles.activeButton : styles.inactiveButton]}
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
                                style={[styles.decisionButton, item.karar === 3 ? styles.activeButton : styles.inactiveButton]}
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
                                style={[styles.decisionButton, item.karar === 4 ? styles.activeButton : styles.inactiveButton]}
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
                    ) : null}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: SCREEN_WIDTH * 0.02,
  },
  loadingText: {
    marginTop: 10,
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#1981ef',
    fontWeight: '600',
  },
  noImagesText: {
    textAlign: 'center',
    color: '#666',
    padding: 10,
  },
});

export default ProductModal;