/**
 * Hook for accessing the EXOS testing database
 * 
 * Provides access to test prompts and reports for debugging
 * and analyzing the AI pipeline performance.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TestPrompt {
  id: string;
  scenario_type: string;
  scenario_data: Record<string, unknown>;
  industry_slug: string | null;
  category_slug: string | null;
  system_prompt: string;
  user_prompt: string;
  grounding_context: Record<string, unknown> | null;
  anonymization_metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TestReport {
  id: string;
  prompt_id: string;
  model: string;
  raw_response: string;
  validation_result: Record<string, unknown> | null;
  deanonymized_response: string | null;
  processing_time_ms: number | null;
  token_usage: Record<string, unknown> | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface TestPromptWithReport extends TestPrompt {
  test_reports: TestReport[];
}

/**
 * Fetch all test prompts with their reports
 */
export function useTestPrompts(limit = 50) {
  return useQuery({
    queryKey: ["test-prompts", limit],
    queryFn: async (): Promise<TestPromptWithReport[]> => {
      const { data, error } = await supabase
        .from("test_prompts")
        .select(`
          *,
          test_reports (*)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching test prompts:", error);
        throw error;
      }

      return (data || []) as TestPromptWithReport[];
    },
  });
}

/**
 * Fetch test prompts by scenario type
 */
export function useTestPromptsByScenario(scenarioType: string, limit = 20) {
  return useQuery({
    queryKey: ["test-prompts", scenarioType, limit],
    queryFn: async (): Promise<TestPromptWithReport[]> => {
      const { data, error } = await supabase
        .from("test_prompts")
        .select(`
          *,
          test_reports (*)
        `)
        .eq("scenario_type", scenarioType)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching test prompts:", error);
        throw error;
      }

      return (data || []) as TestPromptWithReport[];
    },
    enabled: !!scenarioType,
  });
}

/**
 * Fetch a single test prompt with its report
 */
export function useTestPrompt(promptId: string | null) {
  return useQuery({
    queryKey: ["test-prompt", promptId],
    queryFn: async (): Promise<TestPromptWithReport | null> => {
      if (!promptId) return null;

      const { data, error } = await supabase
        .from("test_prompts")
        .select(`
          *,
          test_reports (*)
        `)
        .eq("id", promptId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching test prompt:", error);
        throw error;
      }

      return data as TestPromptWithReport | null;
    },
    enabled: !!promptId,
  });
}

/**
 * Get test statistics
 */
export function useTestStats() {
  return useQuery({
    queryKey: ["test-stats"],
    queryFn: async () => {
      // Get prompt count
      const { count: promptCount, error: promptError } = await supabase
        .from("test_prompts")
        .select("*", { count: "exact", head: true });

      if (promptError) throw promptError;

      // Get report count and success rate
      const { data: reports, error: reportError } = await supabase
        .from("test_reports")
        .select("success, processing_time_ms");

      if (reportError) throw reportError;

      const successCount = reports?.filter(r => r.success).length || 0;
      const avgProcessingTime = reports?.length 
        ? Math.round(
            reports.reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / reports.length
          )
        : 0;

      return {
        totalPrompts: promptCount || 0,
        totalReports: reports?.length || 0,
        successRate: reports?.length 
          ? Math.round((successCount / reports.length) * 100) 
          : 0,
        avgProcessingTimeMs: avgProcessingTime,
      };
    },
  });
}
