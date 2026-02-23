import { describe, it, expect } from "vitest";
import { scenarios } from "@/lib/scenarios";
import {
  scenarioDashboardMapping,
  dashboardConfigs,
  type DashboardType,
} from "@/lib/dashboard-mappings";

const scenarioIds = scenarios.map((s) => s.id);
const validDashboardTypes = Object.keys(dashboardConfigs) as DashboardType[];

describe("scenarioDashboardMapping contract", () => {
  it("every scenario ID has a dashboard mapping", () => {
    for (const id of scenarioIds) {
      expect(
        scenarioDashboardMapping,
        `Scenario "${id}" is missing from scenarioDashboardMapping`
      ).toHaveProperty(id);
    }
  });

  it("each mapping has 2-4 valid dashboards", () => {
    for (const [key, dashboards] of Object.entries(scenarioDashboardMapping)) {
      expect(
        dashboards.length,
        `"${key}" has ${dashboards.length} dashboards (expected 2-4)`
      ).toBeGreaterThanOrEqual(2);
      expect(
        dashboards.length,
        `"${key}" has ${dashboards.length} dashboards (expected 2-4)`
      ).toBeLessThanOrEqual(4);

      for (const db of dashboards) {
        expect(
          validDashboardTypes,
          `"${key}" maps to invalid dashboard "${db}"`
        ).toContain(db);
      }
    }
  });

  it("no orphaned keys in mapping", () => {
    for (const key of Object.keys(scenarioDashboardMapping)) {
      expect(
        scenarioIds,
        `Mapping key "${key}" does not exist in scenarios`
      ).toContain(key);
    }
  });
});
