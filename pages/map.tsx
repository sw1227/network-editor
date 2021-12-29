import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import mapboxgl, { MapboxOptions, GeoJSONSource } from 'mapbox-gl'
import { FeatureCollection } from 'geojson'
import styles from '../styles/Map.module.css'

const options: MapboxOptions = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  container: 'mapbox',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [139.7, 35.7],
  zoom: 12
}

const nodesToGeoJson = (nodes: mapboxgl.LngLat[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: nodes.map(node => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [node.lng, node.lat]
      },
      properties: []
    }))
  }
}

const Map: NextPage = () => {
  // States
  const [nodes, setNodes] = useState<mapboxgl.LngLat[]>([])
  const [map, setMap] = useState<mapboxgl.Map>()

  // Create map instance on initial render
  useEffect(() => {
    const map = new mapboxgl.Map(options)
    setMap(map)
  }, [])

  // Add source and event listener to the map
  useEffect(() => {
    if (!map) return
    map.on('style.load', () => {
      map.on('click', e => {
        setNodes(prev => [...prev, e.lngLat])
      })
      map.addSource('nodes', {
        type: 'geojson',
        data: nodesToGeoJson(nodes)
      })
    })
  }, [map])

  // Update layer according to the nodes
  useEffect(() => {
    const nodesSource = map?.getSource('nodes') as GeoJSONSource
    if (!map || !nodesSource) return
    nodesSource.setData(nodesToGeoJson(nodes))

    if (map.getLayer('nodes')) map.removeLayer('nodes')
    const nodesLayer: mapboxgl.CircleLayer = {
      id: 'nodes',
      type: 'circle',
      source: 'nodes',
      layout: {},
      paint: {
        'circle-radius': 6,
        'circle-color': '#f08',
        'circle-opacity': 0.4
      }
    }
    map.addLayer(nodesLayer)
}, [nodes])

  return (
    <div id="mapbox" className={styles.mapbox}></div>
  )
}

export default Map
