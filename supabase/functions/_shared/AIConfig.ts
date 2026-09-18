export interface AIConfiguration {
  textModel: string; // Primary/Fallback
  chatModel?: string; // AI Tutor
  quizModel?: string; // Quiz Generation
  indexingModel?: string; // Curriculum Indexing
  embeddingsModel: string;
  provider: string;
  baseURL: string;
  apiKey: string;
  openaiApiKey?: string;
}

export async function getAIConfig(supabase: any): Promise<AIConfiguration> {
  const defaultConfig: AIConfiguration = {
    textModel: "google/gemini-2.5-flash",
    embeddingsModel: "openai/text-embedding-3-small",
    provider: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: Deno.env.get("OPENROUTER_API_KEY") || ""
  };

  let config = { ...defaultConfig };

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'ai_configuration')
      .single();

    if (error) {
      console.warn("Failed to fetch ai_configuration from app_settings, using defaults", error);
      return defaultConfig;
    }

    if (data && data.value) {
      config.textModel = data.value.textModel || defaultConfig.textModel;
      config.chatModel = data.value.chatModel;
      config.quizModel = data.value.quizModel;
      config.indexingModel = data.value.indexingModel;
      config.embeddingsModel = data.value.embeddingsModel || defaultConfig.embeddingsModel;
      config.provider = data.value.provider || defaultConfig.provider;
      config.baseURL = data.value.baseURL || defaultConfig.baseURL;
    }
  } catch (e) {
    console.warn("Exception fetching ai_configuration, using defaults", e);
  }

  // Fetch API key securely from private_app_settings
  try {
    const { data: privateData, error: privateError } = await supabase
      .from('private_app_settings')
      .select('value')
      .eq('key', 'ai_provider_key')
      .single();
      
    if (!privateError && privateData?.value) {
      if (privateData.value.apiKey) {
        config.apiKey = privateData.value.apiKey;
      }
      if (privateData.value.openaiApiKey) {
        config.openaiApiKey = privateData.value.openaiApiKey;
      }
    }
  } catch (e) {
    console.warn("Exception fetching private ai_provider_key", e);
  }

  return config;
}
