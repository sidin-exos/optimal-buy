import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Brain, Database, ArrowRight, Lock, Sparkles, FileCheck, Eye, Quote, TrendingUp, Shield, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavLink } from "@/components/NavLink";
import { Badge } from "@/components/ui/badge";
import DataFlowDiagram from "@/components/features/DataFlowDiagram";
import SentinelCapabilities from "@/components/features/SentinelCapabilities";
import { useThemedLogo } from "@/hooks/useThemedLogo";

const successStories = [
  {
    company: "MedTech Solutions GmbH",
    industry: "Medical Devices",
    scenarios: ["TCO Analysis", "Make-or-Buy"],
    quote: "EXOS revealed hidden logistics costs we'd been overlooking for years. The TCO breakdown across our 12 hospital supply chains was eye-opening—we renegotiated three major contracts within weeks.",
    person: "Dr. Katrin Schäfer, Head of Strategic Procurement",
    metric: "18%",
    metricLabel: "Cost savings on surgical instrument procurement",
    icon: TrendingUp,
  },
  {
    company: "NordSteel Industries AB",
    industry: "Heavy Industry",
    scenarios: ["Black Swan Simulation", "Supplier Risk Assessment"],
    quote: "When our primary tungsten supplier faced EU regulatory action, EXOS had already flagged the risk two months prior. The contingency plans we'd built using the Black Swan module kept our production lines running.",
    person: "Erik Lindqvist, VP Supply Chain",
    metric: "6-week",
    metricLabel: "Production halt avoided",
    icon: Shield,
  },
  {
    company: "CleanTech Mobility SAS",
    industry: "Automotive / Green Mobility",
    scenarios: ["Consolidation Wizard", "Negotiation Prep"],
    quote: "Going from 47 component suppliers to 12 strategic partners sounded impossible. EXOS mapped the consolidation path, prepared our negotiation briefs, and we closed the transition in one quarter.",
    person: "Amélie Durand, Chief Procurement Officer",
    metric: "35%",
    metricLabel: "Admin overhead reduction",
    icon: Users,
  },
];

const Features = () => {
  const exosLogo = useThemedLogo();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    }
  }, [location.hash]);

  const valuePropositions = [
    {
      icon: Brain,
      title: "29 Procurement Scenarios",
      description: "Purpose-built AI models for high-stakes procurement decisions. From cost optimization to risk simulation—each scenario is fine-tuned on proven methodologies.",
      highlights: [
        "Make-or-Buy & TCO analysis",
        "Supplier dependency & exit planning",
        "Black Swan scenario simulation",
        "SOW & specification optimization"
      ]
    },
    {
      icon: Database,
      title: "Real-Time Market Intelligence",
      description: "Ground every analysis with live market data. Our system queries real-time sources for supplier news, M&A activity, commodity trends, and regulatory changes—then injects this into your analysis.",
      highlights: [
        "Live supplier & category intelligence",
        "30+ industry grounding profiles",
        "30+ category strategy frameworks",
        "Cited sources for full transparency"
      ]
    },
    {
      icon: Lock,
      title: "Commercial Data Safety",
      description: "Your sensitive commercial data—supplier names, pricing, contract terms—is semantically anonymized before reaching any external API. After AI processing, full context is restored on the way back.",
      highlights: [
        "Semantic anonymization of commercial data",
        "PII and financial identifier masking",
        "Enterprise InfoSec Gate for traffic audit",
        "Full data restoration after AI processing"
      ],
      link: "/architecture"
    }
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      
      <Header />
      
      <main className="container py-8 relative">
        {/* Hero Section */}
        <section className="mb-16 animate-fade-up text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-xl">
              <img src={exosLogo} alt="EXOS" className="w-full h-full object-cover scale-[1.3]" />
            </div>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How <span className="text-gradient">EXOS</span> Works
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enterprise-grade AI analysis with privacy-first architecture. 
            Your sensitive data stays protected while you get powerful insights.
          </p>
        </section>

        {/* Value Propositions */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valuePropositions.map((prop, index) => (
              <Card 
                key={prop.title} 
                className="card-elevated animate-fade-up border-border/50"
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <prop.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="font-display text-xl">{prop.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {prop.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prop.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-sm text-foreground/80">
                        <ArrowRight className="w-3 h-3 text-primary flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  {"link" in prop && prop.link && (
                    <NavLink
                      to={prop.link as string}
                      className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Know more about EXOS architecture and data flow
                      <ArrowRight className="w-3 h-3" />
                    </NavLink>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Sentinel Capabilities Section */}
        <section id="orchestration" className="mb-20 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Fine-Tuned <span className="text-gradient">AI Agentic Orchestration</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our custom-trained intelligence layer validates, enriches, and orchestrates 
              best-in-class cloud AI—ensuring every recommendation is grounded in your reality.
            </p>
          </div>
          
          <SentinelCapabilities />
        </section>

        {/* Data Flow Section */}
        <section id="dataflow" className="mb-20 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Privacy-First <span className="text-gradient">Data Flow</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your data passes through multiple protection layers before reaching cloud AI, 
              ensuring sensitive commercial information never leaves your control.
            </p>
          </div>
          
          <DataFlowDiagram />
        </section>

        {/* Customer Success Stories Section */}
        <section id="success" className="mb-16 animate-fade-up" style={{ animationDelay: "500ms" }}>
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Customer <span className="text-gradient">Success Stories</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See how EU procurement teams use EXOS to prevent value leakage, 
              manage supply chain risk, and drive measurable savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <Card
                key={story.company}
                className="card-elevated border-border/50 animate-fade-up"
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-copper/15 flex items-center justify-center">
                      <story.icon className="w-5 h-5 text-copper" />
                    </div>
                    <Badge variant="outline" className="text-iris border-iris/30 bg-iris/10 text-xs">
                      {story.industry}
                    </Badge>
                  </div>
                  <CardTitle className="font-display text-lg">{story.company}</CardTitle>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {story.scenarios.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs bg-info/10 text-info border-info/20">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative pl-4 border-l-2 border-primary/30">
                    <Quote className="w-4 h-4 text-muted-foreground/40 absolute -left-2 -top-1 bg-card" />
                    <p className="text-sm text-foreground/80 italic leading-relaxed">
                      "{story.quote}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">
                      — {story.person}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-border/50 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary font-display">{story.metric}</span>
                    <span className="text-xs text-muted-foreground">{story.metricLabel}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
