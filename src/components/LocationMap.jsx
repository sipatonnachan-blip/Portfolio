import { useEffect, useState } from 'react'
import { PROFILE } from '../data/contact'

// A dot-matrix Philippines with Davao City pinned. Drawn as plain SVG rather
// than a tile map: no library, no external requests, no API key, and it picks
// up the site's own colour tokens in both themes.

// One cell per half degree. Column 0 is 116.5°E, row 0 is 19.0°N.
const GRID = [
  '.....................',
  '.......##............',
  '......####...........',
  '......#####..........',
  '......#####..........',
  '......#####..........',
  '.......####..........',
  '.......####..........',
  '.......####..........',
  '.......#####.........',
  '........#####........',
  '........######.......',
  '.......########......',
  '......###..#####.....',
  '.....###.....###.....',
  '......#....###..###..',
  '.....##...####.####..',
  '.....#....#######....',
  '....#.....########...',
  '...##......##..##.##.',
  '...#.......##...####.',
  '..##..........######.',
  '...........#########.',
  '...........##########',
  '...........##########',
  '..............######.',
  '...............#####.',
  '................###..',
  '.................#...',
]

const STEP = 7
const ORIGIN_LON = 116.5
const ORIGIN_LAT = 19.0
const DEGREES_PER_CELL = 0.5

const DAVAO = { lat: 7.0731, lon: 125.6128 }
const PIN = {
  x: ((DAVAO.lon - ORIGIN_LON) / DEGREES_PER_CELL) * STEP,
  y: ((ORIGIN_LAT - DAVAO.lat) / DEGREES_PER_CELL) * STEP,
}

const WIDTH = GRID[0].length * STEP
const HEIGHT = GRID.length * STEP

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Manila',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export default function LocationMap() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-bg-card p-6 sm:p-8 md:flex-row md:items-center md:gap-12">
      <svg
        viewBox={`-4 -4 ${WIDTH + 8} ${HEIGHT + 8}`}
        className="h-auto w-[170px] flex-shrink-0 text-text-light sm:w-[200px]"
        role="img"
        aria-label="Map of the Philippines with Davao City marked"
      >
        {GRID.map((line, row) =>
          [...line].map((cell, col) =>
            cell === '#' ? (
              <circle
                key={`${row}-${col}`}
                cx={col * STEP}
                cy={row * STEP}
                r={1.5}
                fill="currentColor"
                opacity={0.38}
              />
            ) : null
          )
        )}

        {/* Davao City */}
        <circle
          cx={PIN.x}
          cy={PIN.y}
          r={4}
          fill="none"
          stroke="rgb(16 185 129)"
          strokeWidth={1.2}
          className="origin-center animate-ping [transform-box:fill-box] motion-reduce:animate-none"
        />
        <circle cx={PIN.x} cy={PIN.y} r={3} fill="rgb(16 185 129)" />
      </svg>

      <dl className="w-full space-y-4 text-center md:text-left">
        <div>
          <dt className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text-light">
            Based in
          </dt>
          <dd className="mt-1 font-sans text-xl font-bold text-text">{PROFILE.location}</dd>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-10 md:gap-8">
          <div>
            <dt className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text-light">
              Coordinates
            </dt>
            <dd className="mt-1 font-mono text-sm text-text-mid">
              {DAVAO.lat.toFixed(4)}° N, {DAVAO.lon.toFixed(4)}° E
            </dd>
          </div>

          <div>
            <dt className="font-mono text-[11px] font-semibold uppercase tracking-wider text-text-light">
              Local time
            </dt>
            <dd className="mt-1 flex items-center justify-center gap-2 font-mono text-sm text-text-mid md:justify-start">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {CLOCK.format(now)} · UTC+8
            </dd>
          </div>
        </div>
      </dl>
    </div>
  )
}
