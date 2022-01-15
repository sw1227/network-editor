import { FeatureCollection, Feature } from 'geojson'
import mapboxgl from 'mapbox-gl'

export type Node = {
  lngLat: mapboxgl.LngLat,
  id: number
}

export type Edge = {
  source: Node['id'],
  target: Node['id'],
  id: number,
}

export type LngLatEdge = [mapboxgl.LngLat, mapboxgl.LngLat]

export interface NodeLinkJson {
  nodes: {
      id: number;
      lng: number;
      lat: number;
  }[];
  links: {
      id?: number;
      source: number;
      target: number;
  }[];
}

export const isNodeLinkJson = (object: any): object is NodeLinkJson => {
  const hasNodes = object.nodes?.every((node: any) => (
    'id' in node && 'lng' in node && 'lat' in node
  ))
  const hasLinks = object.links?.every((link: any) => (
    'source' in link && 'target' in link
  ))
  return hasNodes && hasLinks
}

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
    features: edges.map(edge => edgeToGeoJson(edge, nodes))
  }
}

export const edgeToGeoJson = (edge: Edge, nodes: Node[]): Feature => {
  const p1 = nodes.find(n => n.id === edge.source)
  const p2 = nodes.find(n => n.id === edge.target)
  return {
    type: 'Feature',
    id: edge.id,
    geometry: {
      type: 'LineString',
      coordinates: (!p1 || !p2) ? [] : [
        [p1.lngLat.lng, p1.lngLat.lat],
        [p2.lngLat.lng, p2.lngLat.lat]
      ]
    },
    properties: {}
  }
}

export const lngLatEdgeToGeoJson = (lngLatEdge?: LngLatEdge): Feature => {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: !lngLatEdge ? [] : [
        [lngLatEdge[0].lng, lngLatEdge[0].lat],
        [lngLatEdge[1].lng, lngLatEdge[1].lat],
      ]
    },
    properties: {}
  }
}
