import React from 'react';

function formatLocation(asset) {
  const lat = asset?.location?.lat;
  const lng = asset?.location?.lng;

  if (typeof lat === 'number' && typeof lng === 'number') {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  return 'Unknown location';
}

export default function GalleryGrid({ assets = [], onSelect }) {
  if (!assets.length) {
    return <p>No tactical media yet.</p>;
  }

  return (
    <div className="gallery-grid" role="grid" aria-label="Tactical media grid">
      {assets.map((asset) => (
        <button
          key={asset.assetId || asset.publicId}
          type="button"
          className="gallery-card"
          role="gridcell"
          onClick={() => onSelect?.(asset)}
        >
          <img src={asset.thumbnailUrl || asset.secureUrl} alt={asset.publicId || 'Uploaded asset'} loading="lazy" />
          <div>
            <strong>{asset.sensorType || 'Unknown Sensor'}</strong>
            <p>{formatLocation(asset)}</p>
            <small>{asset.createdAt ? new Date(asset.createdAt).toLocaleString() : 'Pending processing'}</small>
          </div>
        </button>
      ))}
    </div>
  );
}
