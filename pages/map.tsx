import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useReducer } from 'react'
import mapboxgl, { MapboxOptions, GeoJSONSource } from 'mapbox-gl'
import { reducer, EditorState } from '../lib/reducer'
import { nodesToGeoJson, edgesToGeoJson, lngLatEdgeToGeoJson } from '../lib/map'
import { editingEdgeLayer } from '../lib/layers'
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
      map.on('click', 'nodes', e => {
        const clickedId = e.features?.[0].id
        if (clickedId !== undefined) {
          dispatch({ type: 'clickNode', payload: clickedId as number })
        }
        e.originalEvent.preventDefault()
      })
      map.on('click', e => {
        if (!e.originalEvent.defaultPrevented) {
          // TODO: editingでfeature以外をclickしたらnode, edge両方作成
          dispatch({ type: 'addNode', payload: e.lngLat })
        }
      })
      map.addSource('nodes', {
        type: 'geojson',
        data: nodesToGeoJson(state.nodes)
      })
      map.addSource('edges', {
        type: 'geojson',
        data: edgesToGeoJson(state.edges, state.nodes)
      })
      map.addSource('editingEdge', {
        type: 'geojson',
        data: lngLatEdgeToGeoJson() // empty
      })
      map.addLayer(editingEdgeLayer)
      map.on('mousemove', 'nodes', e => {
        const hoverId = e.features?.[0].id
        if (hoverId !== undefined) {
          dispatch({ type: 'hover', payload: hoverId as number })
        }
      })
      map.on('mouseleave', 'nodes', () => {
        dispatch({ type: 'mouseleave' })
      })
      map.on('mousemove', e => {
        dispatch({ type: 'mousemove', payload: e.lngLat })
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

  // Update layer according to the edges
  useEffect(() => {
    const map = state.map
    const edgeSource = map?.getSource('edges') as GeoJSONSource
    if (!map || !edgeSource) return
    edgeSource.setData(edgesToGeoJson(state.edges, state.nodes))

    if (map.getLayer('edges')) map.removeLayer('edges')
    const edgesLayer: mapboxgl.LineLayer = {
      id: 'edges',
      type: 'line',
      source: 'edges',
      layout: {},
      paint: {
        'line-color': '#f08',
        'line-opacity': 0.4,
        'line-width': 3,
      }
    }
    map.addLayer(edgesLayer)
  }, [state.edges])

  useEffect(() => {
    const map = state.map
    const editingEdgeSource = map?.getSource('editingEdge') as GeoJSONSource
    if (!map || !editingEdgeSource) return
    if (state.editingEdge) {
      editingEdgeSource.setData(lngLatEdgeToGeoJson(state.editingEdge))
      map.setLayoutProperty('editingEdge', 'visibility', 'visible')
    } else {
      map.setLayoutProperty('editingEdge', 'visibility', 'none')
    }
  }, [state.editingEdge])

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