import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";

const navigation = [
  { href: "/about", label: "About Wendy" },
  { href: "/destinations", label: "Destinations" },
  { href: "/faq", label: "FAQ" },
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
  const [location] = useLocation();
  const isActive = (href: string) => location === href || (href === "/destinations" && location.startsWith("/destinations/"));
  const navClass = (href: string) => `nav-link${isActive(href) ? " nav-link--active" : ""}`;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

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
              <Link key={item.href} href={item.href} className={navClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>
            ))}
            <Link href="/contact" className={`button-link${isActive("/contact") ? " button-link--active" : ""}`} aria-current={isActive("/contact") ? "page" : undefined}>Plan Your Journey <span aria-hidden="true">↗</span></Link>
          </nav>
          <details className="header-mobile">
            <summary>Menu</summary>
            <nav className="mobile-nav-panel" aria-label="Mobile navigation">
              <Link href="/" className={navClass("/")} aria-current={isActive("/") ? "page" : undefined}>Home</Link>
              {navigation.map((item) => <Link key={item.href} href={item.href} className={navClass(item.href)} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}
              <Link href="/contact" className={navClass("/contact")} aria-current={isActive("/contact") ? "page" : undefined}>Plan Your Journey</Link>
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
              <p className="footer-heading">Get in touch</p>
              <nav className="footer-links" aria-label="Contact The Wendy Collective">
                <Link href="/contact">Share your travel vision</Link>
                <a href="mailto:info@thewendycollective.com">info@thewendycollective.com</a>
                <Link href="/privacy">Privacy policy</Link>
              </nav>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} The Wendy Collective</span>
            <span>Thoughtfully planned travel</span>
            <Link href="/wendy/login" className="wendy-login">Staff login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
