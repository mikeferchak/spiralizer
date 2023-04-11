<script lang="ts">
  import {
    PATH_START,
    SECONDS,
    STEPS_PER_SECOND,
    MAX_SPEED,
    VIEWPORT_SIZE,
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

  export let showMajorTicks: boolean;
  export let showMinorTicks: boolean;
  export let showLabels: boolean;

  let path: Path = [];
  $: distance = 0;
  let time: number | undefined = undefined;

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
      step < SECONDS * STEPS_PER_SECOND &&
      ((isAccelerating && speed < endSpeedMps) ||
        (!isAccelerating && speed > endSpeedMps))
    ) {
      const angle = getVectorAngle(velocity);
      const accelerationPerStep = {
        x: accelMs2.x / STEPS_PER_SECOND,
        y: accelMs2.y / STEPS_PER_SECOND,
      };
      const { x: ax, y: ay } = rotateVector(accelerationPerStep, angle);
      velocity = {
        x: velocity.x + ax,
        y: velocity.y + ay,
      };
      position = {
        x: position.x + velocity.x / STEPS_PER_SECOND,
        y: position.y - velocity.y / STEPS_PER_SECOND,
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
      distance = distance + speed / STEPS_PER_SECOND;
    }

    time = step / STEPS_PER_SECOND;
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
  {#each path as point}
    {#if Math.round(mpsToMph(getVectorMagnitude(point.velocity))) % 5 === 0}
      {#if Math.round(mpsToMph(getVectorMagnitude(point.velocity))) % 10 === 0}
        <g>
          {#if showMajorTicks}
            <circle
              cx={point.position.x}
              cy={point.position.y}
              r="0.5"
              fill="black"
            />
          {/if}
          {#if showLabels}
            <text
              x={point.position.x + 1}
              y={point.position.y - 1}
              font-size="3"
              >{Math.round(mpsToMph(getVectorMagnitude(point.velocity)))}</text
            >
          {/if}
        </g>
      {:else if showMinorTicks}
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
<p>Image size: {VIEWPORT_SIZE.x}x{VIEWPORT_SIZE.y}pt, 1pt == 1m</p>
<p>
  Path distance: {metersToFeet(distance).toFixed(0)}ft, {distance.toFixed(0)}m, {feetToMiles(
    metersToFeet(distance)
  ).toFixed(2)}miles
</p>
<p>Duration: {time}s</p>

<style lang="scss">
  svg {
    width: 100%;
    height: auto;
    aspect-ratio: 1;

    border: 1px solid var(--color-primary);
  }
</style>
