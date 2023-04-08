export type Vector  = {x: number, y: number}

export type PathPoint = {
    position: Vector; // m
    velocity: Vector; // m/s
    time: number; // s
    step: number;
};

export type Path = PathPoint[];
  