import React from 'react';
import { buildHlsUrl } from '../utils/urlBuilder';
import { buildTransformPipeline } from '../utils/transformPipeline';

export default function VideoPlayer({ cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME, asset, transformState }) {
  if (!asset?.publicId) {
    return <p>Select an asset to start playback.</p>;
  }

  const transformations = buildTransformPipeline(transformState);
  const src = buildHlsUrl({ cloudName, publicId: asset.publicId, transformations });

  return (
    <div className="video-player">
      <video controls preload="metadata" style={{ width: '100%', maxHeight: 520 }}>
        <source src={src} type="application/x-mpegURL" />
        <source src={asset.secureUrl} type="video/mp4" />
        Your browser does not support video playback.
      </video>
      <p>
        Stream source: <code>{src}</code>
      </p>
    </div>
  );
}
