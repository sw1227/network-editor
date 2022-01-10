import mapboxgl, { MapboxOptions } from 'mapbox-gl'
import { Node, Edge } from './map'

export type EditorState = {
  map?: mapboxgl.Map,
  currentNodeIdx: number,
  nodes: Node[],
  edges: Edge[],
  hoverNodeId?: Node['id'],
}

type Action =
  | { type: 'initMap', payload: MapboxOptions }
  | { type: 'addNode', payload: mapboxgl.LngLat }
  | { type: 'hover', payload: Node['id']}
  | { type: 'mouseleave' }

export const reducer = (state: EditorState, action: Action) => {
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
    default:
      return state
  }
}
