import { FileText, Shield, Cloud, FileCheck, ArrowRight, ChevronRight } from "lucide-react";

const DataFlowDiagram = () => {
  const layers = [
    {
      id: 1,
      label: "Layer 1",
      title: "User Input",
      icon: FileText,
      items: ["Documents", "Supplier Data", "Context"],
    },
    {
      id: 2,
      label: "Layer 2",
      title: "EXOS Sentinel",
      subtitle: "Local Intelligence",
      icon: Shield,
      isHighlighted: true,
      items: [
        { step: "1", name: "Anonymizer", desc: "Masking" },
        { step: "2", name: "Grounding", desc: "Context Injection" },
        { step: "5", name: "Validator", desc: "Anti-Hallucination" },
        { step: "6", name: "De-Anonymizer", desc: "Restore Context" },
      ],
    },
    {
      id: 3,
      label: "Layer 3",
      title: "Prompt Factory",
      icon: FileText,
      items: ["XML Templates", "Chain-of-Experts Protocol"],
    },
    {
      id: 4,
      label: "Layer 4",
      title: "Cloud AI",
      subtitle: "Best-in-Class Models",
      icon: Cloud,
      items: ["Auditor", "Optimizer", "Strategist"],
    },
    {
      id: 5,
      label: "Layer 5",
      title: "Output",
      icon: FileCheck,
      items: ["Validated Report", "Actionable Insights"],
    },
  ];

  return (
    <div className="relative">
      {/* Desktop Schematic Flow */}
      <div className="hidden lg:block">
        <div className="relative bg-muted/20 border border-border/50 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-mono text-muted-foreground tracking-wider">
              EXOS ARCHITECTURE v2.0
            </span>
          </div>

          {/* Flow Diagram */}
          <div className="flex items-stretch justify-between gap-2">
            {layers.map((layer, index) => (
              <div key={layer.id} className="flex items-center flex-1">
                {/* Layer Box */}
                <div
                  className={`flex-1 rounded-xl border-2 p-4 transition-all ${
                    layer.isHighlighted
                      ? "border-primary bg-primary/5"
                      : "border-border/60 bg-background/50"
                  }`}
                >
                  {/* Layer Label */}
                  <div className="text-center mb-3">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      {layer.label}
                    </span>
                    <h4 className="font-display font-semibold text-foreground text-sm">
                      {layer.title}
                    </h4>
                    {layer.subtitle && (
                      <span className="text-[10px] text-muted-foreground">
                        ({layer.subtitle})
                      </span>
                    )}
                  </div>

                  {/* Layer Content */}
                  <div className="space-y-1.5">
                    {layer.isHighlighted
                      ? (layer.items as Array<{ step: string; name: string; desc: string }>).map(
                          (item) => (
                            <div
                              key={item.step}
                              className="flex items-center gap-2 px-2 py-1 rounded bg-primary/10 border border-primary/20"
                            >
                              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                                {item.step}
                              </span>
                              <div className="min-w-0">
                                <span className="text-[10px] font-medium text-foreground block truncate">
                                  {item.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground block truncate">
                                  {item.desc}
                                </span>
                              </div>
                            </div>
                          )
                        )
                      : (layer.items as string[]).map((item) => (
                          <div
                            key={item}
                            className="px-2 py-1 rounded bg-muted/50 border border-border/30"
                          >
                            <span className="text-[10px] text-foreground/80">{item}</span>
                          </div>
                        ))}
                  </div>
                </div>

                {/* Arrow Connector */}
                {index < layers.length - 1 && (
                  <div className="flex-shrink-0 px-1">
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Flow Lines Decoration */}
          <div className="absolute top-1/2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent -z-10" />
        </div>
      </div>

      {/* Mobile Schematic Flow */}
      <div className="lg:hidden">
        <div className="bg-muted/20 border border-border/50 rounded-xl p-4">
          <div className="text-center mb-4">
            <span className="text-xs font-mono text-muted-foreground tracking-wider">
              EXOS ARCHITECTURE v2.0
            </span>
          </div>

          <div className="space-y-3">
            {layers.map((layer, index) => (
              <div key={layer.id}>
                <div
                  className={`rounded-lg border-2 p-3 ${
                    layer.isHighlighted
                      ? "border-primary bg-primary/5"
                      : "border-border/60 bg-background/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {layer.label}
                    </span>
                    <span className="font-display font-semibold text-foreground text-sm">
                      {layer.title}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {layer.isHighlighted
                      ? (layer.items as Array<{ step: string; name: string; desc: string }>).map(
                          (item) => (
                            <span
                              key={item.step}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 border border-primary/20"
                            >
                              <span className="w-3 h-3 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                                {item.step}
                              </span>
                              <span className="text-[10px] text-foreground">{item.name}</span>
                            </span>
                          )
                        )
                      : (layer.items as string[]).map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 rounded bg-muted/50 border border-border/30 text-[10px] text-foreground/80"
                          >
                            {item}
                          </span>
                        ))}
                  </div>
                </div>

                {index < layers.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowDiagram;
