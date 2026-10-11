export const defaultTransformState = {
  lowLight: true,
  denoise: true,
  sharpen: true,
  quality: 'auto:eco',
  format: 'auto',
  width: 720,
  telemetryLabel: '',
  thermalOverlayPublicId: ''
};

export function buildTransformPipeline(state = {}) {
  const settings = { ...defaultTransformState, ...state };
  const pipeline = [];

  if (settings.lowLight) {
    pipeline.push('e_gamma:50', 'e_improve');
  }

  if (settings.sharpen) {
    pipeline.push('e_sharpen:100');
  }

  if (settings.denoise) {
    pipeline.push('e_denoise');
  }

  pipeline.push(`q_${settings.quality}`, `f_${settings.format}`, `w_${settings.width}`);

  if (settings.thermalOverlayPublicId) {
    pipeline.push(`l_image:${settings.thermalOverlayPublicId}`, 'o_60', 'e_screen', 'fl_layer_apply');
  }

  if (settings.telemetryLabel) {
    const encoded = encodeURIComponent(settings.telemetryLabel).replace(/%20/g, '+');
    pipeline.push(`l_text:Arial_18_bold:${encoded}`, 'co_rgb:ff3131', 'g_north_west', 'x_20', 'y_20', 'fl_layer_apply');
  }

  return pipeline;
}
