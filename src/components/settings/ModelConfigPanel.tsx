import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, CheckCircle2, AlertCircle, Cpu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useModelConfig } from "@/contexts/ModelConfigContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const GOOGLE_MODELS = [
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Reasoning Powerhouse" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Speed/Cost efficiency" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Latest generation" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "Newest experimental" },
];

export function ModelConfigPanel() {
  const { provider, model, lastTested, setProvider, setModel, markTested } = useModelConfig();
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("sentinel-analysis", {
        body: {
          systemPrompt: "Respond with exactly: OK",
          userPrompt: "Connection test",
          useGoogleAIStudio: true,
          googleModel: model,
          enableTestLogging: false,
        },
      });

      if (error) {
        throw new Error(error.message || "Connection test failed");
      }

      // Check if response indicates success
      if (data?.success || data?.result) {
        markTested();
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${model}`,
        });
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        markTested();
        toast({
          title: "Connection Successful",
          description: `Model ${model} is responding`,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Connection Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getLastTestedText = () => {
    if (!lastTested) return "Not tested";
    try {
      return `Last tested ${formatDistanceToNow(new Date(lastTested), { addSuffix: true })}`;
    } catch {
      return "Not tested";
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          <CardTitle className="font-display text-lg">AI Model Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure the AI provider and model for Sentinel analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Provider</Label>
          <RadioGroup
            value={provider}
            onValueChange={(value) => setProvider(value as "lovable" | "google_ai_studio")}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="lovable" id="provider-lovable" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="provider-lovable" className="font-medium cursor-pointer">
                  Managed (Lovable Gateway)
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Free tier, no setup required
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="google_ai_studio" id="provider-google" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="provider-google" className="font-medium cursor-pointer">
                  Custom (Google AI Studio)
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Uses your BYOK API key
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Model Selection (visible only when Google AI Studio is selected) */}
        {provider === "google_ai_studio" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <Label htmlFor="model-select" className="text-sm font-medium">
              Model
            </Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model-select" className="bg-background">
                <SelectValue placeholder="Select a model..." />
              </SelectTrigger>
              <SelectContent>
                {GOOGLE_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex flex-col">
                      <span>{m.label}</span>
                      <span className="text-xs text-muted-foreground">{m.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Test Connection */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="gap-2"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : lastTested ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                )}
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>
              <span className="text-xs text-muted-foreground">
                {getLastTestedText()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
