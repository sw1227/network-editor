export type Degree = number
export type Radian = number
export type LngLat = {
  lng: Degree,
  lat: Degree
}

export const deg2rad = (deg: Degree): Radian => {
  return Math.PI / 180 * deg
}
export const rad2deg = (rad: Radian): Degree => {
  return 180 / Math.PI * rad
}

// Rotate coord by theta[deg] around [0, 0]
export const rotate = (
  theta: Degree,
  coord: { x: number, y: number }
) => {
  const rad = deg2rad(theta)
  const { x, y } = coord
  return {
    x: Math.cos(rad) * x - Math.sin(rad) * y,
    y: Math.sin(rad) * x + Math.cos(rad) * y,
  }
}

// 定数 (a, F: 世界測地系-測地基準系1980（GRS80）楕円体)
const m0 = 0.9999
const a = 6378137
const F = 298.257222101
const n = 1 / (2 * F - 1)

// 平面直角座標系（平成十四年国土交通省告示第九号）
// https://www.gsi.go.jp/LAW/heimencho.html
export const ORIGINS: {[system: string]: LngLat} = {
  IX: { lng: 139+50/60, lat: 36 }
}


export class PlaneRectangularConverter {
  phi0: Radian
  lambda0: Radian
  arrayA: number[]
  arrayAlpha: number[]
  arrayBeta: number[]
  arrayDelta: number[]
  A_: number
  S_: number

  constructor(origin: LngLat) {
    // 座標系原点
    this.phi0 = deg2rad(origin.lat)
    this.lambda0 = deg2rad(origin.lng)
    // 定数から計算できる量
    this.arrayA = arrayA(n)
    this.arrayAlpha = arrayAlpha(n)
    this.arrayBeta = arrayBeta(n)
    this.arrayDelta = arrayDelta(n)
    this.A_ = ((m0 * a) / (1 + n)) * this.arrayA[0]
    this.S_ = ((m0 * a) / (1 + n)) * (
      this.arrayA[0] * this.phi0 +
      this.arrayA.slice(1).reduce((prev, A, idx) => {
        return prev + A * Math.sin(2 * (idx + 1) * this.phi0)
      }, 0)
    )
  }

  XYToLngLat(xy: { x: number, y: number }): LngLat {
    const { x, y } = xy

    const xi = (x + this.S_) / this.A_
    const eta = y / this.A_

    const xi2 = xi - this.arrayBeta.reduce((prev, beta, idx) => (
      prev + beta * Math.sin(2 * (idx + 1) * xi) * Math.cosh(2 * (idx + 1) * eta)
    ), 0)
    const eta2 = eta - this.arrayBeta.reduce((prev, beta, idx) => (
      prev + beta * Math.cos(2 * (idx + 1) * xi) * Math.sinh(2 * (idx + 1) * eta)
    ), 0)

    const chi = Math.asin(Math.sin(xi2) / Math.cosh(eta2)) // [rad]

    const latitude = chi + this.arrayDelta.reduce((prev, delta, idx) => (
      prev + delta * Math.sin(2 * (idx + 1) * chi)
    ), 0) // [rad]
    const longitude = this.lambda0 + Math.atan2(Math.sinh(eta2), Math.cos(xi2)) // [rad]

    return { lng: rad2deg(longitude), lat: rad2deg(latitude) }
  }

  lngLatToXY(lngLat: LngLat): { x: number, y: number } {
    const { lng, lat } = lngLat
    const phi = deg2rad(lat)
    const lambda = deg2rad(lng)

    const lambdaC = Math.cos(lambda - this.lambda0)
    const lambdaS = Math.sin(lambda - this.lambda0)

    const t = Math.sinh(
      Math.atanh(Math.sin(phi)) -
      ((2 * Math.sqrt(n)) / (1 + n)) * Math.atanh(((2 * Math.sqrt(n)) / (1 + n)) * Math.sin(phi))
    )
    const t_ = Math.sqrt(1 + t * t)

    const xi2  = Math.atan2(t, lambdaC) // # [rad]
    const eta2 = Math.atanh(lambdaS / t_)

    const x = this.A_ * (
      xi2 + this.arrayAlpha.reduce((prev, alpha, idx) => (
        prev + alpha * Math.sin(2 * (idx + 1) * xi2) * Math.cosh(2 * (idx + 1) * eta2)
      ), 0)
    ) - this.S_
    const y = this.A_ * (
      eta2 + this.arrayAlpha.reduce((prev, alpha, idx) => (
        prev + alpha * Math.cos(2 * (idx + 1) * xi2) * Math.sinh(2 * (idx + 1) * eta2)
      ), 0)
    )
    return { x, y }
  }
}

const arrayA = (n: number) => {
  const A0 = 1 + (n ** 2) / 4 + (n ** 4) / 64
  const A1 = - (3 / 2) * (n - (n ** 3) / 8 - (n ** 5) / 64)
  const A2 = (15 / 16) * (n ** 2 - (n ** 4) / 4)
  const A3 = - (35 / 48) * (n ** 3 - (5. / 16) * (n ** 5))
  const A4 = (315 / 512) * (n ** 4)
  const A5 = -(693 / 1280) * (n ** 5)
  return [A0, A1, A2, A3, A4, A5]
}

const arrayAlpha = (n: number) => {
  const a1 = (1 / 2) * n - (2 / 3) * (n ** 2) + (5 / 16) * (n ** 3) + (41 / 180) * (n ** 4) - (127 / 288) * (n ** 5)
  const a2 = (13 / 48) * (n ** 2) - (3 / 5) * (n ** 3) + (557 / 1440) * (n ** 4) + (281 / 630) * (n ** 5)
  const a3 = (61 / 240) * (n ** 3) - (103 / 140) * (n ** 4) + (15061 / 26880) * (n ** 5)
  const a4 = (49561 / 161280) * (n ** 4) - (179 / 168) * (n ** 5)
  const a5 = (34729 / 80640) * (n ** 5)
  return [a1, a2, a3, a4, a5]
}

const arrayBeta = (n: number) => {
  const b1 = (1 / 2) * n - (2 / 3) * (n ** 2) + (37 / 96) * (n ** 3) - (1 / 360) * (n ** 4) - (81 / 512) * (n ** 5)
  const b2 = (1 / 48) * (n ** 2) + (1 / 15) * (n ** 3) - (437 / 1440) * (n ** 4) + (46 / 105) * (n ** 5)
  const b3 = (17 / 480) * (n ** 3) - (37 / 840) * (n ** 4) - (209 / 4480) * (n ** 5)
  const b4 = (4397 / 161280) * (n ** 4) - (11 / 504) * (n ** 5)
  const b5 = (4583 / 161280) * (n ** 5)
  return [b1, b2, b3, b4, b5]
}

const arrayDelta = (n: number) => {
  const d1 = 2 * n - (2 / 3) * (n ** 2) - 2 * (n ** 3) + (116 / 45) * (n ** 4) + (26 / 45) * (n ** 5) - (2854 / 675) * (n ** 6)
  const d2 = (7 / 3) * (n ** 2) - (8 / 5) * (n ** 3) - (227 / 45) * (n ** 4) + (2704 / 315) * (n ** 5) + (2323 / 945) * (n ** 6)
  const d3 = (56 / 15) * (n ** 3) - (136 / 35) * (n ** 4) - (1262 / 105) * (n ** 5) + (73814 / 2835) * (n ** 6)
  const d4 = (4279 / 630) * (n ** 4) - (332 / 35) * (n ** 5) - (399572 / 14175) * (n ** 6)
  const d5 = (4174 / 315) * (n ** 5) - (144838 / 6237) * (n ** 6)
  const d6 = (601676 / 22275) * (n ** 6)
  return [d1, d2, d3, d4, d5, d6]
}
