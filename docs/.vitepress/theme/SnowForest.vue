<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

const pointerNearFox = ref(false);
const reacting = ref(false);
let returnTimer: ReturnType<typeof setTimeout>;

function approach(event: PointerEvent) {
  if (event.pointerType === 'touch') return;
  pointerNearFox.value = true;
}

function leave(event: PointerEvent) {
  if (event.pointerType !== 'touch') pointerNearFox.value = false;
}

function reactBriefly() {
  clearTimeout(returnTimer);
  reacting.value = true;
  returnTimer = setTimeout(() => (reacting.value = false), 1600);
}

onBeforeUnmount(() => clearTimeout(returnTimer));

const flakes = Array.from({ length: 36 }, (_, i) => {
  const seconds = 11 + ((i * 3) % 13);
  return {
    left: ((i * 47 + 13) % 101) + '%',
    '--size': 1.8 + ((i * 7) % 12) / 5 + 'px',
    '--fall': seconds + 's',
    '--delay': -(1 + (((i * 17) % 97) / 100) * seconds) + 's',
    '--drift': 10 + ((i * 19) % 70) + 'px',
    '--light': 0.24 + ((i * 11) % 33) / 100,
  };
});
</script>

<template>
  <main id="tools" class="snow-home" aria-label="雪林赤狐 · 研发工具">
    <div class="scene" aria-hidden="true">
      <svg
        class="fox"
        :class="{ attentive: pointerNearFox || reacting }"
        viewBox="0 0 736 509"
        @pointerenter="approach"
        @pointerleave="leave"
        @pointerup="$event.pointerType === 'touch' && reactBriefly()"
      >
        <defs>
          <radialGradient id="paw-shadow">
            <stop stop-color="#122b46" stop-opacity=".58" />
            <stop offset="1" stop-color="#122b46" stop-opacity="0" />
          </radialGradient>
        </defs>
        <g class="contact" fill="url(#paw-shadow)">
          <ellipse
            cx="350"
            cy="485"
            rx="283"
            ry="16"
            transform="rotate(-2 350 485)"
          />
          <ellipse cx="141" cy="491" rx="55" ry="6" />
          <ellipse cx="385" cy="479" rx="77" ry="7" />
        </g>
        <image
          href="/snow-forest/grounded.webp"
          x="87"
          y="180"
          width="635"
          height="318"
        />
        <g class="breathing">
          <image
            href="/snow-forest/coat.webp"
            x="41"
            y="106"
            width="416"
            height="258"
          />
          <g class="neck">
            <image
              href="/snow-forest/head.webp"
              x="11"
              y="34"
              width="176"
              height="225"
            />
            <g class="ear near">
              <image
                class="flick"
                href="/snow-forest/ear-left.webp"
                x="26"
                y="11"
                width="63"
                height="84"
              />
            </g>
            <image
              class="ear far"
              href="/snow-forest/ear-right.webp"
              x="103"
              y="13"
              width="67"
              height="80"
            />
          </g>
        </g>
      </svg>
    </div>
    <div class="snowfall" aria-hidden="true">
      <i v-for="(flake, i) in flakes" :key="i" :style="flake"></i>
    </div>
    <nav class="paths" aria-label="文档入口">
      <a
        class="path"
        href="/omp/"
        @mouseenter="reactBriefly"
        @focus="reactBriefly"
        ><span lang="en">omp</span></a
      >
      <a
        class="path"
        href="/rust-knowledge-server/"
        @mouseenter="reactBriefly"
        @focus="reactBriefly"
        ><span>知识库</span></a
      >
    </nav>
  </main>
</template>

<style scoped>
.snow-home {
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: #102337;
  color: #fff;
}
.scene {
  position: absolute;
  width: max(100%, 177.68vh);
  width: max(100%, 177.68dvh);
  aspect-ratio: 1672 / 941;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: url('/snow-forest/forest.webp') center / 100% 100% no-repeat;
}
.fox {
  position: absolute;
  left: 51.73445%;
  top: 26.1424%;
  width: 44.01914%;
  overflow: visible;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.contact {
  display: none;
}

.paths {
  position: absolute;
  left: clamp(48px, 13vw, 260px);
  top: 49%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  width: clamp(150px, 15vw, 230px);
}
.path {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 68px;
  padding: 0.45em 0;
  color: #fff;
  font-family: 'Noto Serif SC', 'Songti SC', SimSun, serif;
  font-size: clamp(32px, 3.1vw, 50px);
  font-weight: 400;
  line-height: 1.22;
  letter-spacing: 0.045em;
  text-decoration: none;
  text-shadow: 0 2px 14px #0a192ab3;
}
.path + .path {
  border-top: 1px solid rgb(228 239 249 / 32%);
}
.path [lang='en'] {
  font:
    italic 1.48em/1 Georgia,
    'Times New Roman',
    serif;
  letter-spacing: -0.035em;
}
.path::after {
  content: '';
  width: 20px;
  height: 10px;
  flex: none;
  background: currentColor;
  clip-path: polygon(
    0 44%,
    88% 44%,
    68% 4%,
    75% 0,
    100% 50%,
    75% 100%,
    68% 96%,
    88% 56%,
    0 56%
  );
  opacity: 0.86;
}
.path:hover::after,
.path:focus-visible::after {
  opacity: 1;
}
.path:hover span,
.path:focus-visible span {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
}
.path:focus-visible {
  outline: 2px solid #f4f8fc;
  outline-offset: 6px;
}

.snowfall,
.snowfall i {
  position: absolute;
  pointer-events: none;
}
.snowfall {
  inset: 0;
  overflow: hidden;
}
.snowfall i {
  display: none;
}

@media (prefers-reduced-motion: no-preference) {
  .breathing {
    transform-origin: 303px 345px;
    animation: breathe 4.8s ease-in-out infinite;
  }
  .neck {
    transform-origin: 160px 226px;
    transition: transform 800ms cubic-bezier(0.25, 0.7, 0.26, 1);
  }
  .ear {
    transition: transform 360ms cubic-bezier(0.22, 0.8, 0.3, 1);
  }
  .near,
  .flick {
    transform-origin: 55px 81px;
  }
  .far {
    transform-origin: 133px 79px;
  }
  .flick {
    animation: twitch 12.6s ease-in-out infinite;
  }
  .attentive .flick {
    animation-play-state: paused;
  }
  .attentive .near {
    transform: rotate(-10deg);
  }
  .attentive .far {
    transform: rotate(8deg);
  }
  .attentive .neck {
    transform: translateY(-2px) rotate(2.4deg);
    transition-delay: 230ms;
  }
  .snowfall i {
    display: block;
    top: -5px;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    background: #e4eef8;
    opacity: var(--light);
    animation: fall var(--fall) var(--delay) linear infinite;
  }
}
@keyframes breathe {
  50% {
    transform: scale(1.003, 1.012);
  }
}
@keyframes twitch {
  0%,
  62%,
  66%,
  100% {
    transform: rotate(0);
  }
  63.3% {
    transform: rotate(-6deg);
  }
  64.8% {
    transform: rotate(2deg);
  }
}
@keyframes fall {
  45% {
    transform: translate3d(calc(var(--drift) * 0.7), 46vh, 0);
  }
  to {
    transform: translate3d(var(--drift), calc(100vh + 10px), 0);
  }
}
@media (max-aspect-ratio: 6/5), (max-width: 600px) and (orientation: portrait) {
  .scene {
    inset: 0;
    width: 100%;
    height: 100%;
    aspect-ratio: auto;
    transform: none;
    background: url('/snow-forest/forest-portrait.webp') center / cover
      no-repeat;
  }
  .fox {
    left: auto;
    top: auto;
    right: 8%;
    bottom: 40%;
    width: min(81%, 70vh);
    width: min(81%, 70dvh);
  }
  .contact {
    display: block;
  }
  .paths {
    inset: auto max(8%, env(safe-area-inset-right))
      max(8%, env(safe-area-inset-bottom)) max(8%, env(safe-area-inset-left));
    width: auto;
    transform: none;
    flex-direction: row;
    gap: 10%;
  }
  .path {
    flex: 1;
    min-height: 54px;
    padding: 0.35em 0;
    font-size: clamp(25px, 5vw, 36px);
    border-bottom: 1px solid rgb(228 239 249 / 45%);
  }
  .path + .path {
    border-top: 0;
  }
  .path::after {
    width: 16px;
    height: 9px;
  }
}
</style>
