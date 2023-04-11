<script lang="ts">
  import SvgPreview from "../components/SvgPreview.svelte";
  import { MAX_SPEED, VIEWPORT_SIZE } from "../config/Config";
  import {
    feetToMiles,
    getVectorAngle,
    getVectorMagnitude,
    metersToFeet,
    mphToMps,
    mpsToMph,
  } from "../utils/utils";

  function downloadSvg(name: string) {
    var svg = document.getElementById("spiralizer");
    var serializer = new XMLSerializer();

    if (!svg) {
      return;
    }

    var source = serializer.serializeToString(svg);
    source = source.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace

    source = source.replace(/ns\d+:href/g, "xlink:href"); // Safari NS namespace fix.

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, source], {
      type: "image/svg+xml;charset=utf-8",
    });
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  $: startSpeed = 10; //mph
  $: endSpeed = mpsToMph(MAX_SPEED); //mph

  $: longitudinalAccelerationGs = 0.3; //g
  $: longitudinalDecelerationGs = 0.4; //g
  $: lateralGs = 1.3; //g
  $: pathWidth = 5.8; // ft
  $: showMajorTicks = true;
  $: showMinorTicks = true;
  $: showLabels = true;

  $: isAccelerating = startSpeed < endSpeed;

  $: svgName = `${Math.round(startSpeed)}_${Math.round(endSpeed)}__${lateralGs
    .toFixed(1)
    .replaceAll(".", "_")}__${
    isAccelerating
      ? longitudinalAccelerationGs.toFixed(1).replaceAll(".", "_")
      : longitudinalDecelerationGs.toFixed(1).replaceAll(".", "_")
  }__${isAccelerating ? "accel" : "decel"}${
    lateralGs ? (Math.sign(lateralGs) === 1 ? "__right" : "__left") : ""
  }.svg`;
</script>

<svelte:head>
  <title>spiralizer</title>
  <meta property="og:title" content="spiralizer" />
  <meta name="description" content="parking lot zoodles" />
  <meta name="og:description" content="parking lot zoodles" />
</svelte:head>

<main>
  <div class="controls">
    <header>
      <h1 title="parking lot zoodles">Spiralizer</h1>
    </header>
    <div class="form-input">
      <div class="label">Start speed</div>
      <div class="input">
        <input
          type="range"
          bind:value={startSpeed}
          min={0}
          max={mpsToMph(MAX_SPEED)}
        />
        <input type="number" bind:value={startSpeed} min={0} />
        <div class="unit">mph</div>
      </div>
    </div>

    <div class="form-input">
      <div class="label">end speed</div>
      <div class="input">
        <input
          type="range"
          bind:value={endSpeed}
          min={0}
          max={mpsToMph(MAX_SPEED)}
        />
        <input type="number" bind:value={endSpeed} min={0} />
        <div class="unit">mph</div>
      </div>
    </div>

    <div class="form-input">
      <div class="label">lateral gs</div>
      <div class="input">
        <input
          type="range"
          bind:value={lateralGs}
          min={-2}
          max={2}
          step={0.1}
        />
        <input type="number" bind:value={lateralGs} step={0.1} />
        <div class="unit">gs</div>
      </div>
    </div>

    <div class={`form-input ${!isAccelerating && "disabled"}`}>
      <div class="label" title="yeah dude i know. don't be pedantic">
        acceleration gs
      </div>
      <div class="input">
        <input
          type="range"
          bind:value={longitudinalAccelerationGs}
          min={0}
          max={2}
          step={0.1}
        />
        <input
          type="number"
          bind:value={longitudinalAccelerationGs}
          min={0}
          step={0.1}
        />
        <div class="unit">gs</div>
      </div>
    </div>

    <div class={`form-input ${isAccelerating && "disabled"}`}>
      <div class="label" title="yeah dude i know. don't be pedantic">
        deceleration gs
      </div>
      <div class="input">
        <input
          type="range"
          bind:value={longitudinalDecelerationGs}
          min={0}
          max={2}
          step={0.1}
        />
        <input
          type="number"
          bind:value={longitudinalDecelerationGs}
          min={0}
          step={0.1}
        />
        <div class="unit">gs</div>
      </div>
    </div>

    <div class="form-input">
      <div class="label">path width</div>
      <div class="input">
        <input
          type="range"
          bind:value={pathWidth}
          min={0}
          max={25}
          step={0.1}
        />
        <input type="number" bind:value={pathWidth} min={0} step={0.1} />
        <div class="unit">ft</div>
      </div>
    </div>

    <div class="form-input checkbox-group">
      <label><input type="checkbox" bind:checked={showLabels} />Labels</label>
      <label
        ><input type="checkbox" bind:checked={showMajorTicks} />Major ticks</label
      >
      <label
        ><input type="checkbox" bind:checked={showMinorTicks} />Minor ticks</label
      >
    </div>
  </div>

  <div class="preview">
    <SvgPreview
      {startSpeed}
      {endSpeed}
      {longitudinalAccelerationGs}
      {longitudinalDecelerationGs}
      {lateralGs}
      {pathWidth}
      {showLabels}
      {showMajorTicks}
      {showMinorTicks}
    />
  </div>

  <footer>
    <div
      class="download"
      on:keydown={() => downloadSvg(svgName)}
      on:click={() => downloadSvg(svgName)}
    >
      <span>
        Download: {svgName}
      </span>
    </div>
    <div class="donate">
      <a
        href="https://www.buymeacoffee.com/computer.racing"
        title="twenty dollars can buy many peanuts">$$ DONATE $$</a
      >
    </div>
  </footer>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: row;
    overflow-x: hidden;
    flex-wrap: wrap;
    width: 100vw;
    max-width: 100vw;
    flex: 1 1 auto;
    padding-bottom: 10rem;

    .controls {
      padding: var(--main-content-padding);
      display: flex;
      flex: 1 1 30rem;
      min-width: 22rem;
      max-width: 32rem;
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: auto;
      padding-right: var(--main-content-padding);
    }

    .preview {
      padding: var(--main-content-padding);
      flex: 1 1 40rem;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
    }

    .form-input {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 2rem;

      .label {
        font-size: var(--text-sm);
        padding-right: var(--main-content-padding);
        min-width: 20rem;
        flex: 0 0 20rem;
      }
      .input {
        flex: 1 1 auto;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        font-size: var(--text-sm);
      }
      .unit {
        min-width: 4rem;
        text-align: right;
        margin-left: 1rem;
      }

      &.disabled {
        opacity: 0.25;
      }
    }

    .checkbox-group {
      justify-content: space-between;
      label {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-bottom: 1rem;
      }

      input {
        margin-right: 0.5rem;
      }
    }

    .download {
      font-size: var(--text-md);
      cursor: pointer;
      color: var(--color-background);
      &:hover,
      &:focus {
        > span {
          border-bottom: 2px solid var(--color-background);
        }
      }
    }

    .donate > a {
      font-size: var(--text-md);
      color: var(--color-background);
      text-decoration: none;
      flex: 1 0 10rem;
      min-width: 10rem;

      &:hover {
        text-decoration: underline;
      }
    }

    footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0 var(--main-content-padding);
      background-color: var(--color-primary);
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;

      > div {
        margin: 2rem 0;
      }
    }

    input[type="number"] {
      display: block;
      font-size: var(--text-sm);
      font-weight: bold;
      width: 8rem;
      background: rgba(255, 255, 255, 0.5);
      border: none;
    }

    input[type="range"] {
      flex: 1 1 auto;
      margin-right: 1rem;
    }
  }

  h1 {
    font-size: var(--text-lg);
    margin-bottom: var(--section-margin);
  }
</style>
