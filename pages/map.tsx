import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useReducer, useState } from 'react'
import { MapboxOptions, GeoJSONSource } from 'mapbox-gl'
import styled from 'styled-components'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import Tooltip from '@mui/material/Tooltip'
import CropFreeIcon from '@mui/icons-material/CropFree'
import RefreshIcon from '@mui/icons-material/Refresh'
import { reducer, initialState } from '../lib/reducer'
import { nodesToGeoJson, edgesToGeoJson, lngLatEdgeToGeoJson } from '../lib/map'
import { editingEdgeLayer, nodesLayer, edgesLayer } from '../lib/layers'
import NodeTable from '../components/nodetable'
import EdgeTable from '../components/edgetable'
import ExportModal from '../components/exportmodal'
import ResetModal from '../components/resetmodal'
import BaseMapSelector, { MAP_STYLE } from '../components/basemap'
import styles from '../styles/Map.module.css'

const Map: NextPage = () => {
  // States
  const [state, dispatch] = useReducer(reducer, initialState)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_STYLE>('Default_ja')

  // Create map instance on initial render
  useEffect(() => {
    const options: MapboxOptions = {
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      container: 'mapbox',
      style: MAP_STYLE[mapStyle],
      localIdeographFontFamily: 'sans-serif',
      center: [139.7, 35.7],
      zoom: 12
    }
    dispatch({ type: 'initMap', payload: options })
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
      <ExportModal
        open={exportModalOpen}
        onCloseModal={() => setExportModalOpen(false)}
        nodes={state.nodes}
        edges={state.edges}
      />
      <ResetModal
        open={resetModalOpen}
        onCloseModal={() => setResetModalOpen(false)}
        onReset={() => { dispatch({ type: 'reset' }) }}
      />
      <SidePaper>
        <ListItem
          secondaryAction={
            <Stack direction="row" spacing={2}>
              <Tooltip title="Export">
                <IconButton edge="end" onClick={() => setExportModalOpen(true)}>
                  <FileDownloadIcon />
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
                  <IconButton edge="end" onClick={() => setResetModalOpen(true)} disabled={state.nodes.length < 1}>
                    <RefreshIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          }
        >
          <ListItemText
            primary="Network editor"
          />
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
  padding: 10px;
  overflow: scroll;
`
