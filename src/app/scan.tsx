
import { File, Paths } from 'expo-file-system';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import PredictionResult from '@/components/scanner/PredictionResult';

import {
  PredictionResponse,
  predictPlantDisease,
} from '@/services/api';

const GREEN = '#2E7D32';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] =
    useState<PredictionResponse | null>(null);

const selectImage = async (uri: string) => {
  try {
    const sourceFile = new File(uri);

    const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';

    const persistentFile = new File(
      Paths.cache,
      `leafsense_${Date.now()}.${extension}`
    );

    sourceFile.copy(persistentFile);

    setImage(persistentFile.uri);
    setPrediction(null);

  } catch (error) {
    console.error('Image copy error:', error);

    Alert.alert(
      'Image Error',
      'Unable to prepare this image. Please select it again.'
    );
  }
};
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow gallery access.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        await selectImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Unable to open the photo gallery.');
    }
  };

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Please allow camera access.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        await selectImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Unable to open the camera.');
    }
  };

  const analyzePlant = async () => {
    if (!image || loading) return;

    setLoading(true);
    setPrediction(null);

    try {
      const result = await predictPlantDisease(image);

      if (!result.success || !result.result) {
        throw new Error(
          'The server returned an invalid prediction.'
        );
      }

      setPrediction(result);
    } catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.';

  Alert.alert(
    'Unable to Analyze Plant',
    message,
    [{ text: 'OK' }]
  );
} finally {
      setLoading(false);
    }
  };

  if (prediction && image) {
    return (
      <PredictionResult
        imageUri={image}
        prediction={prediction}
        onScanAgain={() => {
          setPrediction(null);
          setImage(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Plant Scanner</Text>

        <Text style={styles.subtitle}>
          Take a picture or upload a plant leaf image
          to identify possible diseases.
        </Text>

        {/* Image preview */}
        <View style={styles.preview}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <>
              <Text style={styles.cameraEmoji}>🌿</Text>

              <Text style={styles.previewTitle}>
                No image selected
              </Text>

              <Text style={styles.previewSubtitle}>
                Your plant image will appear here
              </Text>
            </>
          )}
        </View>

        {/* Take photo */}
        <Pressable
          style={styles.primaryButton}
          onPress={takePhoto}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            📷  Take a Photo
          </Text>
        </Pressable>

        {/* Choose from gallery */}
        <Pressable
          style={styles.secondaryButton}
          onPress={pickImage}
          disabled={loading}
        >
          <Text style={styles.galleryIcon}>🖼️</Text>

          <Text
            style={styles.secondaryButtonText}
            numberOfLines={1}
          >
            Choose from Gallery
          </Text>
        </Pressable>

        {/* Analyze selected image */}
        {image && (
          <>
            <Pressable
              style={[
                styles.analyzeButton,
                loading && { opacity: 0.7 },
              ]}
              onPress={analyzePlant}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" />

                  <Text style={styles.buttonText}>
                    Analyzing image...
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Analyze Plant →
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setImage(null);
                setPrediction(null);
              }}
              disabled={loading}
            >
              <Text style={styles.removeText}>
                Remove selected image
              </Text>
            </Pressable>
          </>
        )}

        {/* Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>
            📌 Tips for better results
          </Text>

          <Text style={styles.tipText}>
            • Capture the affected leaf clearly.
            {'\n'}• Use good natural lighting.
            {'\n'}• Avoid blurry images.
            {'\n'}• Keep the leaf in focus.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9F6',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 27,
    fontWeight: '800',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#718071',
    marginTop: 8,
    marginBottom: 24,
  },
  preview: {
    height: 280,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D5E8D6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 22,
  },
  cameraEmoji: {
    fontSize: 55,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  previewSubtitle: {
    fontSize: 12,
    color: '#718071',
    marginTop: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  primaryButton: {
    backgroundColor: GREEN,
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 17,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    minHeight: 64,
  },
  galleryIcon: {
    fontSize: 18,
  },
  secondaryButtonText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 0,
  },
  analyzeButton: {
    backgroundColor: '#1B5E20',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  removeText: {
    textAlign: 'center',
    color: '#D32F2F',
    marginTop: 15,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginTop: 25,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C2B1D',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 24,
    color: '#718071',
  },
});
