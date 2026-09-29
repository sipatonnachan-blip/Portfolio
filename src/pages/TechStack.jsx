import TechLampScene from '../components/TechLampScene'

export default function TechStack() {
  return (
    <div className="w-full space-y-12 py-4 sm:py-8">
      {/* Header */}
      <div className="max-w-2xl">
        
        <h1 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Tech Stack &amp; Tooling
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-mid">
          The production languages, frameworks, database engines, and infrastructure platforms I leverage to deliver fast, reliable web applications.
        </p>
      </div>

      {/* Lamp + spinning logo ring */}
      <TechLampScene />
    </div>
  )
}
