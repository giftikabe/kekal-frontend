// Media upload helper.
// Backend contract (B6 — Media Module): POST /api/media/sign returns a
// Cloudinary signed-upload payload; the browser uploads directly to
// Cloudinary and only the resulting secure_url is ever sent back to our API.

import { apiClient } from './client';

interface SignedUploadPayload {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder?: string;
}

export async function getSignedUpload(): Promise<SignedUploadPayload> {
  return apiClient.post<SignedUploadPayload>('/api/media/sign');
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const sig = await getSignedUpload();

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  if (sig.folder) form.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error('Image upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}
