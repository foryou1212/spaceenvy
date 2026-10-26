import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Link className="wordmark wordmark--light" href="/">
            <span className="wordmark__icon" aria-hidden="true">
              S
            </span>
            <span>spaceenvy</span>
          </Link>
          <p>Thoughtful spaces, made personal.</p>
        </div>
        <div className="site-footer__links">
          <Link href="/about">Our approach</Link>
          <Link href="/projects#upcoming">Projects</Link>
          <Link href="/#enquire">Get in touch</Link>
          <Link href="/privacy">Privacy notice</Link>
        </div>
        <a
          className="footer-location"
          href="https://www.google.com/maps/search/?api=1&query=Hyderabad%2C+India"
          target="_blank"
          rel="noreferrer"
        >
          Hyderabad, India <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="site-footer__bottom">
        <span>© SpaceEnvy. Made with care.</span>
        <Link href="/admin/login">Admin sign in</Link>
      </div>
    </footer>
  );
}
