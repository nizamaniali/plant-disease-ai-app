
import { useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DiseaseExplanationResponse,
  explainDisease,
  PredictionResponse,
} from '@/services/api';

interface Props {
  imageUri: string;
  prediction: PredictionResponse;
  onScanAgain: () => void;
  actionLabel?: string;
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
  actionLabel = '↻  Scan Another Plant',
}: Props) {
  const result = prediction.result;

  const predictedName = formatClassName(result.predicted_class);

  const isHealthy = result.predicted_class
    .toLowerCase()
    .includes('healthy');

  const [explanation, setExplanation] =
    useState<DiseaseExplanationResponse | null>(null);

  const [explanationLoading, setExplanationLoading] =
    useState(false);

  const [explanationError, setExplanationError] = useState('');

  const handleGetExplanation = async () => {
    if (explanationLoading) return;

    try {
      setExplanationLoading(true);
      setExplanationError('');

      const classParts = result.predicted_class.split('___');

      const crop = classParts[0]
        .replace(/_/g, ' ')
        .trim();

      const disease = (classParts[1] || 'Unknown condition')
        .replace(/_/g, ' ')
        .trim();

      const response = await explainDisease(crop, disease);

      setExplanation(response);
    } catch (error) {
  const rawMessage =
    error instanceof Error ? error.message : '';

  const isConnectionError =
    /fetch failed|network request failed|no route to host|connectexception|failed to connect|host unreachable|networkerror|timed out/i.test(
      rawMessage.toLowerCase()
    );

  if (isConnectionError) {
    setExplanationError(
      'Unable to connect to Gemini AI. Please check your computer’s internet connection and try again.'
    );
  } else {
    setExplanationError(
      rawMessage ||
      'Unable to generate AI explanation. Please try again later.'
    );
  }
} finally {
  setExplanationLoading(false);
}
  };

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
                {
                  backgroundColor: isHealthy ? '#E8F5E9' : '#FFF3E0',
                },
              ]}
            >
              <Text style={styles.statusEmoji}>
                {isHealthy ? '🌿' : '🔬'}
              </Text>
            </View>

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusLabel}>
                {isHealthy
                  ? 'Healthy classification'
                  : 'Detected condition'}
              </Text>

              <Text style={styles.diseaseName}>
                {predictedName}
              </Text>
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
                {
                  width: `${Math.min(
                    100,
                    Math.max(0, result.confidence)
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.confidenceNote}>
            This is the model's softmax score, not a calibrated measure
            of diagnostic certainty.
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
                        width: `${Math.min(
                          100,
                          Math.max(0, item.confidence)
                        )}%`,
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

        {/* Gemini AI Disease Insights */}
        <View style={styles.geminiCard}>
          <View style={styles.geminiHeader}>
            <Text style={styles.geminiTitle}>
              ✨ AI Disease Insights
            </Text>

            <Text style={styles.geminiBadge}>
              Gemini AI
            </Text>
          </View>

          <Text style={styles.geminiSubtitle}>
            Understand the detected condition with AI-powered
            information about symptoms, causes, prevention and
            disease management.
          </Text>

          {!explanation && (
            <Pressable
              style={[
                styles.geminiButton,
                explanationLoading && styles.disabledButton,
              ]}
              onPress={handleGetExplanation}
              disabled={explanationLoading}
            >
              {explanationLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" />

                  <Text style={styles.geminiButtonText}>
                    Generating explanation...
                  </Text>
                </View>
              ) : (
                <Text style={styles.geminiButtonText}>
                  ✨ Get AI Explanation
                </Text>
              )}
            </Pressable>
          )}

          {/* Error and retry */}
          {explanationError !== '' && (
            <View style={styles.geminiError}>
              <Text style={styles.geminiErrorText}>
                {explanationError}
              </Text>

              <Pressable
                style={styles.geminiRetryButton}
                onPress={handleGetExplanation}
                disabled={explanationLoading}
              >
                <Text style={styles.geminiRetryText}>
                  Try Again
                </Text>
              </Pressable>
            </View>
          )}

          {/* Formatted Gemini explanation */}
          {explanation && (
            <View style={styles.explanationContainer}>
              <View style={styles.explanationStatus}>
                <Text style={styles.explanationStatusText}>
                  ✓ Explanation generated
                </Text>

                {explanation.cached && (
                  <Text style={styles.cachedText}>
                    Cached result
                  </Text>
                )}
              </View>

              <Markdown style={markdownStyles}>
                {explanation.explanation}
              </Markdown>

              <Pressable
                style={styles.geminiRetryButton}
                onPress={handleGetExplanation}
                disabled={explanationLoading}
              >
                {explanationLoading ? (
                  <ActivityIndicator color="#1B5E20" />
                ) : (
                  <Text style={styles.geminiRetryText}>
                    Generate Again
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* Model information */}
        <View style={styles.modelCard}>
          <Text style={styles.modelTitle}>
            AI Model Information
          </Text>

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
            This result is an AI-generated prediction. It should not
            be treated as a definitive agricultural diagnosis. Confirm
            suspected diseases before applying treatments. AI-generated
            recommendations should also be verified before use.
          </Text>
        </View>

        {/* Scan again / Back to history */}
        <Pressable
          style={styles.scanAgainButton}
          onPress={onScanAgain}
        >
          <Text style={styles.scanAgainText}>
            {actionLabel}
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          LeafSense AI · Powered by EfficientNet-B0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Markdown formatting
const markdownStyles = {
  body: {
    color: '#344638',
    fontSize: 13,
    lineHeight: 22,
  },
  paragraph: {
    marginTop: 5,
    marginBottom: 12,
    color: '#344638',
    fontSize: 13,
    lineHeight: 23,
  },
  heading1: {
    color: '#1B5E20',
    fontSize: 20,
    fontWeight: '800' as const,
    marginTop: 18,
    marginBottom: 10,
  },
  heading2: {
    color: '#23733A',
    fontSize: 17,
    fontWeight: '800' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    color: '#2E7D32',
    fontSize: 15,
    fontWeight: '800' as const,
    marginTop: 13,
    marginBottom: 7,
  },
  strong: {
    color: '#1B5E20',
    fontWeight: '800' as const,
  },
  em: {
    fontStyle: 'italic' as const,
    color: '#52635A',
  },
  bullet_list: {
    marginBottom: 10,
  },
  ordered_list: {
    marginBottom: 10,
  },
  list_item: {
    marginBottom: 6,
  },
  bullet_list_icon: {
    color: '#23834D',
    marginRight: 8,
  },
  ordered_list_icon: {
    color: '#23834D',
    fontWeight: '700' as const,
    marginRight: 8,
  },
  hr: {
    backgroundColor: '#E0E9E0',
    height: 1,
    marginTop: 12,
    marginBottom: 15,
  },
  blockquote: {
    backgroundColor: '#F0F7F0',
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
  },
  code_inline: {
    backgroundColor: '#EAF3EA',
    color: '#1B5E20',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    backgroundColor: '#F0F5F0',
    color: '#344638',
    padding: 12,
    borderRadius: 10,
  },
  fence: {
    backgroundColor: '#F0F5F0',
    color: '#344638',
    padding: 12,
    borderRadius: 10,
  },
};

// Main screen styles
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
  geminiCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  geminiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  geminiTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1B5E20',
  },
  geminiBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#23733A',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  geminiSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: '#718071',
    marginTop: 12,
    marginBottom: 15,
  },
  geminiButton: {
    backgroundColor: '#23834D',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  geminiButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  geminiError: {
    backgroundColor: '#FFF3F0',
    padding: 12,
    borderRadius: 10,
  },
  geminiErrorText: {
    color: '#C62828',
    fontSize: 12,
    lineHeight: 18,
  },
  geminiRetryButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
  },
  geminiRetryText: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 12,
  },
  explanationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E8EDE6',
    paddingTop: 14,
  },
  explanationStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  explanationStatusText: {
    color: '#23834D',
    fontWeight: '800',
    fontSize: 12,
  },
  cachedText: {
    color: '#718071',
    fontSize: 10,
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
