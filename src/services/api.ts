
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File } from 'expo-file-system';

// --------------------------------------------------
// SERVER CONFIGURATION
// --------------------------------------------------

const DEFAULT_API_URL = 'http://192.168.100.51:8000';
const API_STORAGE_KEY = '@leafsense_api_url';

let API_URL = DEFAULT_API_URL;
let initializationPromise: Promise<void> | null = null;

// Remove spaces and trailing slashes from the address.
function normalizeApiUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

// Load the previously saved server address.
export function initializeApiUrl(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        const savedUrl = await AsyncStorage.getItem(API_STORAGE_KEY);

        if (savedUrl) {
          API_URL = normalizeApiUrl(savedUrl);
        }
      } catch (error) {
        console.error('Could not load saved server address:', error);
      }
    })();
  }

  return initializationPromise;
}

// Get the currently active server address.
export function getApiUrl(): string {
  return API_URL;
}

// Save a new server address.
export async function setApiUrl(url: string): Promise<void> {
  const normalizedUrl = normalizeApiUrl(url);

  if (!/^https?:\/\/.+/i.test(normalizedUrl)) {
    throw new Error(
      'Please enter a valid server address starting with http:// or https://'
    );
  }

  await initializeApiUrl();

  await AsyncStorage.setItem(API_STORAGE_KEY, normalizedUrl);
  API_URL = normalizedUrl;
}

// Test whether a server is reachable through its health endpoint.
export async function testApiConnection(
  url?: string
): Promise<{ success: boolean; message: string }> {
  const testUrl = normalizeApiUrl(url || API_URL);
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 7000);

  try {
    if (!/^https?:\/\/.+/i.test(testUrl)) {
      return {
        success: false,
        message: 'Please enter a valid server address.',
      };
    }

    const response = await fetch(`${testUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Server responded with status ${response.status}.`,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to LeafSense AI server!',
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Connection timed out. Check the server address and make sure the backend is running.',
      };
    }

    return {
      success: false,
      message: 'Could not connect. Check the server address, network connection, and firewall settings.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export interface Prediction {
  class_name: string;
  confidence: number;
}

export interface PredictionResponse {
  success: boolean;
  filename: string;
  model: string;
  result: {
    predicted_class: string;
    confidence: number;
    top_predictions: Prediction[];
  };
}

export interface ScanHistoryItem {
  id: string;
  crop: string;
  predicted_disease: string;
  confidence: number;
  top_predictions: Prediction[];
  image_path: string;
  model_name: string;
  created_at: string;
}

export interface ScanHistoryResponse {
  success: boolean;
  total: number;
  scans: ScanHistoryItem[];
}

export interface DiseaseExplanationResponse {
  success: boolean;
  cached: boolean;
  crop: string;
  disease: string;
  explanation: string;
}

// --------------------------------------------------
// PLANT DISEASE PREDICTION
// --------------------------------------------------

export async function predictPlantDisease(
  imageUri: string
): Promise<PredictionResponse> {
  await initializeApiUrl();

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 20000);

  try {
    const imageFile = new File(imageUri);
    const formData = new FormData();

    formData.append('file', imageFile, 'plant_image.jpg');

    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Prediction failed (${response.status}): ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'The prediction request timed out. Please check your connection and try again.'
      );
    }

    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        error.message.toLowerCase().includes('network'))
    ) {
      throw new Error(
        'Unable to connect to the LeafSense AI server. Please make sure the server is running and try again.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// --------------------------------------------------
// FETCH SCAN HISTORY
// --------------------------------------------------

export async function getScanHistory(
  limit: number = 50
): Promise<ScanHistoryResponse> {
  await initializeApiUrl();

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(
      `${API_URL}/history?limit=${limit}`,
      {
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Could not fetch scan history (${response.status}): ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'Loading scan history timed out. Please check your connection and try again.'
      );
    }

    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        /network|fetch failed|connectexception|no route to host|host unreachable/i.test(
          error.message
        ))
    ) {
      throw new Error(
        'Unable to connect to LeafSense AI server. Please make sure the server is running.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// --------------------------------------------------
// GET PRIVATE SCAN IMAGE URL
// --------------------------------------------------

export function getScanImageUrl(scanId: string): string {
  return `${API_URL}/history/${scanId}/image`;
}

// --------------------------------------------------
// GEMINI DISEASE EXPLANATION
// --------------------------------------------------

export async function explainDisease(
  crop: string,
  disease: string
): Promise<DiseaseExplanationResponse> {
  await initializeApiUrl();

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(`${API_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crop,
        disease,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      let errorMessage = 'Unable to generate disease explanation.';

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // Keep the default error message.
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'The AI explanation is taking too long. Please try again.'
      );
    }

    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        /network|fetch failed|no route to host|connectexception|host unreachable/i.test(
          error.message
        ))
    ) {
      throw new Error(
        'Unable to connect to the AI service. Please check your internet connection and try again.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
