import React, { useState } from 'react';

const DEFAULT_RESOURCE_TYPE = 'video';

async function requestSignedUpload({ apiBaseUrl, payload }) {
  const response = await fetch(`${apiBaseUrl}/sign-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Failed to get upload signature (${response.status})`);
  }

  return response.json();
}

export default function UploadWidget({ apiBaseUrl = process.env.REACT_APP_API_BASE_URL, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setStatus('signing');
    setError('');

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `resqstream-ai/${timestamp}-${file.name.replace(/\.[^.]+$/, '')}`;

      const signatureResponse = await requestSignedUpload({
        apiBaseUrl,
        payload: {
          timestamp,
          folder: 'resqstream-ai/uploads',
          public_id: publicId,
          resource_type: DEFAULT_RESOURCE_TYPE
        }
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureResponse.apiKey);
      formData.append('timestamp', String(signatureResponse.paramsToSign.timestamp));
      formData.append('signature', signatureResponse.signature);
      formData.append('signature_algorithm', signatureResponse.signatureAlgorithm || 'sha256');

      Object.entries(signatureResponse.paramsToSign).forEach(([key, value]) => {
        formData.append(key, value);
      });

      setStatus('uploading');
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureResponse.cloudName}/${DEFAULT_RESOURCE_TYPE}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Cloudinary upload failed (${uploadResponse.status})`);
      }

      const uploaded = await uploadResponse.json();
      setStatus('complete');

      if (typeof onUploadComplete === 'function') {
        onUploadComplete({
          assetId: uploaded.asset_id,
          publicId: uploaded.public_id,
          format: uploaded.format,
          width: uploaded.width,
          height: uploaded.height,
          secureUrl: uploaded.secure_url,
          resourceType: uploaded.resource_type,
          createdAt: uploaded.created_at
        });
      }
    } catch (uploadError) {
      setStatus('error');
      setError(uploadError.message || 'Upload failed');
    }
  };

  return (
    <section className="upload-widget">
      <h2>ResQStream Signed Upload</h2>
      <input
        type="file"
        aria-label="Media file"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <button type="button" disabled={!file || status === 'uploading' || status === 'signing'} onClick={handleUpload}>
        {status === 'uploading' ? 'Uploading…' : status === 'signing' ? 'Signing…' : 'Upload to Cloudinary'}
      </button>
      {error && (
        <p role="alert" style={{ color: '#d11a2a' }}>
          {error}
        </p>
      )}
    </section>
  );
}
