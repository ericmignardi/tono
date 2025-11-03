import Image from 'next/image';

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24"
    >
      <h2 className="text-3xl font-bold">Loved By Guitarists Worldwide</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4">
          <p className="text-sm">
            "Tonifier is a game-changer. I found the exact tone for "Comfortably Numb" in under a
            minute. Absolutely incredible!"
          </p>
          <div className="flex items-center gap-2">
            <Image
              className="h-10 w-10 rounded-full object-contain"
              height={10}
              width={10}
              src={'https://thispersondoesnotexist.com/'}
              alt="Alex Johnson profile picture"
            />
            <div>
              <p className="font-semibold">Alex Johnson</p>
              <p className="text-xs">Session Guitarist</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4">
          <p className="text-sm">
            "The AI is scarily accurate, and the editor gives me all the control I need for my own
            sounds. My go-to tool for inspiration."
          </p>
          <div className="flex items-center gap-2">
            <Image
              className="h-10 w-10 rounded-full object-contain"
              height={10}
              width={10}
              src={'https://thispersondoesnotexist.com/'}
              alt="Samira Khan profile picture"
            />
            <div>
              <p className="font-semibold">Samira Khan</p>
              <p className="text-xs">Indie Producer</p>
            </div>
          </div>
        </div>
        <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4">
          <p className="text-sm">
            "As a beginner, this is perfect. I can sound like my heroes without buying tons of
            expensive gear. Highly recommend."
          </p>
          <div className="flex items-center gap-2">
            <Image
              className="h-10 w-10 rounded-full object-contain"
              height={10}
              width={10}
              src={'https://thispersondoesnotexist.com/'}
              alt="Casey Williams profile picture"
            />
            <div>
              <p className="font-semibold">Casey Williams</p>
              <p className="text-xs">Hobbyist Player</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
