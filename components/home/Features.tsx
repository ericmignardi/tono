import { Music2, Music3, Stars } from 'lucide-react';

export default function Features() {
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
        <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4">
          <Stars className="text-primary" />
          <h3 className="font-semibold">AI Tone Generator</h3>
          <p className="text-xs">
            Describe any artist or song and let our AI generate the perfect tone settings for you in
            seconds.
          </p>
        </div>
        <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4">
          <Music2 className="text-primary" />
          <h3 className="font-semibold">Intuitive Tone Editor</h3>
          <p className="text-xs">
            Fine-tune every aspect of your sound with our powerful and easy-to-use digital effects
            editor.
          </p>
        </div>
        <div className="border-border bg-primary-foreground flex flex-col gap-2 rounded-2xl border p-4">
          <Music3 className="text-primary" />
          <h3 className="font-semibold">Personal Tone Library</h3>
          <p className="text-xs">
            Save, organize, and access all your favourite and custom-created tones from any device,
            anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
