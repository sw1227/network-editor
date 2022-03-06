import { Reducer } from 'react'
import mapboxgl, { MapboxOptions } from 'mapbox-gl'
import { Node, Edge, LngLatEdge, NodeLinkJson } from './map'

export type EditorState = {
  map?: mapboxgl.Map,
  currentNodeIdx: number,
  currentEdgeIdx: number,
  nodes: Node[],
  edges: Edge[],
  hoverNodeId?: Node['id'],
  hoverEdgeId?: Edge['id'],
  selectedNodeForEdge?: Node['id'],
  editingEdge?: LngLatEdge,
  imageUrl?: string,
  imageShape?: { width: number, height: number }, // shape of uploaded image [px]
  imageShapeMeter?: {width: number, height: number}, // shape of image on map [m]
  imageRotationDeg?: number,
}

export const initialState: EditorState = {
  currentNodeIdx: 0,
  currentEdgeIdx: 0,
  nodes: [],
  edges: []
}

type Action =
  | { type: 'initMap', payload: MapboxOptions }
  | { type: 'clickMap', payload: mapboxgl.LngLat }
  | { type: 'hover', payload: Node['id']}
  | { type: 'mouseleave' }
  | { type: 'clickNode', payload: Node['id']}
  | { type: 'mousemove', payload: mapboxgl.LngLat }
  | { type: 'escape' }
  | { type: 'removeNode', payload: Node['id'] }
  | { type: 'removeEdgeById', payload: Edge['id'] }
  | { type: 'hoverEdge', payload: Edge['id'] }
  | { type: 'mouseleaveEdge' }
  | { type: 'reset' }
  | { type: 'importNodeLinkJson', payload: NodeLinkJson }
  | { type: 'setImage', payload: HTMLImageElement }
  | { type: 'updateImageShapeMeter', payload: { width?: number, height?: number } }
  | { type: 'updateImageRotationDeg', payload: number }

export const reducer: Reducer<EditorState, Action> = (state, action) => {
  switch(action.type) {
    case 'initMap':
      const map = new mapboxgl.Map(action.payload)
      return {
        ...state,
        map,
      }
    case 'clickMap':
      if (state.selectedNodeForEdge !== undefined) {
        // Add Node and Edge
        const newNode = { lngLat: action.payload, id: state.currentNodeIdx }
        const newEdge: Edge = {
          source: state.selectedNodeForEdge,
          target: newNode.id,
          id: state.currentEdgeIdx,
        }
        return {
          ...state,
          nodes: [...state.nodes, newNode],
          currentNodeIdx: state.currentNodeIdx + 1,
          currentEdgeIdx: state.currentEdgeIdx + 1,
          edges: [...state.edges, newEdge],
          selectedNodeForEdge: undefined,
          editingEdge: undefined
        }
      } else {
        // Add Node
        return {
          ...state,
          nodes: [...state.nodes, { lngLat: action.payload, id: state.currentNodeIdx }],
          currentNodeIdx: state.currentNodeIdx + 1
        }
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
        const newEdge: Edge = {
          source: state.selectedNodeForEdge,
          target: clickedNodeId,
          id: state.currentEdgeIdx,
        }
        if (newEdge.source !== newEdge.target) edges.push(newEdge)
        return {
          ...state,
          currentEdgeIdx: state.currentEdgeIdx + 1,
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
    case 'escape':
      if (state.selectedNodeForEdge !== undefined) {
        return {
          ...state,
          selectedNodeForEdge: undefined,
          editingEdge: undefined,
        }
      } else {
        return state
      }
    case 'removeNode':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        edges: state.edges.filter(edge => ![edge.source, edge.target].includes(action.payload))
      }
    case 'removeEdgeById':
      return {
        ...state,
        edges: state.edges.filter(edge => edge.id !== action.payload)
      }
    case 'hoverEdge':
      const hoverEdgeId = action.payload
      // Unset hover flag of previously hovered edge if exists
      if (state.hoverEdgeId !== undefined) {
        state.map?.setFeatureState(
          { source: 'edges', id: state.hoverEdgeId },
          { hover: false }
        )
      }
      // Set hover flag of newly hovered edge
      state.map?.setFeatureState(
        { source: 'edges', id: hoverEdgeId },
        { hover: true }
      )
      return {
        ...state,
        hoverEdgeId
      }
    case 'mouseleaveEdge':
        // Unset hover flag of previously hovered edge if exists
        if (state.hoverEdgeId !== undefined) {
          state.map?.setFeatureState(
            { source: 'edges', id: state.hoverEdgeId },
            { hover: false }
          )
        }
        return {
          ...state,
          hoverEdgeId: undefined
        }
    case 'reset':
        return {
          ...initialState,
          map: state.map
        }
    case 'importNodeLinkJson':
      const { nodes, links } = action.payload
      const importedNodes: Node[] = nodes.map(n => ({
        id: n.id,
        lngLat: new mapboxgl.LngLat(n.lng, n.lat),
      }))
      // Assuming all the links have id or all the links do not have id
      const importedEdges: Edge[] = links.map((l, i) => ({
        id: l.id || i,
        source: l.source,
        target: l.target
      }))
      return {
        ...state,
        nodes: importedNodes,
        edges: importedEdges,
        currentNodeIdx: Math.max(...importedNodes.map(n => n.id)) + 1,
        currentEdgeIdx: Math.max(...importedEdges.map(n => n.id)) + 1,
      }
    case 'setImage':
      const image = action.payload
      return {
        ...state,
        imageUrl: image.src,
        imageShape: {
          width: image.width,
          height: image.height
        },
        // Actual shape [m] of image: initialize by image shape in px
        imageShapeMeter: {
          width: image.width,
          height: image.height
        },
      }
    case 'updateImageShapeMeter':
      const { width, height } = action.payload
      return {
        ...state,
        imageShapeMeter: {
          width: width ? width : state.imageShapeMeter?.width || 0,
          height: height ? height : state.imageShapeMeter?.height || 0,
        },
      }
    case 'updateImageRotationDeg':
      const deg = action.payload
      return {
        ...state,
        imageRotationDeg: deg,
      }
    default:
      return state
  }
}
