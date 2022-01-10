import { FeatureCollection } from 'geojson'

export type Node = {
  lngLat: mapboxgl.LngLat,
  id: number
}

export type Edge = [Node['id'], Node['id']]

export const nodesToGeoJson = (nodes: Node[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: nodes.map(node => ({
      type: 'Feature',
      id: node.id,
      geometry: {
        type: 'Point',
        coordinates: [node.lngLat.lng, node.lngLat.lat]
      },
      properties: {}
    }))
  }
}

export const edgesToGeoJson = (edges: Edge[], nodes: Node[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: edges.map(edge => {
      const p1 = nodes.find(n => n.id === edge[0])
      const p2 = nodes.find(n => n.id === edge[1])
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: (!p1 || !p2) ? [] : [
            [p1.lngLat.lng, p1.lngLat.lat],
            [p2.lngLat.lng, p2.lngLat.lat]
          ]
        },
        properties: {}
      }
    })
  }
}
