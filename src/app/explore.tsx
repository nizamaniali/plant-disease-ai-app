
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  getApiUrl,
  setApiUrl,
  testApiConnection,
} from '@/services/api';

// --------------------------------------------------
// DATA
// --------------------------------------------------

const crops = [
  'Apple',
  'Cherry',
  'Corn',
  'Grape',
  'Peach',
  'Bell Pepper',
  'Potato',
  'Tomato',
];

const features = [
  {
    icon: '📸',
    title: 'AI Plant Scanning',
    description:
      'Capture or upload a leaf image to identify potential plant diseases.',
  },
  {
    icon: '🧠',
    title: 'Deep Learning',
    description:
      'Uses a custom-trained EfficientNet-B0 model for image classification.',
  },
  {
    icon: '📊',
    title: 'Scan History',
    description:
      'View your previous scans, predictions, confidence scores, and images.',
  },
  {
    icon: '💡',
    title: 'AI Disease Insights',
    description:
      'Get additional information about detected diseases and possible care recommendations.',
  },
];

// --------------------------------------------------
// REUSABLE SECTION TITLE
// --------------------------------------------------

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// --------------------------------------------------
// ABOUT SCREEN
// --------------------------------------------------

export default function AboutScreen() {
  const [serverUrl, setServerUrl] = useState(getApiUrl());
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  // --------------------------------------------------
  // TEST SERVER CONNECTION
  // --------------------------------------------------

  const handleTestConnection = async () => {
    if (!serverUrl.trim()) {
      Alert.alert(
        'Missing Server Address',
        'Please enter your backend server address.'
      );
      return;
    }

    setTesting(true);
    setConnectionMessage('');

    try {
      const result = await testApiConnection(serverUrl);

      setConnectionSuccess(result.success);
      setConnectionMessage(result.message);
    } catch (error) {
      setConnectionSuccess(false);
      setConnectionMessage(
        'Unable to test the connection. Please try again.'
      );
    } finally {
      setTesting(false);
    }
  };

  // --------------------------------------------------
  // SAVE SERVER ADDRESS
  // --------------------------------------------------

  const handleSaveServer = async () => {
    if (!serverUrl.trim()) {
      Alert.alert(
        'Missing Server Address',
        'Please enter a server address before saving.'
      );
      return;
    }

    setSaving(true);

    try {
      await setApiUrl(serverUrl);

      setServerUrl(getApiUrl());

      Alert.alert(
        'Server Address Saved',
        'Your LeafSense AI server address has been updated successfully.'
      );
    } catch (error) {
      Alert.alert(
        'Invalid Server Address',
        error instanceof Error
          ? error.message
          : 'Please enter a valid server address.'
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // SCREEN UI
  // --------------------------------------------------

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5FAF5" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>🌿</Text>
        </View>

        <Text style={styles.appName}>LeafSense AI</Text>

        <Text style={styles.tagline}>
          Smarter Plant Care Through Artificial Intelligence
        </Text>

        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>
            AI POWERED PLANT DISEASE DETECTION
          </Text>
        </View>
      </View>

      {/* Introduction */}
      <View style={styles.card}>
        <SectionTitle title="About the Project" />

        <Text style={styles.bodyText}>
          LeafSense AI is an intelligent plant disease detection application
          designed to help users identify plant diseases through leaf images.
          By combining computer vision and deep learning, the application
          analyzes uploaded images and predicts the most likely disease.
        </Text>

        <Text style={styles.bodyText}>
          The goal is to make plant disease identification more accessible
          and help users make informed decisions about plant health.
        </Text>
      </View>

      {/* Statistics */}
      <SectionTitle title="Model at a Glance" />

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>31</Text>
          <Text style={styles.statLabel}>Disease Classes</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Supported Crops</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>99.01%</Text>
          <Text style={styles.statLabel}>Test Accuracy</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>B0</Text>
          <Text style={styles.statLabel}>EfficientNet Model</Text>
        </View>
      </View>

      {/* Supported Crops */}
      <View style={styles.card}>
        <SectionTitle title="Supported Crops" />

        <Text style={styles.bodyText}>
          The current model supports disease classification for these eight crops:
        </Text>

        <View style={styles.cropGrid}>
          {crops.map((crop) => (
            <View key={crop} style={styles.cropItem}>
              <Text style={styles.cropText}>{crop}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Features */}
      <SectionTitle title="Application Features" />

      {features.map((feature) => (
        <View key={feature.title} style={styles.featureCard}>
          <Text style={styles.featureIcon}>{feature.icon}</Text>

          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>

            <Text style={styles.featureDescription}>
              {feature.description}
            </Text>
          </View>
        </View>
      ))}

      {/* Technology Stack */}
      <View style={styles.card}>
        <SectionTitle title="Technology Stack" />

        <View style={styles.techRow}>
          <Text style={styles.techLabel}>Mobile Application</Text>
          <Text style={styles.techValue}>React Native, Expo</Text>
        </View>

        <View style={styles.techRow}>
          <Text style={styles.techLabel}>Backend</Text>
          <Text style={styles.techValue}>Python, FastAPI</Text>
        </View>

        <View style={styles.techRow}>
          <Text style={styles.techLabel}>AI Model</Text>
          <Text style={styles.techValue}>EfficientNet-B0</Text>
        </View>

        <View style={styles.techRow}>
          <Text style={styles.techLabel}>Database</Text>
          <Text style={styles.techValue}>Supabase</Text>
        </View>

        <View style={styles.techRow}>
          <Text style={styles.techLabel}>AI Explanations</Text>
          <Text style={styles.techValue}>Google Gemini</Text>
        </View>

        <View style={styles.techRow}>
          <Text style={styles.techLabel}>Dataset</Text>
          <Text style={styles.techValue}>PlantVillage</Text>
        </View>
      </View>

      {/* Server Settings */}
      <View style={styles.card}>
        <SectionTitle title="Server Settings" />

        <Text style={styles.bodyText}>
          Configure the address of the computer running the LeafSense AI backend.
          This is useful when connecting to your laptop through a different Wi-Fi
          network or mobile hotspot.
        </Text>

        <Text style={styles.inputLabel}>
          Backend Server URL
        </Text>

        <TextInput
          style={styles.serverInput}
          value={serverUrl}
          onChangeText={(text) => {
            setServerUrl(text);
            setConnectionMessage('');
          }}
          placeholder="http://192.168.1.100:8000"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          editable={!saving && !testing}
        />

        <Pressable
          style={[
            styles.serverButton,
            styles.testButton,
            testing && styles.disabledButton,
          ]}
          onPress={handleTestConnection}
          disabled={testing || saving}
        >
          <Text style={styles.testButtonText}>
            {testing ? 'Testing Connection...' : 'Test Connection'}
          </Text>
        </Pressable>

        {connectionMessage !== '' && (
          <Text
            style={[
              styles.connectionMessage,
              {
                color: connectionSuccess ? '#218044' : '#DC2626',
              },
            ]}
          >
            {connectionSuccess ? '✓ ' : '✕ '}
            {connectionMessage}
          </Text>
        )}

        <Pressable
          style={[
            styles.serverButton,
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSaveServer}
          disabled={saving || testing}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Server Address'}
          </Text>
        </Pressable>

        <Text style={styles.serverHint}>
          Make sure your phone and laptop are connected to the same Wi-Fi
          network or mobile hotspot, and that the backend server is running.
        </Text>
      </View>

      {/* Limitations */}
      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Important Note</Text>

        <Text style={styles.noticeText}>
          Predictions are based on the diseases included in the model's
          training dataset. The current model supports eight crops and does
          not cover every plant disease. Its performance in real-world
          field conditions may differ from its test accuracy.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>LeafSense AI 🌱</Text>

        <Text style={styles.footerText}>
          Growing a healthier future with AI.
        </Text>

        <Text style={styles.copyright}>
          Developed as an academic project
        </Text>
      </View>
    </ScrollView>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FAF5',
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  header: {
    alignItems: 'center',
    paddingVertical: 28,
  },

  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#E1F2E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  logoText: {
    fontSize: 38,
  },

  appName: {
    fontSize: 29,
    fontWeight: '800',
    color: '#1B5E20',
  },

  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 7,
    textAlign: 'center',
  },

  versionBadge: {
    backgroundColor: '#E4F3E6',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 17,
  },

  versionText: {
    color: '#23733A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E7EFE7',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B4332',
    marginBottom: 13,
  },

  bodyText: {
    fontSize: 13,
    lineHeight: 21,
    color: '#52635A',
    marginBottom: 9,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 22,
  },

  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E7EFE7',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#218044',
  },

  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },

  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 8,
  },

  cropItem: {
    backgroundColor: '#EAF5EB',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  cropText: {
    color: '#246B37',
    fontWeight: '600',
    fontSize: 12,
  },

  featureCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 15,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EFE7',
  },

  featureIcon: {
    fontSize: 27,
    marginRight: 14,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#234B32',
    marginBottom: 5,
  },

  featureDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2ED',
  },

  techLabel: {
    color: '#64748B',
    fontSize: 12,
  },

  techValue: {
    color: '#245D35',
    fontSize: 12,
    fontWeight: '700',
  },

  // Server Settings Styles

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#234B32',
    marginBottom: 8,
  },

  serverInput: {
    backgroundColor: '#F5FAF5',
    borderWidth: 1,
    borderColor: '#D5E5D7',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 13,
    color: '#1B4332',
    marginBottom: 12,
  },

  serverButton: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  testButton: {
    backgroundColor: '#E4F3E6',
  },

  testButtonText: {
    color: '#23733A',
    fontWeight: '700',
    fontSize: 13,
  },

  saveButton: {
    backgroundColor: '#218044',
    marginTop: 12,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  disabledButton: {
    opacity: 0.5,
  },

  connectionMessage: {
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },

  serverHint: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 12,
  },

  // Important Note

  noticeCard: {
    backgroundColor: '#FFF8E8',
    padding: 17,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F2E4BE',
    marginBottom: 22,
  },

  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#946515',
    marginBottom: 8,
  },

  noticeText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#806B42',
  },

  // Footer

  footer: {
    alignItems: 'center',
    paddingVertical: 15,
  },

  footerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1B5E20',
  },

  footerText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  copyright: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 12,
  },
});
