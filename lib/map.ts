export type Node = {
  lngLat: mapboxgl.LngLat,
  id: number
}

export type Edge = [Node['id'], Node['id']]
