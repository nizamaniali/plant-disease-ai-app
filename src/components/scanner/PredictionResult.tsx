
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PredictionResponse } from '@/services/api';

interface Props {
  imageUri: string;
  prediction: PredictionResponse;
  onScanAgain: () => void;
}

const GREEN = '#2E7D32';

function formatClassName(name: string) {
  return name
    .replace(/___/g, ' - ')
    .replace(/_/g, ' ')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function PredictionResult({
  imageUri,
  prediction,
  onScanAgain,
}: Props) {
  const result = prediction.result;

  const predictedName = formatClassName(result.predicted_class);

  const isHealthy = result.predicted_class
    .toLowerCase()
    .includes('healthy');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analysis Results</Text>
          <Text style={styles.headerSubtitle}>
            Your plant image has been analyzed successfully.
          </Text>
        </View>

        {/* Scanned image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>
              ✓ Analysis complete
            </Text>
          </View>
        </View>

        {/* Main prediction */}
        <View style={styles.resultCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: isHealthy ? '#E8F5E9' : '#FFF3E0' },
              ]}
            >
              <Text style={styles.statusEmoji}>
                {isHealthy ? '🌿' : '🔬'}
              </Text>
            </View>

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>
                {isHealthy ? 'Healthy classification' : 'Detected condition'}
              </Text>
              <Text style={styles.diseaseName}>{predictedName}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>Model score</Text>
            <Text style={styles.confidenceValue}>
              {result.confidence.toFixed(2)}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.max(0, result.confidence))}%` },
              ]}
            />
          </View>

          <Text style={styles.confidenceNote}>
            This is the model's softmax score, not a calibrated measure of
            diagnostic certainty.
          </Text>
        </View>

        {/* Alternative predictions */}
        <View style={styles.predictionsSection}>
          <Text style={styles.sectionTitle}>Top 3 Predictions</Text>
          <Text style={styles.sectionSubtitle}>
            Other classes considered by the model
          </Text>

          {result.top_predictions.map((item, index) => (
            <View
              key={`${item.class_name}-${index}`}
              style={styles.predictionCard}
            >
              <View style={styles.rankCircle}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>

              <View style={styles.predictionDetails}>
                <Text style={styles.predictionName}>
                  {formatClassName(item.class_name)}
                </Text>

                <View style={styles.smallProgressBackground}>
                  <View
                    style={[
                      styles.smallProgressFill,
                      {
                        width: `${Math.min(100, Math.max(0, item.confidence))}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              <Text style={styles.predictionScore}>
                {item.confidence.toFixed(2)}%
              </Text>
            </View>
          ))}
        </View>

        {/* Model information */}
        <View style={styles.modelCard}>
          <Text style={styles.modelTitle}>AI Model Information</Text>
          <Text style={styles.modelText}>
            Model: {prediction.model}
          </Text>
          <Text style={styles.modelText}>
            Supported classes: 31
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>
            Important information
          </Text>
          <Text style={styles.disclaimerText}>
            This result is an AI-generated prediction. It should not be
            treated as a definitive agricultural diagnosis. Confirm
            suspected diseases before applying treatments.
          </Text>
        </View>

        {/* Scan again */}
        <Pressable
          style={styles.scanAgainButton}
          onPress={onScanAgain}
        >
          <Text style={styles.scanAgainText}>
            ↻  Scan Another Plant
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          PlantCare AI · Powered by EfficientNet-B0
        </Text>
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
    paddingBottom: 35,
  },
  header: {
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1B5E20',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#718071',
    marginTop: 7,
  },
  imageContainer: {
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(27,94,32,0.92)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5EAE3',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  statusEmoji: {
    fontSize: 23,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    color: '#718071',
    fontSize: 12,
  },
  diseaseName: {
    color: '#1C2B1D',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EDE6',
    marginVertical: 18,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  confidenceLabel: {
    color: '#718071',
    fontSize: 13,
    fontWeight: '600',
  },
  confidenceValue: {
    color: GREEN,
    fontSize: 19,
    fontWeight: '800',
  },
  progressBackground: {
    height: 9,
    backgroundColor: '#E8EDE6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GREEN,
    borderRadius: 10,
  },
  confidenceNote: {
    fontSize: 11,
    lineHeight: 17,
    color: '#879187',
    marginTop: 10,
  },
  predictionsSection: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1C2B1D',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#718071',
    marginTop: 5,
    marginBottom: 13,
  },
  predictionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EDE6',
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: GREEN,
    fontWeight: '800',
  },
  predictionDetails: {
    flex: 1,
    marginRight: 10,
  },
  predictionName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#263327',
    marginBottom: 8,
  },
  smallProgressBackground: {
    height: 5,
    backgroundColor: '#E8EDE6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  smallProgressFill: {
    height: '100%',
    backgroundColor: '#81C784',
    borderRadius: 5,
  },
  predictionScore: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '800',
  },
  modelCard: {
    backgroundColor: '#E8F5E9',
    padding: 17,
    borderRadius: 16,
    marginTop: 18,
  },
  modelTitle: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 8,
  },
  modelText: {
    color: '#476B49',
    fontSize: 12,
    marginTop: 4,
  },
  disclaimer: {
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 15,
    marginTop: 16,
  },
  disclaimerTitle: {
    fontWeight: '800',
    color: '#795B16',
    fontSize: 13,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#786A48',
  },
  scanAgainButton: {
    backgroundColor: GREEN,
    padding: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  footer: {
    textAlign: 'center',
    color: '#879187',
    fontSize: 11,
    marginTop: 22,
  },
});
