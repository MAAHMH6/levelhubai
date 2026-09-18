import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Fallback static list just in case fetching fails
const FALLBACK_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", isFree: true, isEmbedding: false },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", isFree: false, isEmbedding: false },
  { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B (Free)", isFree: true, isEmbedding: false },
  { id: "google/gemma-2-9b-it:free", name: "Gemma 2 9B (Free)", isFree: true, isEmbedding: false },
  { id: "openai/text-embedding-3-small", name: "OpenAI Text Embedding 3 Small", isFree: false, isEmbedding: true },
  { id: "openai/text-embedding-3-large", name: "OpenAI Text Embedding 3 Large", isFree: false, isEmbedding: true },
  { id: "cohere/embed-english-v3.0", name: "Cohere Embed English v3.0", isFree: false, isEmbedding: true },
  { id: "liquid/lfm-2.5-embedding-350m:free", name: "Liquid LFM 2.5 Embedding 350M (Free)", isFree: true, isEmbedding: true },
  { id: "nvidia/nemotron-3-embed-1b:free", name: "NVIDIA Nemotron 3 Embed 1B (Free)", isFree: true, isEmbedding: true },
  { id: "nvidia/llama-nemotron-embed-vl-1b-v2:free", name: "NVIDIA Llama Nemotron Embed VL 1B v2 (Free)", isFree: true, isEmbedding: true }
];

export default function AIManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  
  const [baseURL, setBaseURL] = useState("https://openrouter.ai/api/v1");
  const [apiKey, setApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  
  const [textModelOpen, setTextModelOpen] = useState(false);
  const [embeddingsModelOpen, setEmbeddingsModelOpen] = useState(false);
  
  const [textModel, setTextModel] = useState("google/gemini-2.5-flash");
  const [chatModel, setChatModel] = useState("google/gemini-2.5-flash");
  const [quizModel, setQuizModel] = useState("google/gemini-2.5-flash");
  const [indexingModel, setIndexingModel] = useState("google/gemini-2.5-flash");
  const [embeddingsModel, setEmbeddingsModel] = useState("openai/text-embedding-3-small");
  const [showFreeModelsOnly, setShowFreeModelsOnly] = useState(false);
  
  const [availableModels, setAvailableModels] = useState<{id: string, name: string, isFree?: boolean, isEmbedding?: boolean}[]>([]);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'ai_configuration')
        .single();
        
      if (data && data.value) {
        const config = data.value as any;
        if (config.baseURL) setBaseURL(config.baseURL);
        if (config.textModel) {
          setTextModel(config.textModel);
          // Set defaults for specific models if they aren't configured yet
          setChatModel(config.chatModel || config.textModel);
          setQuizModel(config.quizModel || config.textModel);
          setIndexingModel(config.indexingModel || config.textModel);
        }
        if (config.embeddingsModel) setEmbeddingsModel(config.embeddingsModel);
      }
    } catch (error) {
      console.error("Failed to load AI config", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    setFetchingModels(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-models', {
        body: { baseURL }
      });
      
      if (error) throw error;
      
      if (data && data.ok && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => {
          const isFree = m.pricing?.prompt === "0" && m.pricing?.completion === "0";
          const isEmbedding = m.architecture?.modality === "text->embedding" || 
                              m.id.toLowerCase().includes("embedding") || 
                              m.id.toLowerCase().includes("bge");
          return { id: m.id, name: m.name || m.id, isFree, isEmbedding };
        });
        setAvailableModels(models);
        toast.success(`Fetched ${models.length} models successfully!`);
      } else {
        throw new Error(data?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to fetch models", error);
      toast.error("Failed to fetch models. Did you save your API key?");
      setAvailableModels(FALLBACK_MODELS); // fallback so UI isn't completely broken
    } finally {
      setFetchingModels(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      // 1. Save the public config (baseURL, textModel, embeddingsModel)
      const config = {
        baseURL,
        textModel,
        chatModel,
        quizModel,
        indexingModel,
        embeddingsModel,
        provider: "custom"
      };
      
      const { error: publicError } = await supabase
        .from('app_settings')
        .upsert({ 
          key: 'ai_configuration', 
          value: config 
        });
        
      if (publicError) throw publicError;

      // 2. Save the API Keys securely if they were changed
      if (apiKey.trim() || openaiApiKey.trim()) {
        const updateData: any = {};
        if (apiKey.trim()) updateData.apiKey = apiKey.trim();
        if (openaiApiKey.trim()) updateData.openaiApiKey = openaiApiKey.trim();

        // Need to merge with existing private settings since we only want to update the ones provided
        const { data: existingPrivate } = await supabase
          .from('private_app_settings')
          .select('value')
          .eq('key', 'ai_provider_key')
          .single();
          
        const mergedPrivate = { ...(existingPrivate?.value || {}), ...updateData };

        const { error: privateError } = await supabase
          .from('private_app_settings')
          .upsert({ 
            key: 'ai_provider_key', 
            value: mergedPrivate 
          });
          
        if (privateError) {
          console.error("Private settings error (you must be an admin)", privateError);
          toast.error("Failed to save API Key securely.");
        } else {
          if (apiKey.trim()) setApiKey(""); 
          if (openaiApiKey.trim()) setOpenaiApiKey("");
        }
      }

      toast.success("AI Configuration saved successfully!");
    } catch (error) {
      console.error("Failed to save AI config", error);
      toast.error("Failed to save AI configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading AI Configuration...</div>;
  }

  // Ensure selected models are in the dropdown list even if not fetched yet
  const displayedModels = [...availableModels];
  if (!displayedModels.find(m => m.id === textModel) && textModel) {
    displayedModels.push({ id: textModel, name: textModel, isFree: false, isEmbedding: false });
  }
  if (!displayedModels.find(m => m.id === chatModel) && chatModel) {
    displayedModels.push({ id: chatModel, name: chatModel, isFree: false, isEmbedding: false });
  }
  if (!displayedModels.find(m => m.id === quizModel) && quizModel) {
    displayedModels.push({ id: quizModel, name: quizModel, isFree: false, isEmbedding: false });
  }
  if (!displayedModels.find(m => m.id === indexingModel) && indexingModel) {
    displayedModels.push({ id: indexingModel, name: indexingModel, isFree: false, isEmbedding: false });
  }
  if (!displayedModels.find(m => m.id === embeddingsModel) && embeddingsModel) {
    displayedModels.push({ id: embeddingsModel, name: embeddingsModel, isFree: false, isEmbedding: true });
  }

  // Filter models based on toggles
  const textModelsList = displayedModels.filter(m => !m.isEmbedding && (!showFreeModelsOnly || m.isFree));
  
  // OpenRouter's /models API doesn't return embedding models reliably.
  // We inject the known embedding models from FALLBACK_MODELS and merge any that might exist.
  const knownEmbeddings = FALLBACK_MODELS.filter(m => m.isEmbedding);
  const fetchedEmbeddings = displayedModels.filter(m => m.isEmbedding && !knownEmbeddings.find(k => k.id === m.id));
  const embeddingModelsList = [...knownEmbeddings, ...fetchedEmbeddings];

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI & Router Configuration</CardTitle>
        <CardDescription>
          Configure your AI provider (e.g. OpenRouter, Ollama, LiteLLM) and select your preferred models.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">Provider Connection</h3>
          <div className="space-y-2">
            <Label>Provider Base URL</Label>
            <Input 
              value={baseURL} 
              onChange={(e) => setBaseURL(e.target.value)} 
              placeholder="https://openrouter.ai/api/v1" 
            />
            <p className="text-xs text-muted-foreground">The OpenAI-compatible /v1 endpoint URL.</p>
          </div>
          
          <div className="space-y-2">
            <Label>Provider API Key (OpenRouter)</Label>
            <Input 
              type="password"
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="•••••••• (Leave blank to keep existing secure key)" 
            />
            <p className="text-xs text-muted-foreground">
              Saved securely in a private table. Cannot be read from the frontend.
            </p>
          </div>
        </div>

        <div className="space-y-4 border p-4 rounded-md">
          <h3 className="font-medium">OpenAI Configuration (For Embeddings)</h3>
          <div className="space-y-2">
            <Label>OpenAI API Key</Label>
            <Input 
              type="password"
              value={openaiApiKey} 
              onChange={(e) => setOpenaiApiKey(e.target.value)} 
              placeholder="•••••••• (Leave blank to keep existing secure key)" 
            />
            <p className="text-xs text-muted-foreground">
              Optional. If provided, all OpenAI embedding models will be routed directly to OpenAI (api.openai.com) instead of OpenRouter.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Switch 
            id="free-models-toggle" 
            checked={showFreeModelsOnly} 
            onCheckedChange={setShowFreeModelsOnly} 
          />
          <Label htmlFor="free-models-toggle">Show Free Models Only</Label>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <Label>Primary Text Generation Model</Label>
            <Button variant="outline" size="sm" onClick={fetchModels} disabled={fetchingModels}>
              {fetchingModels ? "Fetching..." : "Fetch Available Models"}
            </Button>
          </div>
          <Popover open={textModelOpen} onOpenChange={setTextModelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={textModelOpen}
                className="w-full justify-between font-normal"
              >
                {textModel
                  ? textModelsList.find((model) => model.id === textModel)?.name || textModel
                  : "Select a model..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search models..." />
                <CommandList>
                  <CommandEmpty>No model found.</CommandEmpty>
                  <CommandGroup>
                    {textModelsList.map((model) => (
                      <CommandItem
                        key={model.id}
                        value={model.id}
                        onSelect={(currentValue) => {
                          setTextModel(currentValue);
                          setTextModelOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            textModel === model.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {model.name} {model.isFree ? "(Free)" : ""}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground">
            Used for AI Tutor, Quizzes, Writing Analysis, and Performance Reports.
          </p>
        </div>

        <div className="pt-4 border-t space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Service-Specific Models</h3>
          
          <div className="space-y-2">
            <Label>AI Tutor (Chat) Model</Label>
            <Select value={chatModel} onValueChange={setChatModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select Chat Model" />
              </SelectTrigger>
              <SelectContent>
                {textModelsList.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} {m.isFree ? "(Free)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quiz Generation Model</Label>
            <Select value={quizModel} onValueChange={setQuizModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select Quiz Model" />
              </SelectTrigger>
              <SelectContent>
                {textModelsList.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} {m.isFree ? "(Free)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Curriculum Indexing Model</Label>
            <Select value={indexingModel} onValueChange={setIndexingModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select Indexing Model" />
              </SelectTrigger>
              <SelectContent>
                {textModelsList.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} {m.isFree ? "(Free)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Label>Embeddings Model (For RAG & Semantic Search)</Label>
          <Popover open={embeddingsModelOpen} onOpenChange={setEmbeddingsModelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={embeddingsModelOpen}
                className="w-full justify-between font-normal"
              >
                {embeddingsModel
                  ? embeddingModelsList.find((model) => model.id === embeddingsModel)?.name || embeddingsModel
                  : "Select an embeddings model..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search embedding models..." />
                <CommandList>
                  <CommandEmpty>No model found.</CommandEmpty>
                  <CommandGroup>
                    {embeddingModelsList.map((model) => (
                      <CommandItem
                        key={model.id}
                        value={model.id}
                        onSelect={(currentValue) => {
                          setEmbeddingsModel(currentValue);
                          setEmbeddingsModelOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            embeddingsModel === model.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {model.name} {model.isFree ? "(Free)" : ""}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-sm text-muted-foreground">
            Used for context retrieval. Note: Changing this requires re-indexing curriculum documents.
          </p>
        </div>

        <Button onClick={saveConfig} disabled={saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </CardContent>
    </Card>
  );
}
