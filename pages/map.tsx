import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useReducer, useState } from 'react'
import mapboxgl, { MapboxOptions, GeoJSONSource } from 'mapbox-gl'
import styled from 'styled-components'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import Tooltip from '@mui/material/Tooltip'
import CropFreeIcon from '@mui/icons-material/CropFree'
import RefreshIcon from '@mui/icons-material/Refresh'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { reducer, initialState } from '../lib/reducer'
import { nodesToGeoJson, edgesToGeoJson, lngLatEdgeToGeoJson } from '../lib/map'
import { editingEdgeLayer, nodesLayer, edgesLayer, rasterImageLayer } from '../lib/layers'
import { ORIGINS, PlaneRectangularConverter, rotate } from '../lib/converter'
import NodeTable from '../components/nodetable'
import EdgeTable from '../components/edgetable'
import ImportModal from '../components/modals/importmodal'
import ExportModal from '../components/modals/exportmodal'
import AddImageModal from '../components/modals/imagemodal'
import ResetModal from '../components/modals/resetmodal'
import BaseMapSelector, { MAP_STYLE } from '../components/basemap'
import OverlaySetting from '../components/overlay'
import styles from '../styles/Map.module.css'

const initOptions: MapboxOptions = {
  // token: only for public usage (URL restricted)
  accessToken: "pk.eyJ1Ijoic3cxMjI3IiwiYSI6ImNrbngyazRhcjBtY3Iyd3RnODhjbDhscWsifQ.6Uc-Lboqa0WhZbnnFJWFSA",
  container: 'mapbox',
  localIdeographFontFamily: 'sans-serif',
  center: new mapboxgl.LngLat(139.744, 35.72),
  zoom: 16,
} as const

const Map: NextPage = () => {
  // States
  const [state, dispatch] = useReducer(reducer, initialState)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [addImageModalOpen, setAddImageModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLE>('Default_ja')

  // Create map instance on initial render
  useEffect(() => {
    dispatch({ type: 'initMap', payload: {...initOptions, style: MAP_STYLE[mapStyle]} })
  }, [mapStyle])

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
      map.addLayer(nodesLayer)
      map.addLayer(edgesLayer)
      map.addLayer(editingEdgeLayer)
      addRasterImageLayer()

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
      map.on('mousemove', 'edges', e => {
        const hoverEdgeId = e.features?.[0].id
        if (hoverEdgeId !== undefined) {
          dispatch({ type: 'hoverEdge', payload: hoverEdgeId as number })
        }
      })
      map.on('mouseleave', 'edges', () => {
        dispatch({ type: 'mouseleaveEdge' })
      })
      map.on('mousemove', e => {
        dispatch({ type: 'mousemove', payload: e.lngLat })
      })
      map.getCanvas().addEventListener('keydown', e => {
        e.preventDefault();
        if (e.key === 'Escape') {
          dispatch({ type: 'escape' })
        }
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

  // Add raster image layer according to the imageUrl state
  useEffect(() => {
    addRasterImageLayer()
  }, [state.imageUrl, state.imageShapeMeter, state.imageRotationDeg, state.imageCenterLngLat])

  const addRasterImageLayer = () => {
    if (state.map?.getLayer('raster-image')) {
      state.map.removeLayer('raster-image')
    }
    if (state.map?.getSource('raster-image')) {
      state.map.removeSource('raster-image')
    }
    if (!state.map || !state.imageUrl || !state.imageShape || !state.imageShapeMeter || !state.imageCenterLngLat) return

    const prc = new PlaneRectangularConverter(ORIGINS.IX) // TODO: Tokyo
    const { x: cx, y: cy } = prc.lngLatToXY(state.imageCenterLngLat)

    // Plane Rectangular Coordinates (x, y) is left-handed
    // x: North, y: East
    // https://www.gsi.go.jp/LAW/heimencho.html#9
    const theta = state.imageRotationDeg || 0
    const offsetMeter = {
      nw: rotate(- theta, { x: + state.imageShapeMeter.height / 2, y: - state.imageShapeMeter.width / 2}),
      ne: rotate(- theta, { x: + state.imageShapeMeter.height / 2, y: + state.imageShapeMeter.width / 2}),
      se: rotate(- theta, { x: - state.imageShapeMeter.height / 2, y: + state.imageShapeMeter.width / 2}),
      sw: rotate(- theta, { x: - state.imageShapeMeter.height / 2, y: - state.imageShapeMeter.width / 2}),
    }

    const vertices = {
      nw: prc.XYToLngLat({ x: cx + offsetMeter.nw.x, y: cy + offsetMeter.nw.y}),
      ne: prc.XYToLngLat({ x: cx + offsetMeter.ne.x, y: cy + offsetMeter.ne.y}),
      se: prc.XYToLngLat({ x: cx + offsetMeter.se.x, y: cy + offsetMeter.se.y}),
      sw: prc.XYToLngLat({ x: cx + offsetMeter.sw.x, y: cy + offsetMeter.sw.y}),
    }

    state.map.addSource('raster-image', {
      type: 'image',
      url: state.imageUrl,
      coordinates: [
        [vertices.nw.lng, vertices.nw.lat],
        [vertices.ne.lng, vertices.ne.lat],
        [vertices.se.lng, vertices.se.lat],
        [vertices.sw.lng, vertices.sw.lat],
      ]
    })
    state.map?.addLayer(rasterImageLayer);

    // Fit bounds to the image
    const minLng = Math.min(...Object.values(vertices).map(v => v.lng))
    const maxLng = Math.max(...Object.values(vertices).map(v => v.lng))
    const minLat = Math.min(...Object.values(vertices).map(v => v.lat))
    const maxLat = Math.max(...Object.values(vertices).map(v => v.lat))
    state.map?.fitBounds([
      [minLng, minLat], // southwestern corner of the bounds
      [maxLng, maxLat] // northeastern corner of the bounds
    ])
  }

  const fitMapToNodes = () => {
    if (state.nodes.length < 3) return;
    const minLng = Math.min(...state.nodes.map(n => n.lngLat.lng))
    const maxLng = Math.max(...state.nodes.map(n => n.lngLat.lng))
    const minLat = Math.min(...state.nodes.map(n => n.lngLat.lat))
    const maxLat = Math.max(...state.nodes.map(n => n.lngLat.lat))
    state.map?.fitBounds([
      [minLng, minLat], // southwestern corner of the bounds
      [maxLng, maxLat] // northeastern corner of the bounds
    ])
  }

  return (
    <>
      <Head>
        <title>Network editor</title>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
      </Head>
      <div id="mapbox" className={styles.mapbox}></div>
      <ImportModal
        open={importModalOpen}
        onCloseModal={() => setImportModalOpen(false)}
        onImportNodeLinkJson={data => {
          dispatch({ type: 'reset' })
          dispatch({ type: 'importNodeLinkJson', payload: data })
          setImportModalOpen(false)
        }}
      />
      <ExportModal
        open={exportModalOpen}
        onCloseModal={() => setExportModalOpen(false)}
        nodes={state.nodes}
        edges={state.edges}
      />
      <AddImageModal
        open={addImageModalOpen}
        onCloseModal={() => setAddImageModalOpen(false)}
        onImportImage={image => { dispatch({ type: 'setImage', payload: image }) }}
      />
      <ResetModal
        open={resetModalOpen}
        onCloseModal={() => setResetModalOpen(false)}
        onReset={() => { dispatch({ type: 'reset' }) }}
      />
      <SidePaper>
        <ListItem
          secondaryAction={
            <Stack direction="row" spacing={1}>
              <Tooltip title="Import">
                <IconButton edge="end" onClick={() => setImportModalOpen(true)}>
                  <UploadFileIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton edge="end" onClick={() => setExportModalOpen(true)}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add raster image overlay">
                <IconButton edge="end" onClick={() => setAddImageModalOpen(true)}>
                  <AddPhotoAlternateIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Fit to nodes">
                <span>
                  <IconButton edge="end" onClick={fitMapToNodes} disabled={state.nodes.length < 3}>
                    <CropFreeIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Reset">
                <span>
                  <IconButton edge="end" onClick={() => setResetModalOpen(true)} disabled={state.nodes.length < 1 && !state.imageUrl}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          }
        >
          <h4>Network Editor</h4>
        </ListItem>
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
          subheader={<ListSubheader>Settings</ListSubheader>}
        >
          <Divider />
          <NodeTable
            nodes={state.nodes}
            hoverNodeId={state.hoverNodeId}
            onEnterRow={(nodeId: number) => () => dispatch({ type: 'hover', payload: nodeId })}
            onLeaveRow={() => dispatch({ type: 'mouseleave' })}
            onDeleteRow={(nodeId: number) => () => { dispatch({ type: 'removeNode', payload: nodeId }) }}
          />
          <Divider />
          <EdgeTable
            edges={state.edges}
            hoverEdgeId={state.hoverEdgeId}
            onEnterRow={(edgeId: number) => () => { dispatch({ type: 'hoverEdge', payload: edgeId }) }}
            onLeaveRow={() => { dispatch({ type: 'mouseleaveEdge' }) }}
            onDeleteRow={(edgeId: number) => () => { dispatch({ type: 'removeEdgeById', payload: edgeId }) }}
          />
          <Divider />
          <BaseMapSelector mapStyle={mapStyle} onSelect={style => setMapStyle(style)} />
          <Divider />
          {!state.imageUrl ? null :
            <>
              <OverlaySetting
                initWidth={state.imageShape?.width || 0}
                initHeight={state.imageShape?.height || 0}
                initCenter={state.imageCenterLngLat || initOptions.center as mapboxgl.LngLat}
                onChangeWidth={width => { dispatch({ type: 'updateImageShapeMeter', payload: { width } }) }}
                onChangeHeight={height => { dispatch({ type: 'updateImageShapeMeter', payload: { height } }) }}
                onChangeRotation={deg => { dispatch({ type: 'updateImageRotationDeg', payload: deg }) }}
                onChangeLng={deg => { dispatch({ type: 'updateImageCenter', payload: { lng: deg } }) }}
                onChangeLat={deg => { dispatch({ type: 'updateImageCenter', payload: { lat: deg } }) }}
              />
              <Divider />
            </>
          }
        </List>
      </SidePaper>
    </>
  )
}

export default Map

const SidePaper = styled(Paper)`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 350px;
  height: 100vh;
  padding: 0px;
  overflow: scroll;
`
