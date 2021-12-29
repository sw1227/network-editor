import type { NextPage } from 'next'
import { useEffect } from 'react'
import mapboxgl, { MapboxOptions } from 'mapbox-gl'
import styles from '../styles/Map.module.css'

const options: MapboxOptions = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  container: 'mapbox',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [139.7, 35.7],
  zoom: 12
}

const Map: NextPage = () => {

  useEffect(() => {
    const map = new mapboxgl.Map(options)
  }, [])

  return (
    <div id="mapbox" className={styles.mapbox}></div>
  )
}

export default Map
