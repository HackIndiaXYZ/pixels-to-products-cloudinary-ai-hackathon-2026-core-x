import React from 'react';

const defaultState = {
  lowLight: true,
  denoise: true,
  sharpen: true,
  telemetryLabel: '',
  thermalOverlayPublicId: ''
};

export default function TransformBar({ value = defaultState, onChange }) {
  const state = { ...defaultState, ...value };

  const update = (patch) => {
    if (typeof onChange === 'function') {
      onChange({ ...state, ...patch });
    }
  };

  return (
    <div className="transform-bar" role="toolbar" aria-label="Transformation controls">
      <label>
        <input
          type="checkbox"
          checked={state.lowLight}
          onChange={(event) => update({ lowLight: event.target.checked })}
        />
        Low-light boost
      </label>
      <label>
        <input
          type="checkbox"
          checked={state.denoise}
          onChange={(event) => update({ denoise: event.target.checked })}
        />
        Denoise
      </label>
      <label>
        <input
          type="checkbox"
          checked={state.sharpen}
          onChange={(event) => update({ sharpen: event.target.checked })}
        />
        Sharpen
      </label>
      <label>
        Telemetry
        <input
          type="text"
          value={state.telemetryLabel}
          onChange={(event) => update({ telemetryLabel: event.target.value })}
          placeholder="GPS:19.0760,72.8777"
        />
      </label>
      <label>
        Thermal Overlay Public ID
        <input
          type="text"
          value={state.thermalOverlayPublicId}
          onChange={(event) => update({ thermalOverlayPublicId: event.target.value })}
          placeholder="resqstream/thermal/layer"
        />
      </label>
    </div>
  );
}
