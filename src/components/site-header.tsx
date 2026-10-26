import Link from "next/link";

const links = [
  { href: "/projects#upcoming", label: "Projects" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="SpaceEnvy home">
        <span className="wordmark__icon" aria-hidden="true">
          S
        </span>
        <span>spaceenvy</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <Link className="button button--small" href="/#enquire">
          Start a project <span aria-hidden="true">↗</span>
        </Link>
      </nav>
      <details className="mobile-nav">
        <summary aria-label="Open navigation menu">
          <span />
          <span />
        </summary>
        <nav aria-label="Mobile navigation">
          <Link href="/projects#upcoming">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/#enquire">Start a project</Link>
        </nav>
      </details>
    </header>
  );
}
