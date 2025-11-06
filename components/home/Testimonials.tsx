import Image from 'next/image';

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        '"Tonifier is a game-changer. I found the exact tone for "Comfortably Numb" in under a minute. Absolutely incredible!"',
      name: 'Alex Johnson',
      role: 'Session Guitarist',
      imageUrl: 'https://thispersondoesnotexist.com/',
      alt: 'Alex Johnson profile picture',
    },
    {
      quote:
        '"The AI is scarily accurate, and the editor gives me all the control I need for my own sounds. My go-to tool for inspiration."',
      name: 'Samira Khan',
      role: 'Indie Producer',
      imageUrl: 'https://thispersondoesnotexist.com/',
      alt: 'Samira Khan profile picture',
    },
    {
      quote:
        '"As a beginner, this is perfect. I can sound like my heroes without buying tons of expensive gear. Highly recommend."',
      name: 'Casey Williams',
      role: 'Hobbyist Player',
      imageUrl: 'https://thispersondoesnotexist.com/',
      alt: 'Casey Williams profile picture',
    },
  ];
  return (
    <section
      id="testimonials"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24"
    >
      <h2 className="text-3xl font-bold">Loved By Guitarists Worldwide</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map(({ quote, name, role, imageUrl, alt }) => (
          <div
            key={name}
            className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4 shadow-md"
          >
            <p className="text-sm">{quote}</p>
            <div className="flex items-center gap-2">
              <Image
                className="rounded-full object-contain"
                height={40}
                width={40}
                src={imageUrl}
                alt={alt}
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
