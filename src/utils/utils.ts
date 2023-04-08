import { G_TO_MS2 } from "../config/Config";
import type { Vector } from "../types/Types";


export function mphToMps(mph: number): number {
    return mph * 0.44704;
  }

export function mpsToMph(mps: number): number {
  return mps / 0.44704;
}

export function gsToMps2(gs: number): number {
  return gs * G_TO_MS2;
}

export function ftToMeter(ft: number): number {
  return ft / 3.28;
}

export function metersToFeet(m: number): number {
  return m * 3.28;
}

export function feetToMiles(ft: number): number {
  return ft / 5280;
}

export function getVectorMagnitude(vector: Vector): number {
  return Math.sqrt(vector.x ** 2 + vector.y ** 2); // m/s
}

export function getVectorAngle(vector: Vector) {
  // -PI/2 because we want 0 to be straight up
  return Math.atan2(vector.y, vector.x) - Math.PI / 2;
}

export function rotateVector(vector: Vector, rads: number): Vector {
  var cos = Math.cos(rads);
  var sin = Math.sin(rads);
  const { x: vx, y: vy } = vector;
  return {
    x: vx * cos - vy * sin,
    y: vx * sin + vy * cos,
  };
}