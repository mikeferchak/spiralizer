<script lang="ts">
  // +y is forward

  type Vector = {
    x: number;
    y: number;
  };

  type PathPoint = {
    position: Vector; // m
    velocity: Vector; // m/s
    time: number; // s
    step: number;
  };

  type Path = PathPoint[];

  function mphToMps(mph: number): number {
    return mph * 0.44704;
  }

  function mpsToMph(mps: number): number {
    return mps / 0.44704;
  }

  function getVectorMagnitude(vector: Vector): number {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2); // m/s
  }

  function getVectorAngle(vector: Vector) {
    // -PI/2 because we want 0 to be straight up
    return Math.atan2(vector.y, vector.x) - Math.PI / 2;
  }

  function rotateVector(vector: Vector, rads: number): Vector {
    var cos = Math.cos(rads);
    var sin = Math.sin(rads);
    const { x: vx, y: vy } = vector;
    return {
      x: vx * cos - vy * sin,
      y: vx * sin + vy * cos,
    };
  }

  const VIEWPORT_SIZE: Vector = { x: 120, y: 120 };
  const PATH_START: Vector = { x: 0, y: 0 };

  const ACCEL_G: Vector = { x: -1.2, y: 0.3 };
  const G_TO_MS2 = 9.80665;
  const G_TO_FTS2 = 32.174;
  const ACCEL_MS2: Vector = { x: ACCEL_G.x * 9.80665, y: ACCEL_G.y * 9.80665 };
  const START_VELOCITY: Vector = { x: 0, y: mphToMps(10) }; // m/s

  const MAX_SPEED = mphToMps(60);

  const SECONDS: number = 10;
  const STEPS_PER_SECOND: number = 8;

  let path: Path = [
    {
      position: PATH_START,
      velocity: START_VELOCITY,
      step: 0,
      time: 0,
    },
  ];
  let velocity = START_VELOCITY;
  let position = PATH_START;
  let step = 0;
  let speed = getVectorMagnitude(velocity);
  while (step < SECONDS * STEPS_PER_SECOND && speed < MAX_SPEED) {
    const angle = getVectorAngle(velocity);
    const accelerationPerStep = {
      x: ACCEL_MS2.x / STEPS_PER_SECOND,
      y: ACCEL_MS2.y / STEPS_PER_SECOND,
    };
    const { x: ax, y: ay } = rotateVector(accelerationPerStep, angle);
    velocity = {
      x: velocity.x + ax,
      y: velocity.y + ay,
    };
    position = {
      x: position.x + velocity.x / STEPS_PER_SECOND,
      y: position.y + velocity.y / STEPS_PER_SECOND,
    };
    speed = getVectorMagnitude(velocity);

    const pathPoint: PathPoint = {
      position,
      velocity,
      step,
      time: step / STEPS_PER_SECOND,
    };

    path.push(pathPoint);
    step++;
  }
</script>

<main>
  <h1>Spiralizer</h1>

  <h2>Start speed: {mpsToMph(getVectorMagnitude(START_VELOCITY))} mph</h2>
  <h2>End speed: {mpsToMph(MAX_SPEED)} mph</h2>
  <h2>Acceleration: {-ACCEL_G.x}g lat, {ACCEL_G.y}g lon</h2>
  <h2>Image size: {VIEWPORT_SIZE.x}x{VIEWPORT_SIZE.y}pt, 1pt == 1m</h2>
  <h2 />

  <svg
    width="100"
    height="100"
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`-${VIEWPORT_SIZE.x / 2} -${VIEWPORT_SIZE.y / 2} ${
      VIEWPORT_SIZE.x
    } ${VIEWPORT_SIZE.y}`}
  >
    <path
      fill="none"
      stroke="grey"
      stroke-width="1.8"
      d={`M ${path[0].position.x} ${path[0].position.y} ${path
        .slice(1)
        .map((p) => `L ${p.position.x} ${p.position.y}`)
        .join(" ")})}`}
    />
    {#each path as point}
      {#if Math.round(mpsToMph(getVectorMagnitude(point.velocity))) % 5 === 0}
        {#if Math.round(mpsToMph(getVectorMagnitude(point.velocity))) % 10 === 0}
          <g>
            <circle
              cx={point.position.x}
              cy={point.position.y}
              r="0.5"
              fill="black"
            />
            <text
              x={point.position.x + 1}
              y={point.position.y - 1}
              font-size="3"
              >{Math.round(mpsToMph(getVectorMagnitude(point.velocity)))}</text
            >
          </g>
        {:else}
          <g>
            <circle
              cx={point.position.x}
              cy={point.position.y}
              r="0.5"
              fill="rgb(100, 100, 100)"
            />
          </g>
        {/if}
      {/if}
    {/each}
  </svg>
</main>

<style lang="scss">
  main {
    padding: var(--main-content-padding);
    display: flex;
    flex-direction: column;
  }

  h1 {
    font-size: var(--text-lg);
  }

  h2 {
    margin: 0.5rem 0;
  }

  svg {
    display: block;
    flex: 0 0 auto;
    height: 400px;
    width: 400px;
    border: 1px solid black;
  }
</style>
