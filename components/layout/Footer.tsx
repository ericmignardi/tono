export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-border border-t">
      <div className="text-muted-foreground p-4 text-sm">
        <p>© {year} tono. All rights reserved.</p>
      </div>
    </footer>
  );
}
