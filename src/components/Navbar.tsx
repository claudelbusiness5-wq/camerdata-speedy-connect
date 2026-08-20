import { useEffect, useState } from "react";
import logo from "@/assets/camerdata-logo.png.asset.json";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-[70px] transition-all duration-300 ease-in-out ${
        scrolled ? "glass border-x-0 border-t-0 shadow-lg" : "border-transparent bg-transparent"
      }`}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5">
        <a href="#top" className="flex min-w-0 items-center gap-2" aria-label="CamerData, accueil">
          <img
            src={logo.url}
            alt="Logo CamerData"
            width={160}
            height={44}
            className="h-9 w-auto object-contain"
          />
        </a>
        <a
          href="mailto:support@camer-data.cm"
          className="shrink-0 text-sm font-semibold text-primary transition-colors hover:text-accent"
        >
          Support
        </a>
      </div>
    </header>
  );
}
