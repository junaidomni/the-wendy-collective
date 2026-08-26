import { useEffect, type ReactNode } from "react";
import { Link } from "wouter";

const navigation = [
  { href: "/about", label: "About Wendy" },
  { href: "/destinations", label: "Destinations" },
  { href: "/faq", label: "FAQ" },
  { href: "/private-experience", label: "Private Experience" },
];

type SiteShellProps = {
  children: ReactNode;
  darkHeader?: boolean;
};

function ScrollRevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".page-main > .page-section"));
    targets.forEach((target) => target.classList.add("reveal-on-scroll"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  return null;
}

export default function SiteShell({ children, darkHeader = false }: SiteShellProps) {
  return (
    <div className="site-shell">
      <header className={`site-header${darkHeader ? " site-header--solid" : ""}`}>
        <div className="header-inner">
          <Link href="/" className="brand-mark" aria-label="The Wendy Collective home">
            <span className="brand-monogram">TWC</span>
            <span className="brand-name">The Wendy Collective</span>
          </Link>
          <nav className="site-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <Link href="/contact" className="button-link">Plan Your Journey <span aria-hidden="true">↗</span></Link>
          </nav>
          <details className="header-mobile">
            <summary>Menu</summary>
            <nav className="mobile-nav-panel" aria-label="Mobile navigation">
              <Link href="/">Home</Link>
              {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
              <Link href="/contact">Plan Your Journey</Link>
            </nav>
          </details>
        </div>
      </header>
      <main className="page-main page-enter"><ScrollRevealObserver />{children}</main>
      <footer className="site-footer">
        <div className="page-wrap">
          <div className="footer-grid">
            <div>
              <Link href="/" className="brand-mark" aria-label="The Wendy Collective home">
                <span className="brand-monogram">TWC</span>
                <span className="brand-name">The Wendy Collective</span>
              </Link>
              <p className="footer-statement">Travel well. Stay curious. Collect experiences.</p>
            </div>
            <div>
              <p className="footer-heading">Explore</p>
              <nav className="footer-links" aria-label="Explore The Wendy Collective">
                <Link href="/about">About Wendy</Link>
                <Link href="/destinations">Destinations</Link>
                <Link href="/faq">FAQ</Link>
                <Link href="/contact">Plan Your Journey</Link>
              </nav>
            </div>
            <div>
              <p className="footer-heading">A private invitation</p>
              <nav className="footer-links" aria-label="Client resources">
                <Link href="/private-experience">Private Experience</Link>
                <a href="mailto:info@thewendycollective.com">info@thewendycollective.com</a>
              </nav>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} The Wendy Collective</span>
            <span>Thoughtfully planned travel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
