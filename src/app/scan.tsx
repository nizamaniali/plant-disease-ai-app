
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import PredictionResult from '@/components/scanner/PredictionResult';

import {
  predictPlantDisease,
  PredictionResponse,
} from '@/services/api';

const GREEN = '#2E7D32';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] =
    useState<PredictionResponse | null>(null);

  const selectImage = (uri: string) => {
    setImage(uri);
    setPrediction(null);
  };

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow gallery access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      selectImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      selectImage(result.assets[0].uri);
    }
  };

  const analyzePlant = async () => {
    if (!image || loading) return;

    setLoading(true);
    setPrediction(null);

    try {
      const result = await predictPlantDisease(image);

      if (!result.success || !result.result) {
        throw new Error('The server returned an invalid prediction.');
      }

      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);

      Alert.alert(
        'Prediction failed',
        error instanceof Error
          ? error.message
          : 'Could not connect to the prediction server.'
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Plant Scanner</Text>

        <Text style={styles.subtitle}>
          Take a picture or upload a plant leaf image
          to identify possible diseases.
        </Text>

        <View style={styles.preview}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <>
              <Text style={styles.cameraEmoji}>🌿</Text>
              <Text style={styles.previewTitle}>No image selected</Text>
              <Text style={styles.previewSubtitle}>
                Your plant image will appear here
              </Text>
            </>
          )}
        </View>

        <Pressable style={styles.primaryButton} onPress={takePhoto}>
          <Text style={styles.buttonText}>📷  Take a Photo</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={pickImage}>
          <Text style={styles.secondaryButtonText}>
            🖼️  Choose from Gallery
          </Text>
        </Pressable>

        {image && (
          <>
            <Pressable
              style={[styles.analyzeButton, loading && { opacity: 0.7 }]}
              onPress={analyzePlant}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.buttonText}>Analyzing image...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Analyze Plant →</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setImage(null);
                setPrediction(null);
              }}
              disabled={loading}
            >
              <Text style={styles.removeText}>Remove selected image</Text>
            </Pressable>
          </>
        )}

        {prediction && (
          <View style={styles.resultCard}>
            <Text style={styles.resultHeading}>Analysis Results</Text>

            <Text style={styles.resultLabel}>Predicted condition</Text>

            <Text style={styles.predictedClass}>
              {prediction.result.predicted_class.replaceAll('_', ' ')}
            </Text>

            <Text style={styles.confidence}>
              Model score: {prediction.result.confidence}%
            </Text>

            <View style={styles.divider} />

            <Text style={styles.topTitle}>Top 3 Predictions</Text>

            {prediction.result.top_predictions.map((item, index) => (
              <View key={`${item.class_name}-${index}`} style={styles.predictionRow}>
                <View style={styles.predictionInfo}>
                  <Text style={styles.rank}>#{index + 1}</Text>
                  <Text style={styles.predictionName}>
                    {item.class_name.replaceAll('_', ' ')}
                  </Text>
                </View>

                <Text style={styles.predictionScore}>
                  {item.confidence.toFixed(2)}%
                </Text>
              </View>
            ))}

            <Text style={styles.modelNote}>
              Model: {prediction.model}{'\n'}
              Scores are model outputs, not calibrated probabilities.
            </Text>
          </View>
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>📌 Tips for better results</Text>
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
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '700',
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
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#E5EAE3',
  },
  resultHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1B5E20',
    marginBottom: 20,
  },
  resultLabel: {
    color: '#718071',
    fontSize: 12,
  },
  predictedClass: {
    color: '#1C2B1D',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  confidence: {
    color: GREEN,
    fontWeight: '700',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5EAE3',
    marginVertical: 18,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C2B1D',
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2EF',
  },
  predictionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  rank: {
    color: GREEN,
    fontWeight: '800',
    marginRight: 10,
  },
  predictionName: {
    color: '#1C2B1D',
    fontSize: 13,
    flexShrink: 1,
  },
  predictionScore: {
    color: GREEN,
    fontWeight: '700',
  },
  modelNote: {
    color: '#718071',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 16,
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
