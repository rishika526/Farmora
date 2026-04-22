import { useEffect } from "react";
import { useLocation } from "wouter";

const sections = [
  {
    id: "community-guidelines",
    title: "Community Guidelines",
    content:
      "Be respectful and constructive. Share safe, evidence-based organic farming practices and avoid harmful or misleading claims.",
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    content:
      "Farmora uses your activity data to improve recommendations and product experiences. We do not sell your personal data.",
  },
  {
    id: "terms-of-service",
    title: "Terms of Service",
    content:
      "By using Farmora, you agree to use the platform responsibly and understand that educational content is not a substitute for professional agronomy advice.",
  },
];

export default function PoliciesPage() {
  const [location] = useLocation();

  useEffect(() => {
    const hash = location.split("#")[1];
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);

  return (
    <div className="container px-4 py-12 min-h-screen">
      <div className="max-w-4xl space-y-10">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Policies & Guidelines</h1>
          <p className="text-muted-foreground">
            Use the footer links to jump directly to the section you need.
          </p>
        </div>

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6 space-y-3"
          >
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
