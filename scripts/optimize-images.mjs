// Makes small WebP copies of everything in public/images, for the site to use
// instead of the full-size originals (which stay untouched).
//
//   npm run images
//
// Photos (avatar-*) get one 320px copy; screenshots get a 640px copy for cards
// and a 1600px copy for the full-screen preview. File names carry a hash of
// the original, so a changed image gets a new URL and browsers can cache the
// copies forever. src/data/imageManifest.json maps each original path to its
// copies; src/utils/images.js reads it.
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const SRC_DIR = path.join(ROOT, 'public', 'images')
const OUT_DIR = path.join(SRC_DIR, 'opt')
const MANIFEST = path.join(ROOT, 'src', 'data', 'imageManifest.json')

const PHOTO_WIDTHS = [320]
const SCREENSHOT_WIDTHS = [640, 1600]
const QUALITY = { photo: 78, screenshot: 80 }

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

await mkdir(OUT_DIR, { recursive: true })
const files = (await readdir(SRC_DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f))

const manifest = {}
const keep = new Set()
let before = 0
let after = 0

for (const file of files.sort()) {
  const input = path.join(SRC_DIR, file)
  const buffer = await readFile(input)
  const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 8)
  const { width: srcWidth, height: srcHeight } = await sharp(buffer).metadata()
  const isPhoto = file.startsWith('avatar-')
  const widths = isPhoto ? PHOTO_WIDTHS : SCREENSHOT_WIDTHS
  const base = slug(path.parse(file).name)
  const entry = { width: srcWidth, height: srcHeight, variants: {} }
  before += buffer.length

  for (const w of widths) {
    const target = Math.min(w, srcWidth)
    const outName = `${base}-${w}.${hash}.webp`
    const outPath = path.join(OUT_DIR, outName)
    keep.add(outName)
    if (!existsSync(outPath)) {
      await sharp(buffer)
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality: isPhoto ? QUALITY.photo : QUALITY.screenshot, effort: 5 })
        .toFile(outPath)
    }
    const size = (await readFile(outPath)).length
    after += size
    entry.variants[w] = `/images/opt/${outName}`
  }
  manifest[`/images/${file}`] = entry
}

// Drop copies of images that changed or were removed
for (const old of await readdir(OUT_DIR)) {
  if (!keep.has(old)) await rm(path.join(OUT_DIR, old))
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
const mb = (n) => (n / 1024 / 1024).toFixed(1)
console.log(`${files.length} images: ${mb(before)} MB of originals → ${mb(after)} MB of WebP copies`)
