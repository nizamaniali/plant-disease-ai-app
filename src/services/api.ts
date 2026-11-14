
import { File } from 'expo-file-system';

const API_URL = 'http://192.168.100.51:8000';

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


// --------------------------------------------------
// PLANT DISEASE PREDICTION
// --------------------------------------------------

export async function predictPlantDisease(
  imageUri: string
): Promise<PredictionResponse> {

  const imageFile = new File(imageUri);

  const formData = new FormData();

  formData.append('file', imageFile, 'plant_image.jpg');

  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Prediction failed (${response.status}): ${errorText}`
    );
  }

  return await response.json();
}


// --------------------------------------------------
// FETCH SCAN HISTORY
// --------------------------------------------------

export async function getScanHistory(
  limit: number = 50
): Promise<ScanHistoryResponse> {

  const response = await fetch(
    `${API_URL}/history?limit=${limit}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Could not fetch scan history (${response.status}): ${errorText}`
    );
  }

  return await response.json();
}


// --------------------------------------------------
// GET PRIVATE SCAN IMAGE URL
// --------------------------------------------------

export function getScanImageUrl(scanId: string): string {
  return `${API_URL}/history/${scanId}/image`;
}
