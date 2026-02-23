import React, { useState, useCallback, useMemo } from "react";
import { PlayCircle, CheckCircle2, XCircle, LayoutGrid } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { scenarios } from "@/lib/scenarios";
import {
  dashboardConfigs,
  scenarioDashboardMapping,
  type DashboardType,
} from "@/lib/dashboard-mappings";
import DashboardRenderer from "@/components/reports/DashboardRenderer";

// --- Error Boundary ---
interface EBProps {
  onError: (err: Error) => void;
  children: React.ReactNode;
}
interface EBState {
  hasError: boolean;
}

class DashboardErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// --- Types ---
interface SmokeResult {
  dashboardType: DashboardType;
  name: string;
  status: "pass" | "fail";
  timeMs: number;
  error?: string;
}

const ALL_DASHBOARD_TYPES = Object.keys(dashboardConfigs) as DashboardType[];

// --- Smoke Test Runner ---
function SmokeTestRunner({
  results,
  onResult,
}: {
  results: SmokeResult[];
  onResult: (r: SmokeResult) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);

  const handleError = useCallback(
    (dt: DashboardType, name: string, start: number) => (err: Error) => {
      onResult({
        dashboardType: dt,
        name,
        status: "fail",
        timeMs: performance.now() - start,
        error: err.message,
      });
    },
    [onResult]
  );

  // When currentIdx changes, schedule the mount measurement
  React.useEffect(() => {
    if (currentIdx === null) return;
    const dt = ALL_DASHBOARD_TYPES[currentIdx];
    const cfg = dashboardConfigs[dt];
    const start = performance.now();

    // Give React a frame to mount the component
    const timer = setTimeout(() => {
      // If we get here, the component mounted successfully
      const alreadyFailed = results.find(
        (r) => r.dashboardType === dt && r.status === "fail"
      );
      if (!alreadyFailed) {
        onResult({
          dashboardType: dt,
          name: cfg.name,
          status: "pass",
          timeMs: performance.now() - start,
        });
      }
      // Move to next
      if (currentIdx < ALL_DASHBOARD_TYPES.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setCurrentIdx(null);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentIdx, onResult, results, handleError]);

  const isRunning = currentIdx !== null;
  const currentDt =
    currentIdx !== null ? ALL_DASHBOARD_TYPES[currentIdx] : null;

  return (
    <>
      {isRunning && currentDt && (
        <div className="sr-only" aria-hidden="true">
          <DashboardErrorBoundary
            key={currentDt}
            onError={handleError(
              currentDt,
              dashboardConfigs[currentDt].name,
              performance.now()
            )}
          >
            <DashboardRenderer
              dashboardType={currentDt}
              analysisResult="{}"
              formData={{}}
            />
          </DashboardErrorBoundary>
        </div>
      )}
      <Button
        onClick={() => setCurrentIdx(0)}
        disabled={isRunning}
        className="gap-2"
      >
        <PlayCircle className="w-4 h-4" />
        {isRunning ? `Testing ${(currentIdx ?? 0) + 1}/${ALL_DASHBOARD_TYPES.length}...` : "Run Smoke Test"}
      </Button>
    </>
  );
}

// --- Main Component ---
const DashboardSmokeTest = () => {
  const [results, setResults] = useState<SmokeResult[]>([]);

  const handleResult = useCallback((r: SmokeResult) => {
    setResults((prev) => {
      // Avoid duplicates
      if (prev.find((p) => p.dashboardType === r.dashboardType)) return prev;
      return [...prev, r];
    });
  }, []);

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;

  // --- Coverage Matrix Stats ---
  const coverageStats = useMemo(() => {
    const scenarioIds = scenarios.map((s) => s.id);
    const mappedScenarios = scenarioIds.filter(
      (id) => scenarioDashboardMapping[id]?.length > 0
    );
    const usedDashboards = new Set<string>();
    let totalMappings = 0;
    Object.values(scenarioDashboardMapping).forEach((dbs) => {
      dbs.forEach((d) => usedDashboards.add(d));
      totalMappings += dbs.length;
    });
    return {
      scenarioIds,
      mappedCount: mappedScenarios.length,
      totalScenarios: scenarioIds.length,
      dashboardsUsed: usedDashboards.size,
      totalDashboards: ALL_DASHBOARD_TYPES.length,
      totalMappings,
    };
  }, []);

  return (
    <Tabs defaultValue="smoke" className="space-y-4">
      <TabsList>
        <TabsTrigger value="smoke">Smoke Test</TabsTrigger>
        <TabsTrigger value="coverage">Coverage Matrix</TabsTrigger>
      </TabsList>

      {/* Tab A: Smoke Test */}
      <TabsContent value="smoke">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Dashboard Render Smoke Test
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Mounts each of the {ALL_DASHBOARD_TYPES.length} dashboard
              components inside an Error Boundary and reports pass/fail.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <SmokeTestRunner results={results} onResult={handleResult} />
              {results.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {passCount}/{ALL_DASHBOARD_TYPES.length} passed
                  {failCount > 0 && (
                    <span className="text-destructive ml-2">
                      ({failCount} failed)
                    </span>
                  )}
                </span>
              )}
            </div>

            {results.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dashboard</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Mount Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ALL_DASHBOARD_TYPES.map((dt) => {
                    const r = results.find((x) => x.dashboardType === dt);
                    if (!r) return null;
                    return (
                      <TableRow key={dt}>
                        <TableCell className="font-medium">
                          {dashboardConfigs[dt].name}
                        </TableCell>
                        <TableCell>
                          {r.status === "pass" ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              PASS
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              FAIL
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {r.timeMs.toFixed(0)}ms
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tab B: Coverage Matrix */}
      <TabsContent value="coverage">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutGrid className="w-5 h-5 text-primary" />
              Scenario → Dashboard Coverage Matrix
            </CardTitle>
            <div className="flex flex-wrap gap-3 mt-2">
              <Badge variant="outline">
                {coverageStats.mappedCount}/{coverageStats.totalScenarios}{" "}
                Scenarios Mapped
              </Badge>
              <Badge variant="outline">
                {coverageStats.dashboardsUsed}/{coverageStats.totalDashboards}{" "}
                Dashboards Used
              </Badge>
              <Badge variant="outline">
                Total Mappings: {coverageStats.totalMappings}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[180px]">
                      Scenario
                    </TableHead>
                    {ALL_DASHBOARD_TYPES.map((dt) => (
                      <TableHead
                        key={dt}
                        className="text-center text-[10px] px-1 min-w-[60px]"
                      >
                        {dashboardConfigs[dt].name
                          .split(" ")
                          .map((w) => w.slice(0, 4))
                          .join(" ")}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scenarios.map((s) => {
                    const mapped = scenarioDashboardMapping[s.id] || [];
                    const isMapped = mapped.length > 0;
                    return (
                      <TableRow
                        key={s.id}
                        className={!isMapped ? "bg-amber-50/50" : ""}
                      >
                        <TableCell
                          className={`sticky left-0 bg-background z-10 text-xs font-medium ${
                            !isMapped ? "text-amber-700" : ""
                          }`}
                        >
                          {s.title}
                          {!isMapped && (
                            <span className="ml-1 text-[10px] text-amber-500">
                              (unmapped)
                            </span>
                          )}
                        </TableCell>
                        {ALL_DASHBOARD_TYPES.map((dt) => (
                          <TableCell key={dt} className="text-center p-1">
                            {mapped.includes(dt) ? (
                              <div className="w-3 h-3 rounded-full bg-green-500 mx-auto" />
                            ) : null}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardSmokeTest;
