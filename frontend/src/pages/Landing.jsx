import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Star, Sparkles, Lock, Users, Bell, Globe } from "lucide-react";
import LiveCounter from "../components/LiveCounter";
import ProfileCard from "../components/ProfileCard";
import EmptyState from "../components/EmptyState";
import { api } from "../lib/api";
import {
  howItWorks,
  whyFeatures,
  successStories,
  plans,
} from "../data/mockData";

const featureIcons = [ShieldCheck, Sparkles, Lock, Users, Bell, Globe];

export default function Landing() {
  const location = useLocation();
  const [stats, setStats] = useState({ memberCount: 0, successStories: 0 });
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
    api
      .featured()
      .then((res) => setFeatured(res.profiles || []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));
  }, []);

  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (!targetId) return;
    // Wait a tick for the sections to actually be in the DOM.
    const timer = setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => clearTimeout(timer);
  }, [location.state]);

  return (
    <>
      {/* HERO */}
      <section className="wrap grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-1.5 text-xs text-muted">
            <ShieldCheck size={14} className="text-rose" />
            100% verified profiles • Trusted by families
          </span>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.1] text-balance md:text-6xl">
            Find the one who feels like home.
          </h1>

          <p className="mt-6 max-w-lg text-muted">
            Humsafar brings together sincere people looking for meaningful,
            lifelong companionship. Thoughtful matches, verified profiles,
            and conversations that respect your values.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-full bg-rose px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose/30 transition hover:bg-rose-dark"
            >
              Create Free Profile
            </Link>
            <Link
              to="/browse"
              className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-cream transition hover:border-rose"
            >
              Browse Matches
            </Link>
          </div>

          <div className="mt-12 flex gap-10">
            <div>
              <p className="font-display text-3xl font-semibold">
                <LiveCounter end={stats.memberCount} />
              </p>
              <p className="text-sm text-muted">
                {stats.memberCount === 0 ? "Be our first member" : "Members"}
              </p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold">
                <LiveCounter end={stats.successStories} />
              </p>
              <p className="text-sm text-muted">Mutual matches made</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold">100%</p>
              <p className="text-sm text-muted">Verified sign-up</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-border/60">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=80&auto=format&fit=crop"
              alt="Newly married couple smiling together"
              className="h-[520px] w-full object-cover"
            />
          </div>
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-2xl bg-ink/90 px-4 py-3 shadow-xl">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} fill="currentColor" />
              ))}
            </div>
            <span className="ml-1 text-xs font-medium text-cream">
              Built for real connections
            </span>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-ink/90 px-4 py-3 shadow-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose/20 text-rose">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-cream">Verified &amp; Secure</p>
              <p className="text-xs text-muted">ID-checked members only</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-t border-border/60 bg-surface/40 py-20">
        <div className="wrap text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose">
            How it works
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold">
            Your journey to the right match
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Four simple steps designed to help you find a partner who truly
            fits your life.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {howItWorks.map((step) => (
              <div
                key={step.step}
                className="rounded-2xl border border-border/60 p-6 text-left"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/15 text-rose">
                    <Sparkles size={18} />
                  </span>
                  <span className="font-display text-2xl text-border">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED MEMBERS */}
      <section className="py-20">
        <div className="wrap">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-rose">
                Featured members
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold">
                Meet people looking for forever
              </h2>
            </div>
            <Link
              to="/browse"
              className="hidden text-sm font-medium text-cream hover:text-rose md:block"
            >
              View all profiles →
            </Link>
          </div>

          {!loadingFeatured && featured.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No members yet — you could be the first"
                desc="Humsafar just launched. Create the first profile and be part of founding the community."
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProfileCard key={p._id} profile={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY HUMSAFAR */}
      <section className="border-t border-border/60 bg-surface/40 py-20">
        <div className="wrap text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose">
            Why Humsafar
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-semibold">
            Built on trust, designed for meaningful matches
          </h2>

          <div className="mt-12 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
            {whyFeatures.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={f.title} className="rounded-2xl border border-border/60 p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose/15 text-rose">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section id="success-stories" className="py-20">
        <div className="wrap text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose">
            Success stories
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold">
            Real couples, real beginnings
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted">
            Illustrative examples of the kind of connections Humsafar is
            built for — your own story could be the first real one featured
            here.
          </p>

          <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
            {successStories.map((s) => (
              <div key={s.names} className="rounded-2xl border border-border/60 p-6">
                <p className="font-display text-3xl text-gold">“</p>
                <p className="text-sm text-muted">{s.quote}</p>
                <div className="mt-6 border-t border-border/60 pt-4">
                  <p className="font-display font-semibold">{s.names}</p>
                  <p className="text-xs text-muted">{s.place}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section id="membership" className="border-t border-border/60 bg-surface/40 py-20">
        <div className="wrap text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-rose">
            Membership
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold">
            Choose the plan that fits your search
          </h2>

          <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? "border-rose bg-surface"
                    : "border-border/60"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-8 rounded-full bg-rose px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                <p className="mt-6 font-display text-3xl font-semibold">
                  {plan.price}
                  <span className="ml-1 text-sm font-normal text-muted">
                    {plan.period}
                  </span>
                </p>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted">
                      <span className="mt-0.5 text-rose">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-rose text-white hover:bg-rose-dark"
                      : "border border-border text-cream hover:border-rose"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="wrap py-20">
        <div className="rounded-3xl bg-rose px-8 py-16 text-center text-white">
          <h2 className="font-display text-4xl font-semibold text-balance">
            Your Humsafar could be just one hello away
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Join millions who found love, companionship, and lifelong
            partnership. Creating your profile is completely free.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black"
            >
              Create Free Profile
            </Link>
            <Link
              to="/browse"
              className="rounded-full border border-white/70 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Matches
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
