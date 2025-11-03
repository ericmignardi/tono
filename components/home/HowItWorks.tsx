export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24"
    >
      <h2 className="text-3xl font-bold">How It Works</h2>
      <p className="text-sm">Get the perfect tone in just three simple steps.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <span className="bg-primary rounded-full p-4">1</span>
          <p className="font-semibold">Search</p>
          <p className="text-xs">Describe an artist, song, or genre to start.</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <span className="bg-primary rounded-full p-4">2</span>
          <p className="font-semibold">Generate & Tweak</p>
          <p className="text-xs">Let the AI generate your tone, then fine-tune it to perfection.</p>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 text-center">
          <span className="bg-primary rounded-full p-4">3</span>
          <p className="font-semibold">Save & Play</p>
          <p className="text-xs">Save your creation to your personal library and start playing.</p>
        </div>
      </div>
    </section>
  );
}
