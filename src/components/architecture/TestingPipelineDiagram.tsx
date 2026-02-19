import React from "react";
import {
  Play,
  UserCircle,
  Bot,
  Database,
  Shield,
  Eye,
  Scale,
  Wrench,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
} from "lucide-react";
import ArchitectureNode from "./ArchitectureNode";
import ArchitectureContainer from "./ArchitectureContainer";
import ArchitectureArrow from "./ArchitectureArrow";

const COLORS = {
  orange: "#f59e0b",
  blue: "#3b82f6",
  green: "#10b981",
  purple: "#8b5cf6",
  red: "#ef4444",
  gray: "#64748b",
  amber: "#f59e0b",
};

const TestingPipelineDiagram: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 p-6 min-w-[700px]">
      {/* ── Trigger ── */}
      <ArchitectureNode
        icon={<Play size={28} />}
        label="Admin / CI-CD"
        sublabel="Triggers test batch"
        color={COLORS.orange}
      />

      <ArchitectureArrow direction="down" length={36} />

      {/* ── Phase 1: Synthesis Engine ── */}
      <ArchitectureContainer
        title="Phase 1: Synthesis Engine"
        titleColor={COLORS.orange}
        variant="dashed"
        className="w-full max-w-3xl"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Persona row */}
          <div className="flex items-start justify-center gap-8 flex-wrap">
            <ArchitectureNode
              icon={<UserCircle size={28} />}
              label="executive_sponsor"
              sublabel="Dump & Go"
              color={COLORS.orange}
            />
            <ArchitectureNode
              icon={<UserCircle size={28} />}
              label="solo_procurement_hero"
              sublabel="Mixed"
              color={COLORS.orange}
            />
            <ArchitectureNode
              icon={<UserCircle size={28} />}
              label="tactical_category_mgr"
              sublabel="Over-detailed"
              color={COLORS.orange}
            />
          </div>

          <ArchitectureArrow direction="down" length={32} label="Feed personas" />

          {/* AI Generator */}
          <ArchitectureNode
            icon={<Bot size={28} />}
            label="AI Data Generator"
            sublabel="Gemini 3.1"
            color={COLORS.orange}
          />

          <ArchitectureArrow direction="down" length={32} label="Raw Messy Prompts" />

          {/* test_prompts table */}
          <ArchitectureNode
            icon={<Database size={28} />}
            label="test_prompts"
            sublabel="DB Table"
            color={COLORS.gray}
          />
        </div>
      </ArchitectureContainer>

      <ArchitectureArrow direction="down" length={36} />

      {/* ── Phase 2: Execution Pipeline ── */}
      <ArchitectureContainer
        title="Phase 2: Execution Pipeline"
        titleColor={COLORS.blue}
        variant="dashed"
        className="w-full max-w-3xl"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Test Runner */}
          <ArchitectureNode
            icon={<Play size={28} />}
            label="Test Runner"
            sublabel="Fetches prompts"
            color={COLORS.blue}
          />

          <ArchitectureArrow direction="down" length={32} />

          {/* Sentinel node + retry badge */}
          <div className="relative">
            <ArchitectureNode
              icon={<Shield size={28} />}
              label="sentinel-analysis"
              sublabel="Edge Function"
              color={COLORS.blue}
            />
            {/* Retry badge */}
            <div className="absolute -top-2 -right-2 flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5">
              <RefreshCw size={10} className="text-red-500" />
              <span className="text-[8px] font-semibold text-red-600 whitespace-nowrap">
                Retry 503 / Fallback
              </span>
            </div>
          </div>

          <div className="flex items-start justify-center gap-12 flex-wrap">
            {/* Output to test_reports */}
            <div className="flex flex-col items-center gap-2">
              <ArchitectureArrow direction="down" length={32} label="Extracted JSON" />
              <ArchitectureNode
                icon={<Database size={28} />}
                label="test_reports"
                sublabel="DB Table"
                color={COLORS.gray}
              />
            </div>

            {/* Observability */}
            <div className="flex flex-col items-center gap-2">
              <ArchitectureArrow direction="down" length={32} label="Traces" dashed color={COLORS.purple} />
              <ArchitectureNode
                icon={<Eye size={28} />}
                label="LangSmith"
                sublabel="Observability"
                color={COLORS.purple}
              />
            </div>
          </div>
        </div>
      </ArchitectureContainer>

      <ArchitectureArrow direction="down" length={36} />

      {/* ── Phase 3: LLM Auditor ── */}
      <ArchitectureContainer
        title="Phase 3: LLM Auditor"
        titleColor={COLORS.purple}
        variant="dashed"
        className="w-full max-w-3xl"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Inputs label */}
          <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
            <span className="bg-gray-100 px-2 py-1 rounded">Extracted JSON</span>
            <span>+</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Target Success Criteria</span>
          </div>

          <ArchitectureArrow direction="down" length={24} />

          {/* AI Judge */}
          <ArchitectureNode
            icon={<Scale size={28} />}
            label="AI Judge"
            sublabel="Deep Reasoning"
            color={COLORS.purple}
          />

          <ArchitectureArrow direction="down" length={28} label="Evaluation Splits" />

          {/* 3 outcome boxes */}
          <div className="flex items-stretch justify-center gap-4 flex-wrap">
            {/* Green: REDUNDANT_HIDE */}
            <div className="border-l-4 border-green-500 bg-green-50 rounded-lg px-4 py-3 w-48">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-xs font-bold text-green-700">REDUNDANT_HIDE</span>
              </div>
              <p className="text-[10px] text-green-600 leading-snug">
                AI always gets this right. Safe to auto-hide from wizard.
              </p>
            </div>

            {/* Amber: OPTIONAL_KEEP */}
            <div className="border-l-4 border-amber-500 bg-amber-50 rounded-lg px-4 py-3 w-48">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-700">OPTIONAL_KEEP</span>
              </div>
              <p className="text-[10px] text-amber-600 leading-snug">
                Mixed results. Keep field but make optional in UI.
              </p>
            </div>

            {/* Red: CRITICAL_REQUIRE */}
            <div className="border-l-4 border-red-500 bg-red-50 rounded-lg px-4 py-3 w-48">
              <div className="flex items-center gap-1.5 mb-1">
                <XCircle size={14} className="text-red-600" />
                <span className="text-xs font-bold text-red-700">CRITICAL_REQUIRE</span>
              </div>
              <p className="text-[10px] text-red-600 leading-snug">
                AI fails to extract or hallucinates. Must require from user.
              </p>
            </div>
          </div>
        </div>
      </ArchitectureContainer>

      <ArchitectureArrow direction="down" length={36} />

      {/* ── Final Action ── */}
      <ArchitectureNode
        icon={<Wrench size={28} />}
        label="UI Refactoring Backlog"
        sublabel="GenericScenarioWizard"
        color={COLORS.green}
      />

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-4 border-t border-gray-200 w-full max-w-3xl">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.blue }} />
          <span className="text-xs text-gray-600">Production Systems</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.orange }} />
          <span className="text-xs text-gray-600">Simulated Data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.purple }} />
          <span className="text-xs text-gray-600">Evaluation Logic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 rounded border-2 border-dashed border-red-400" />
          <span className="text-xs text-gray-600">Fail / Retry</span>
        </div>
      </div>
    </div>
  );
};

export default TestingPipelineDiagram;
