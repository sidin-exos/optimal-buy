import { DashboardType } from "@/lib/dashboard-mappings";

// Dashboard components
import ActionChecklistDashboard from "./ActionChecklistDashboard";
import DecisionMatrixDashboard from "./DecisionMatrixDashboard";
import CostWaterfallDashboard from "./CostWaterfallDashboard";
import TimelineRoadmapDashboard from "./TimelineRoadmapDashboard";
import KraljicQuadrantDashboard from "./KraljicQuadrantDashboard";
import TCOComparisonDashboard from "./TCOComparisonDashboard";
import LicenseTierDashboard from "./LicenseTierDashboard";
import SensitivitySpiderDashboard from "./SensitivitySpiderDashboard";
import RiskMatrixDashboard from "./RiskMatrixDashboard";
import ScenarioComparisonDashboard from "./ScenarioComparisonDashboard";
import SupplierPerformanceDashboard from "./SupplierPerformanceDashboard";
import SOWAnalysisDashboard from "./SOWAnalysisDashboard";
import NegotiationPrepDashboard from "./NegotiationPrepDashboard";
import DataQualityDashboard from "./DataQualityDashboard";

interface DashboardRendererProps {
  dashboardType: DashboardType;
  scenarioTitle?: string;
  analysisResult?: string;
  formData?: Record<string, string>;
}

/**
 * Renders the appropriate dashboard component based on type.
 * In the future, this can be enhanced to parse analysisResult
 * and extract data specific to each dashboard type.
 */
const DashboardRenderer = ({
  dashboardType,
  scenarioTitle,
  analysisResult,
  formData,
}: DashboardRendererProps) => {
  // Map dashboard types to their components
  // Currently uses default data; can be enhanced to parse analysisResult
  switch (dashboardType) {
    case "action-checklist":
      return <ActionChecklistDashboard />;
    
    case "decision-matrix":
      return <DecisionMatrixDashboard />;
    
    case "cost-waterfall":
      return <CostWaterfallDashboard />;
    
    case "timeline-roadmap":
      return <TimelineRoadmapDashboard />;
    
    case "kraljic-quadrant":
      return <KraljicQuadrantDashboard />;
    
    case "tco-comparison":
      return <TCOComparisonDashboard />;
    
    case "license-tier":
      return <LicenseTierDashboard />;
    
    case "sensitivity-spider":
      return <SensitivitySpiderDashboard />;
    
    case "risk-matrix":
      return <RiskMatrixDashboard />;
    
    case "scenario-comparison":
      return <ScenarioComparisonDashboard />;
    
    case "supplier-scorecard":
      return <SupplierPerformanceDashboard />;
    
    case "sow-analysis":
      return <SOWAnalysisDashboard />;
    
    case "negotiation-prep":
      return <NegotiationPrepDashboard />;
    
    case "data-quality":
      return <DataQualityDashboard />;
    
    default:
      return (
        <div className="p-4 rounded-lg border border-border bg-secondary/20 text-center">
          <p className="text-muted-foreground">
            Dashboard "{dashboardType}" is not yet implemented
          </p>
        </div>
      );
  }
};

export default DashboardRenderer;
