
import type { Vector } from "../types/Types";
import { mphToMps } from "../utils/utils";

export const VIEWPORT_SIZE: Vector = { x: 140, y: 140 };
export const PATH_START: Vector = { x: 0, y: 0 };

export const G_TO_MS2 = 9.80665;
export const G_TO_FTS2 = 32.174;

export const MAX_SPEED = mphToMps(60);

export const SECONDS: number = 60;
export const STEPS_PER_SECOND: number = 10;

export const MAJOR_TICK_INTERVAL = 10;
export const MINOR_TICK_INTERVAL = 5;
export const LABEL_INTERVAL = 10;