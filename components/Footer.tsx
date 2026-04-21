import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-background px-6 pt-32 pb-12 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute bottom-0 right-0 w-full h-px bg-linear-to-r from-transparent via-accent/10 to-transparent"></div>
      
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-4">
            <Link href="/" className="group flex items-center gap-3 mb-8">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-accent/30 bg-background glow-amber transition-all group-hover:border-accent">
                <Activity className="h-4 w-4 text-accent" />
              </div>
              <span className="font-display text-xl font-black tracking-tighter text-foreground">TONO</span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xs opacity-60">
              High-fidelity neural synthesis for professional guitar tone recreation. Engineered for the modern purist.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground mb-8">Navigation</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">Home</Link></li>
              <li><Link href="#features" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">Modules</Link></li>
              <li><Link href="#pricing" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">License</Link></li>
              <li><Link href="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">Terminal</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground mb-8">Social</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">Twitter</Link></li>
              <li><Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">Instagram</Link></li>
              <li><Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">Discord</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 flex flex-col md:items-end">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground mb-8">System Status</h4>
            <div className="flex items-center gap-3 px-4 py-2 border border-border rounded bg-muted/20">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">All Systems Operational</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-border/50 gap-8">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
            © {new Date().getFullYear()} TONO STUDIO CORP. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors">Privacy Protocol</Link>
            <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
