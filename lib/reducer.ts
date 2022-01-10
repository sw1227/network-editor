import { Reducer } from 'react'
import mapboxgl, { MapboxOptions } from 'mapbox-gl'
import { Node, Edge, LngLatEdge } from './map'

export type EditorState = {
  map?: mapboxgl.Map,
  currentNodeIdx: number,
  nodes: Node[],
  edges: Edge[],
  hoverNodeId?: Node['id'],
  selectedNodeForEdge?: Node['id'],
  editingEdge?: LngLatEdge,
}

type Action =
  | { type: 'initMap', payload: MapboxOptions }
  | { type: 'addNode', payload: mapboxgl.LngLat }
  | { type: 'hover', payload: Node['id']}
  | { type: 'mouseleave' }
  | { type: 'clickNode', payload: Node['id']}
  | { type: 'mousemove', payload: mapboxgl.LngLat }

export const reducer: Reducer<EditorState, Action> = (state, action) => {
  switch(action.type) {
    case 'initMap':
      const map = new mapboxgl.Map(action.payload)
      return {
        ...state,
        map,
      }
    case 'addNode':
      return {
        ...state,
        nodes: [...state.nodes, { lngLat: action.payload, id: state.currentNodeIdx }],
        currentNodeIdx: state.currentNodeIdx + 1
      }
    case 'hover':
      const hoverNodeId = action.payload
      // Unset hover flag of previously hovered node if exists
      if (state.hoverNodeId !== undefined) {
        state.map?.setFeatureState(
          { source: 'nodes', id: state.hoverNodeId },
          { hover: false }
        )
      }
      // Set hover flag of newly hovered node
      state.map?.setFeatureState(
        { source: 'nodes', id: hoverNodeId },
        { hover: true }
      )
      return {
        ...state,
        hoverNodeId
      }
    case 'mouseleave':
      // Unset hover flag of previously hovered node if exists
      if (state.hoverNodeId !== undefined) {
        state.map?.setFeatureState(
          { source: 'nodes', id: state.hoverNodeId },
          { hover: false }
        )
      }
      return {
        ...state,
        hoverNodeId: undefined
      }
    case 'clickNode':
      const clickedNodeId = action.payload
      if (state.selectedNodeForEdge !== undefined) {
        // Add new edge
        const edges = [...state.edges]
        const newEdge: Edge = [state.selectedNodeForEdge, clickedNodeId]
        if (newEdge[0] !== newEdge[1]) edges.push(newEdge)
        return {
          ...state,
          edges,
          selectedNodeForEdge: undefined,
          editingEdge: undefined
        }
      } else {
        // Start edge editing mode
        return {
          ...state,
          selectedNodeForEdge: clickedNodeId
        }
      }
    case 'mousemove':
      if (state.selectedNodeForEdge !== undefined) {
        const source = state.nodes.find(n => n.id === state.selectedNodeForEdge)
        const editingEdge = source ? [source.lngLat, action.payload] as LngLatEdge : undefined
        return {
          ...state,
          editingEdge
        }
      }
    default:
      return state
  }
}
