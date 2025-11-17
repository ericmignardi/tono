export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="p-4 text-sm">&copy; {year} tono. All rights reserved.</div>
    </footer>
  );
}
