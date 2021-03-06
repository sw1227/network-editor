import mapboxgl from 'mapbox-gl'

export const nodesLayer: mapboxgl.CircleLayer = {
  id: 'nodes',
  type: 'circle',
  source: 'nodes',
  layout: {},
  paint: {
    'circle-radius': 6,
    'circle-color': '#f08',
    'circle-opacity': 0.4,
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      2,
      0
    ],
    'circle-stroke-color': '#f00',
  }
}

export const edgesLayer: mapboxgl.LineLayer = {
  id: 'edges',
  type: 'line',
  source: 'edges',
  layout: {},
  paint: {
    'line-color': '#f08',
    'line-opacity': 0.4,
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      6,
      3
    ],
  }
}

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

export const rasterImageLayer: (opacity: number) => mapboxgl.RasterLayer = opacity => ({
  id: 'raster-image',
  type: 'raster',
  source: 'raster-image',
  paint: {
    'raster-fade-duration': 0,
    'raster-opacity': opacity,
  }
})
