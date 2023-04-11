<script lang="ts">
  import {
    PATH_START,
    SECONDS,
    MAX_SPEED,
    VIEWPORT_SIZE,
    MAJOR_TICK_INTERVAL,
    MINOR_TICK_INTERVAL,
    LABEL_INTERVAL,
  } from "../config/Config";
  import type { Path, PathPoint, Vector } from "../types/Types";
  import {
    feetToMiles,
    ftToMeter,
    getVectorAngle,
    getVectorMagnitude,
    gsToMps2,
    metersToFeet,
    mphToMps,
    mpsToMph,
    rotateVector,
  } from "../utils/utils";

  export let startSpeed: number;
  export let endSpeed: number;
  export let longitudinalAccelerationGs: number;
  export let longitudinalDecelerationGs: number;
  export let lateralGs: number;
  export let pathWidth: number;
  export let stepsPerSecond: number;

  export let showMajorTicks: boolean;
  export let showMinorTicks: boolean;
  export let showLabels: boolean;

  let path: Path = [];
  $: distance = 0;
  let time: number | undefined = undefined;

  let majorTicks: Path = [];
  let minorTicks: Path = [];
  let labels: Path = [];

  $: {
    distance = 0;
    time = 0;
    const startVelocity = { x: 0, y: mphToMps(startSpeed) };
    const isAccelerating = startSpeed < endSpeed;

    const accelMs2: Vector = {
      x: gsToMps2(lateralGs),
      y: isAccelerating
        ? gsToMps2(longitudinalAccelerationGs)
        : gsToMps2(-longitudinalDecelerationGs),
    };

    const endSpeedMps = mphToMps(endSpeed);

    path = [
      {
        position: PATH_START,
        velocity: startVelocity,
        step: 0,
        time: 0,
      },
    ];
    let velocity = startVelocity;
    let position = PATH_START;
    let step = 0;
    let speed = getVectorMagnitude(velocity);
    while (
      step < SECONDS * stepsPerSecond &&
      ((isAccelerating && speed < endSpeedMps) ||
        (!isAccelerating && speed > endSpeedMps))
    ) {
      const angle = getVectorAngle(velocity);
      const accelerationPerStep = {
        x: accelMs2.x / stepsPerSecond,
        y: accelMs2.y / stepsPerSecond,
      };
      const { x: ax, y: ay } = rotateVector(accelerationPerStep, angle);
      velocity = {
        x: velocity.x + ax,
        y: velocity.y + ay,
      };
      position = {
        x: position.x + velocity.x / stepsPerSecond,
        y: position.y - velocity.y / stepsPerSecond,
      };
      speed = getVectorMagnitude(velocity);

      const pathPoint: PathPoint = {
        position,
        velocity,
        step,
        time: step / stepsPerSecond,
      };

      path.push(pathPoint);
      step++;
      distance = distance + speed / stepsPerSecond;
    }

    path = path.filter((p) => p.step % 10 === 0);

    time = step / stepsPerSecond;

    majorTicks = [];
    if (showMajorTicks) {
      const majorTickSpeeds = new Set<number>();
      path.forEach((point, i) => {
        const speed = Math.round(mpsToMph(getVectorMagnitude(point.velocity)));
        if (speed % MAJOR_TICK_INTERVAL === 0 && !majorTickSpeeds.has(speed)) {
          majorTicks.push(point);
          majorTickSpeeds.add(speed);
        }
      });
    }

    minorTicks = [];
    if (showMinorTicks) {
      const minorTickSpeeds = new Set<number>();
      path.forEach((point, i) => {
        const speed = Math.round(mpsToMph(getVectorMagnitude(point.velocity)));
        if (speed % MINOR_TICK_INTERVAL === 0 && !minorTickSpeeds.has(speed)) {
          minorTicks.push(point);
          minorTickSpeeds.add(speed);
        }
      });
    }

    labels = [];
    if (showLabels) {
      const labelSpeeds = new Set<number>();
      path.forEach((point, i) => {
        const speed = Math.round(mpsToMph(getVectorMagnitude(point.velocity)));
        if (speed % LABEL_INTERVAL === 0 && !labelSpeeds.has(speed)) {
          labels.push(point);
          labelSpeeds.add(speed);
        }
      });
    }
  }
</script>

<svg
  width="120"
  height="120"
  xmlns="http://www.w3.org/2000/svg"
  viewBox={`-${VIEWPORT_SIZE.x / 2} -${VIEWPORT_SIZE.y / 2} ${
    VIEWPORT_SIZE.x
  } ${VIEWPORT_SIZE.y}`}
  id="spiralizer"
>
  <path
    fill="none"
    stroke="grey"
    stroke-width={ftToMeter(pathWidth)}
    d={`M ${path[0].position.x} ${path[0].position.y} ${path
      .slice(1)
      .map((p) => `L ${p.position.x} ${p.position.y}`)
      .join(" ")})}`}
  />

  {#each minorTicks as point}
    <circle
      cx={point?.position.x}
      cy={point?.position.y}
      r="0.5"
      fill="rgb(100, 100, 100)"
    />
  {/each}

  {#each majorTicks as point}
    <circle cx={point.position.x} cy={point.position.y} r="0.5" fill="black" />
  {/each}

  {#each labels as point}
    <text x={point.position.x + 1} y={point.position.y - 1} font-size="3"
      >{Math.round(mpsToMph(getVectorMagnitude(point.velocity)))}</text
    >
  {/each}
</svg>
<div class="info">
  <p>Image size: {VIEWPORT_SIZE.x}x{VIEWPORT_SIZE.y}pt, 1pt == 1m</p>
  <p>
    Path distance: {metersToFeet(distance).toFixed(0)}ft, {distance.toFixed(
      0
    )}m, {feetToMiles(metersToFeet(distance)).toFixed(2)}miles
  </p>
  <p>Duration: {time}s</p>
</div>

<style lang="scss">
  svg {
    width: 100%;
    max-width: calc(min(70vh, 50vw));
    min-width: 30rem;
    height: auto;
    aspect-ratio: 1;
    margin-right: var(--main-content-padding);
    margin-bottom: var(--main-content-padding);

    border: 1px solid var(--color-primary);
  }

  .info {
    color: var(--color-secondary);
    display: flex;
    flex: 1 0 30rem;
    flex-direction: column;
  }
</style>
