import { useState } from "react";
import { format } from "date-fns";
import { RefreshCw, Database, Clock, DollarSign, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAllMarketInsights, useGenerateMarketInsights } from "@/hooks/useMarketInsights";

// Plausible combinations for generation
const PLAUSIBLE_COMBINATIONS = [
  { industrySlug: "pharma-life-sciences", industryName: "Pharma & Life Sciences", categorySlug: "lab-supplies", categoryName: "Lab Supplies" },
  { industrySlug: "automotive-oem", industryName: "Automotive (OEM)", categorySlug: "raw-materials-steel", categoryName: "Raw Materials (Steel)" },
  { industrySlug: "retail", industryName: "Retail", categorySlug: "logistics-small-parcel", categoryName: "Logistics (Small Parcel)" },
  { industrySlug: "saas-enterprise", industryName: "SaaS (Enterprise)", categorySlug: "it-software-saas", categoryName: "IT Software (SaaS)" },
  { industrySlug: "healthcare", industryName: "Healthcare", categorySlug: "mro-maintenance", categoryName: "MRO (Maintenance)" },
];

export function MarketInsightsAdmin() {
  const { toast } = useToast();
  const { data: insights, isLoading: isLoadingInsights, refetch } = useAllMarketInsights();
  const { generate, isGenerating, generationResult } = useGenerateMarketInsights();

  const handleGenerateInsights = async () => {
    try {
      await generate(PLAUSIBLE_COMBINATIONS);
      toast({
        title: "Market Insights Generated",
        description: "Successfully generated new market insights.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Market Insights Knowledge Base
          </CardTitle>
          <CardDescription>
            Generate and manage AI-powered market intelligence for industry+category combinations.
            Each report costs approximately $0.005 via Perplexity Sonar Pro API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleGenerateInsights}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate 5 Market Insights
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Generates insights for: Pharma+Lab, Automotive+Steel, Retail+Logistics, SaaS+Software, Healthcare+MRO
            </p>
          </div>

          {/* Generation Result */}
          {generationResult && (
            <div className={`p-4 rounded-lg ${generationResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
              {generationResult.success && generationResult.summary ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Generation Complete</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span>{generationResult.summary.successful}/{generationResult.summary.total} successful</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{(generationResult.summary.processingTimeMs / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Tokens:</span>
                      <span>{generationResult.summary.totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{generationResult.summary.estimatedCost}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" />
                  <span>{generationResult.error}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Market Insights</CardTitle>
          <CardDescription>
            {insights?.length || 0} insights available in the knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : insights && insights.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Industry</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Citations</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insights.map((insight) => (
                  <TableRow key={insight.id}>
                    <TableCell className="font-medium">{insight.industry_name}</TableCell>
                    <TableCell>{insight.category_name}</TableCell>
                    <TableCell>
                      <Badge variant={insight.confidence_score >= 0.7 ? "default" : "secondary"}>
                        {Math.round(insight.confidence_score * 100)}%
                      </Badge>
                    </TableCell>
                    <TableCell>{insight.citations.length} sources</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(insight.created_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No market insights generated yet. Click "Generate 5 Market Insights" to create the first batch.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
