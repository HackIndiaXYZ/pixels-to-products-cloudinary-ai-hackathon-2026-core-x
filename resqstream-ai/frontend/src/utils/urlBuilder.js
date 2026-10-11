function compact(values) {
  return values.filter(Boolean);
}

export function serializeTransformations(transformations = []) {
  if (!Array.isArray(transformations)) {
    throw new Error('transformations must be an array');
  }

  return transformations
    .filter(Boolean)
    .map((step) => {
      if (typeof step === 'string') {
        return step;
      }

      return Object.entries(step)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}_${value}`)
        .join(',');
    })
    .filter(Boolean)
    .join('/');
}

export function buildCloudinaryUrl({
  cloudName,
  publicId,
  resourceType = 'video',
  deliveryType = 'upload',
  transformations = [],
  format
}) {
  if (!cloudName || !publicId) {
    throw new Error('cloudName and publicId are required');
  }

  const transformationPath = serializeTransformations(transformations);

  return compact([
    `https://res.cloudinary.com/${cloudName}`,
    resourceType,
    deliveryType,
    transformationPath,
    format ? `${publicId}.${format}` : publicId
  ]).join('/');
}

export function buildHlsUrl({ cloudName, publicId, transformations = [] }) {
  const hlsTransforms = [...transformations, 'sp_auto', 'f_m3u8'];

  return buildCloudinaryUrl({
    cloudName,
    publicId,
    resourceType: 'video',
    transformations: hlsTransforms
  });
}
