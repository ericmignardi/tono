import { Music2, Music3, Stars } from 'lucide-react';

export default function Features() {
  const features = [
    {
      Icon: Stars,
      title: 'AI Tone Generator',
      description:
        'Describe any artist or song and let our AI generate the perfect tone settings for you in seconds.',
    },
    {
      Icon: Music2,
      title: 'Intuitive Tone Editor',
      description:
        'Fine-tune every aspect of your sound with our powerful and easy-to-use digital effects editor.',
    },
    {
      Icon: Music3,
      title: 'Personal Tone Library',
      description:
        'Save, organize, and access all your favourite and custom-created tones from any device, anytime.',
    },
  ];
  return (
    <section
      id="features"
      className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 py-24"
    >
      <h2 className="text-3xl font-bold">Everything You Need in One Place</h2>
      <p className="text-sm">
        Our platform provides a seamless experience for finding, creating, and managing your guitar
        tones.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ Icon, title, description }) => (
          <div
            key={title}
            className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4 shadow-md"
          >
            <Icon className="text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
