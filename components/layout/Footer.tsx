export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t-border border-t">
      <div className="text-foreground/80 p-4 text-sm">
        <p>© {year} tonifier. All rights reserved.</p>
      </div>
    </footer>
  );
}
