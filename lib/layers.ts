import mapboxgl from 'mapbox-gl'

export const editingEdgeLayer: mapboxgl.LineLayer = {
  id: 'editingEdge',
  type: 'line',
  source: 'editingEdge',
  layout: {},
  paint: {
    'line-color': '#f08',
    'line-opacity': 0.4,
    'line-width': 3,
    'line-dasharray': [1, 1]
  }
}
