export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-2xl font-bold tracking-tighter">Ours.</span>
          <p className="text-background/60 mt-2">Premium couple stickers.</p>
        </div>
        <div className="flex gap-6 text-background/60">
          <a href="#" className="hover:text-background transition-colors">Instagram</a>
          <a href="#" className="hover:text-background transition-colors">TikTok</a>
          <a href="#" className="hover:text-background transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
