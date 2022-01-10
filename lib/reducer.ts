import mapboxgl from 'mapbox-gl'
import { Node, Edge } from './map'

export type EditorState = {
  currentNodeIdx: number,
  nodes: Node[],
  edges: Edge[]
}

// type Action = {
//   type: string,
//   payload?: any
// }
type Action =
  | { type: 'addNode', payload: mapboxgl.LngLat }

export const reducer = (state: EditorState, action: Action) => {
  switch(action.type) {
    case 'addNode':
      return {
        ...state,
        nodes: [...state.nodes, { lngLat: action.payload, id: state.currentNodeIdx }],
        currentNodeIdx: state.currentNodeIdx + 1
      }
    default:
      return state
  }
}
