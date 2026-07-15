import { Heart } from "lucide-react";

const columns = [
  {
    title: "Company",
    links: ["About Us", "Careers", "Press", "Contact"],
  },
  {
    title: "Discover",
    links: ["Browse Profiles", "Success Stories", "Membership Plans", "Mobile App"],
  },
  {
    title: "Support",
    links: ["Help Center", "Safety Tips", "Report a Concern", "FAQs"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Use", "Cookie Policy", "Trust & Safety"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-ink">
      <div className="wrap py-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white">
                <Heart size={18} fill="currentColor" />
              </span>
              <span className="font-display text-xl font-semibold">Humsafar</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted">
              Humsafar helps you find a compatible life partner with verified
              profiles, thoughtful matching, and private, respectful
              conversations.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-cream">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted hover:text-rose">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} Humsafar. All rights reserved.</p>
          <p>Made with care for meaningful connections.</p>
        </div>
      </div>
    </footer>
  );
}
