import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useReducer } from 'react'
import { MapboxOptions, GeoJSONSource, LngLat } from 'mapbox-gl'
import { reducer, EditorState } from '../lib/reducer'
import { nodesToGeoJson, edgesToGeoJson, lngLatEdgeToGeoJson } from '../lib/map'
import { editingEdgeLayer, nodesLayer, edgesLayer } from '../lib/layers'
import { XYToLngLat } from '../lib/geo'
import { PlaneRectangularConverter } from '../lib/converter'
import styles from '../styles/Map.module.css'

const options: MapboxOptions = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  container: 'mapbox',
  style: 'mapbox://styles/mapbox/light-v10',
  localIdeographFontFamily: 'sans-serif',
  center: [139.744, 35.72],
  zoom: 16
}

const initialState: EditorState = {
  currentNodeIdx: 0,
  nodes: [],
  edges: []
}

const rotate = (theta: number, center: [number, number]) => (coord: [number, number]): [number, number] => {
  const rad = theta * Math.PI / 180
  const [x, y] = coord
  const [x0, y0] = center
  return [
    x0 + Math.cos(rad) * (x - x0) - Math.sin(rad) * (y - y0),
    y0 + Math.sin(rad) * (x - x0) + Math.cos(rad) * (y - y0)
  ]
}

// const bgCenter = { lat: 35.7201, lng: 139.7442 }
const bgCenter = { lat: 35.71968, lng: 139.74515 }
const imgWidth = 898
const imgHeight = 470
const lngWidth = 0.012
const latHeight = lngWidth * imgHeight / imgWidth
const rot = rotate(37, [bgCenter.lng, bgCenter.lat])
// const rectCoordinates = [
//   rot([bgCenter.lng - lngWidth / 2, bgCenter.lat + latHeight / 2]),
//   rot([bgCenter.lng + lngWidth / 2, bgCenter.lat + latHeight / 2]),
//   rot([bgCenter.lng + lngWidth / 2, bgCenter.lat - latHeight / 2]),
//   rot([bgCenter.lng - lngWidth / 2, bgCenter.lat - latHeight / 2]),
// ]
// const rectCoordinates = [
//   [bgCenter.lng - lngWidth / 2, bgCenter.lat + latHeight / 2],
//   [bgCenter.lng + lngWidth / 2, bgCenter.lat + latHeight / 2],
//   [bgCenter.lng + lngWidth / 2, bgCenter.lat - latHeight / 2],
//   [bgCenter.lng - lngWidth / 2, bgCenter.lat - latHeight / 2],
// ]

// const show = (deg: number) => {
//   const d = Math.floor(deg)
//   const m = Math.floor((deg % 1) * 60)
//   const s = (((deg % 1) * 60) % 1) * 60
//   return `${d}°${m}'${s}`
// }
// console.log('ll', ll, show(ll.lng), show(ll.lat))

// TODO: 50mの正方形が横16, 縦7個ある
// 頂点はcenterから横に50*8=400m, 縦に50*3.5=175m ずらす
const prc = new PlaneRectangularConverter({ lng: 139+50/60, lat: 36 }) // Tokyo
const { x: cx, y: cy } = prc.lngLatToXY(bgCenter)
console.log('bg center xy', cx, cy)
// 座標系のＸ軸は、座標系原点において子午線に一致する軸とし、真北に向う値を正とし、座標系のＹ軸は、座標系原点において座標系のＸ軸に直交する軸とし、真東に向う値を正とする
// https://www.gsi.go.jp/LAW/heimencho.html#9
// const nw = prc.XYToLngLat({ x: cx + 175, y: cy - 400 })
// const ne = prc.XYToLngLat({ x: cx + 175, y: cy + 400 })
// const se = prc.XYToLngLat({ x: cx - 175, y: cy + 400 })
// const sw = prc.XYToLngLat({ x: cx - 175, y: cy - 400 })
// TODO: なんか歪んでる。cxから上下左右に等間隔にしてから回転ではなく、cxから斜めにやってからlnglatに戻したら？？ FIXME:

const width = 800 - 5 // [m]
const height = 350 - 5 // [m]

const nwOffset = rot([+ height / 2, - width / 2])
const neOffset = rot([+ height / 2, + width / 2])
const seOffset = rot([- height / 2, + width / 2])
const swOffset = rot([- height / 2, - width / 2])
const nw = prc.XYToLngLat({ x: cx + nwOffset[0], y: cy + nwOffset[1] })
const ne = prc.XYToLngLat({ x: cx + neOffset[0], y: cy + neOffset[1] })
const se = prc.XYToLngLat({ x: cx + seOffset[0], y: cy + seOffset[1] })
const sw = prc.XYToLngLat({ x: cx + swOffset[0], y: cy + swOffset[1] })

// const nw = prc.XYToLngLat({x: cx - 400, y: cy + 175})
// const ne = prc.XYToLngLat({x: cx + 400, y: cy + 175})
// const se = prc.XYToLngLat({x: cx + 400, y: cy - 175})
// const sw = prc.XYToLngLat({x: cx - 400, y: cy - 175})
const rectCoordinates = [
  [nw.lng, nw.lat],
  [ne.lng, ne.lat],
  [se.lng, se.lat],
  [sw.lng, sw.lat],
]


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
      // Sources and layers
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
      map.addSource('bg', {
        type: 'image',
        url: '/bgmap2.png',
        coordinates: rectCoordinates
      })
      map.addLayer(nodesLayer)
      map.addLayer(edgesLayer)
      map.addLayer(editingEdgeLayer)
      map.addLayer({
        id: 'bg',
        'type': 'raster',
        'source': 'bg',
        'paint': {
          'raster-fade-duration': 0,
          'raster-opacity': 0.4
        }
      });

      // Event listeners
      map.on('click', 'nodes', e => {
        const clickedId = e.features?.[0].id
        if (clickedId !== undefined) {
          dispatch({ type: 'clickNode', payload: clickedId as number })
        }
        e.originalEvent.preventDefault()
      })
      map.on('click', e => {
        if (!e.originalEvent.defaultPrevented) {
          dispatch({ type: 'clickMap', payload: e.lngLat })
        }
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
      map.on('mousemove', e => {
        dispatch({ type: 'mousemove', payload: e.lngLat })
      })
    })
  }, [state.map])

  // Update nodes layer according to the nodes state
  useEffect(() => {
    const nodesSource = state.map?.getSource('nodes') as GeoJSONSource | undefined
    if (nodesSource) nodesSource.setData(nodesToGeoJson(state.nodes))
  }, [state.nodes])

  // Update edges layer according to the edges state
  useEffect(() => {
    const edgeSource = state.map?.getSource('edges') as GeoJSONSource | undefined
    if (edgeSource) edgeSource.setData(edgesToGeoJson(state.edges, state.nodes))
  }, [state.edges])

  // Update editingEdge layer according to the editingEdge state
  useEffect(() => {
    const editingEdgeSource = state.map?.getSource('editingEdge') as GeoJSONSource | undefined
    if (!state.map || !editingEdgeSource) return
    if (state.editingEdge) {
      editingEdgeSource.setData(lngLatEdgeToGeoJson(state.editingEdge))
      state.map.setLayoutProperty('editingEdge', 'visibility', 'visible')
    } else {
      state.map.setLayoutProperty('editingEdge', 'visibility', 'none')
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
