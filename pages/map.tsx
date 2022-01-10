import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useReducer, useState } from 'react'
import mapboxgl, { MapboxOptions, GeoJSONSource } from 'mapbox-gl'
import { FeatureCollection } from 'geojson'
import { reducer, EditorState } from '../lib/reducer'
import { Node, Edge } from '../lib/map'
import styles from '../styles/Map.module.css'

const options: MapboxOptions = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  container: 'mapbox',
  style: 'mapbox://styles/mapbox/light-v10',
  localIdeographFontFamily: 'sans-serif',
  center: [139.7, 35.7],
  zoom: 12
}

const initialState: EditorState = {
  currentNodeIdx: 0,
  nodes: [],
  edges: []
}

const nodesToGeoJson = (nodes: Node[]): FeatureCollection => {
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

const Map: NextPage = () => {
  // States
  const [state, dispatch] = useReducer(reducer, initialState)

  // Create map instance on initial render
  useEffect(() => {
    dispatch({ type: 'initMap', payload: options })
  }, [])

  // Add source and event listener to the map
  useEffect(() => {
    if (!state.map) return
    const map = state.map
    map.on('style.load', () => {
      map.on('click', e => {
        dispatch({ type: 'addNode', payload: e.lngLat })
      })
      map.addSource('nodes', {
        type: 'geojson',
        data: nodesToGeoJson(state.nodes)
      })
      map.on('click', 'nodes', e => {
        console.log('TODO: click feature', e.features)
      })
      map.on('mousemove', 'nodes', e => {
        const hoverId = e.features?.[0].id
        if (hoverId !== undefined) {
          dispatch({ type: 'hover', payload: hoverId as number })
        }
      })
      map.on('mouseleave', 'nodes', () => {
        dispatch({ type: 'mouseleave' })
      })
    })
  }, [state.map])

  // Update layer according to the nodes
  useEffect(() => {
    const map = state.map
    const nodesSource = map?.getSource('nodes') as GeoJSONSource
    if (!map || !nodesSource) return
    nodesSource.setData(nodesToGeoJson(state.nodes))

    if (map.getLayer('nodes')) map.removeLayer('nodes')
    const nodesLayer: mapboxgl.CircleLayer = {
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
    map.addLayer(nodesLayer)
  }, [state.nodes])

  return (
    <>
      <Head>
        <title>Network editor</title>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
      </Head>
      <div id="mapbox" className={styles.mapbox}></div>
    </>
  )
}

export default Map
