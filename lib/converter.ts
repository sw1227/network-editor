export const deg2rad = (deg: number): number => {
  return Math.PI / 180 * deg
}
export const rad2deg = (rad: number): number => {
  return 180 / Math.PI * rad
}

// Rotate coord by theta[deg] around [0, 0]
export const rotate = (
  theta: number, // Degree
  coord: { x: number, y: number }
) => {
  const rad = deg2rad(theta)
  const { x, y } = coord
  return {
    x: Math.cos(rad) * x - Math.sin(rad) * y,
    y: Math.sin(rad) * x + Math.cos(rad) * y,
  }
}
