import Link from "next/link";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Hotels", href: "/hotels" },
  { label: "Blogs", href: "/blog" },
  { label: "About", href: "/about-us" },
];

const SUPPORT_LINKS = [
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.17 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.77 8.44-4.92 8.44-9.94z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.5.5.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 01-1.15 1.76 4.9 4.9 0 01-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 01-1.76-1.15 4.9 4.9 0 01-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76a4.9 4.9 0 011.76-1.15c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.98.04-1.5.2-1.86.34-.47.18-.8.4-1.15.75-.36.35-.57.68-.75 1.15-.14.36-.3.88-.34 1.86C3.81 9.01 3.8 9.33 3.8 12s.01 2.99.06 4.04c.04.98.2 1.5.34 1.86.18.47.4.8.75 1.15.35.36.68.57 1.15.75.36.14.88.3 1.86.34 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.98-.04 1.5-.2 1.86-.34.47-.18.8-.4 1.15-.75.36-.35.57-.68.75-1.15.14-.36.3-.88.34-1.86.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.04-.98-.2-1.5-.34-1.86a3.1 3.1 0 00-.75-1.15 3.1 3.1 0 00-1.15-.75c-.36-.14-.88-.3-1.86-.34C14.99 3.81 14.67 3.8 12 3.8zm0 3.05a5.15 5.15 0 110 10.3 5.15 5.15 0 010-10.3zm0 1.8a3.35 3.35 0 100 6.7 3.35 3.35 0 000-6.7zm5.35-1.99a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7.1l-5.6-7.3L4.2 22H1l8.1-9.3L.7 2h7.3l5.1 6.7L18.9 2zm-1.2 18h1.9L7.4 4h-2l12.3 16z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="w-full px-container-padding-mobile md:px-container-padding-desktop py-section-gap grid grid-cols-1 md:grid-cols-3 gap-gutter bg-surface-container-lowest border-t border-secondary/20">
      <div>
        <h2 className="font-display-lg text-secondary text-2xl mb-6">CHAIN OF HOTELS</h2>
        <p className="font-body-md text-on-surface-variant mb-8">
          Redefining the standards of luxury accommodation across the United Arab Emirates.
        </p>
        <div className="flex gap-4">
  {SOCIAL_LINKS.map((social) => (
    <a
      key={social.label}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      className="w-10 h-10 border border-secondary/20 flex items-center justify-center rounded-full text-secondary hover:bg-secondary hover:text-on-secondary transition-all"
    >
      {social.icon}
    </a>
  ))}
</div>
      </div>

      <div>
        <h5 className="font-label-caps text-secondary mb-6">QUICK LINKS</h5>
        <ul className="flex flex-col gap-4 text-on-surface-variant">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link className="hover:text-secondary transition-all" href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 className="font-label-caps text-secondary mb-6">SUPPORT</h5>
        <ul className="flex flex-col gap-4 text-on-surface-variant">
          {SUPPORT_LINKS.map((link) => (
            <li key={link.href}>
              <Link className="hover:text-secondary transition-all" href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-3 pt-16 mt-16 border-t border-secondary/10 flex flex-col md:flex-row justify-between items-center text-on-surface-variant font-label-caps text-[10px]">
        <span>© {new Date().getFullYear()} Chain of Hotels. All rights reserved.</span>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="/hotels?location=Dubai">DUBAI</a>
          <a href="/hotels?location=Abu%20Dhabi">ABU DHABI</a>
          <a href="/hotels?location=Sharjah">SHARJAH</a>
        </div>
      </div>
    </footer>
  );
}