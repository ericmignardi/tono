export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Search',
      description: 'Describe an artist, song, or genre to start.',
    },
    {
      number: 2,
      title: 'Generate & Tweak',
      description: 'Let the AI generate your tone, then fine-tune it to perfection.',
    },
    {
      number: 3,
      title: 'Save & Play',
      description: 'Save your creation to your personal library and start playing.',
    },
  ];
  return (
    <section
      id="how-it-works"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-16 py-32"
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <h2 className="text-3xl font-bold">How It Works</h2>
        <p className="text-muted-foreground text-sm">
          Get the perfect tone in just three simple steps.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ number, title, description }) => (
          <div key={title} className="flex flex-col items-center gap-2 p-4 text-center">
            <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full">
              {number}
            </span>
            <p className="font-semibold">{title}</p>
            <p className="text-xs">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
