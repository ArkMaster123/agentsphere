import { AxAI, AxAgent, AxGen, ai } from '@ax-llm/ax';

// Initialize Ax AI service with OpenRouter using the ai() factory
export const createAxAI = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is required');
  }
  
  return ai({
    name: 'openai',
    apiKey: process.env.OPENROUTER_API_KEY,
    apiURL: 'https://openrouter.ai/api/v1',
  });
};

// Lazy initialization
let axAIInstance: AxAI | null = null;
export const getAxAI = () => {
  if (!axAIInstance) {
    axAIInstance = createAxAI();
  }
  return axAIInstance;
};

// Agent persona interface (text-only, free models)
export interface AgentPersona {
  id: string;
  name: string;
  handle: string; // @username
  avatarEmoji: string; // Simple emoji avatar
  modelType: "creative" | "analytical" | "technical" | "philosophical" | "casual";
  demographics: {
    age: number;
    location: string;
    income: string;
    education: string;
  };
  psychographics: {
    personality: string[];
    interests: string[];
    values: string[];
    politicalLean: string;
  };
  behaviorPatterns: {
    engagementStyle: "lurker" | "active" | "influencer" | "troll";
    responseRate: number; // 0-1 probability of responding
    controversyTolerance: number; // 0-1 how much drama they can handle
    influenceability: number; // 0-1 how easily swayed by others
    writingStyle: "casual" | "formal" | "academic" | "sarcastic" | "enthusiastic" | "technical";
  };
  expertise: string[];
  textResponseHistory: TextResponse[];
  axSignature: string; // DSPy-style signature for behavior
}

export interface TextResponse {
  id: string;
  postId: string;
  agentId: string;
  reactionType: "like" | "comment" | "retweet" | "ignore";
  commentText?: string;
  sentiment: number; // -1 to 1
  engagementLikelihood: number; // 0 to 1
  timestamp: Date;
}

// Create specialized text-only agents using Ax
export const createSocialAgent = (persona: AgentPersona) => {
  // Pure signature without descriptions - just input/output definition
  const signature = "post:string, context:string -> reaction_type:string, comment_text:string, sentiment:number, engagement_likelihood:number";
  
  return new AxGen(signature, {
    chainOfThought: true,
    system: `You are ${persona.name}, a ${persona.demographics.age}-year-old ${persona.behaviorPatterns.writingStyle} person from ${persona.demographics.location}. 

Given a social media post, respond as this persona would:
- reaction_type: "like", "comment", "retweet", or "ignore"
- comment_text: if commenting, write a brief response (max 100 chars)
- sentiment: -1 (very negative) to 1 (very positive)
- engagement_likelihood: 0 to 1 probability of engaging`,
  });
};

// Agent orchestration using Ax
export const createSimulationOrchestrator = () => {
  const signature = "post:string, agent_count:number, model_distribution:json -> text_simulation_results:json";
  
  return new AxGen(signature, {
    chainOfThought: true,
    system: "You are a social media simulation orchestrator. Analyze the post and distribute responses across different agent types.",
  });
};

// Smart model assignment strategy - simplified for now
export const assignFreeModel = (agent: AgentPersona) => {
  // For now, we'll use the same model for all agents
  // In the future, we can implement model-specific routing
  return 'openrouter';
};

// Smart model distribution for free tier optimization
export const distributeAgentsAcrossModels = (agents: AgentPersona[]) => {
  return {
    total: agents.length,
    creative: agents.filter(a => a.behaviorPatterns.writingStyle === "creative").length,
    analytical: agents.filter(a => a.expertise.includes("data") || a.demographics.education === "PhD").length,
    technical: agents.filter(a => a.expertise.includes("technology")).length,
    philosophical: agents.filter(a => a.psychographics.interests.includes("philosophy")).length,
    casual: agents.filter(a => a.behaviorPatterns.writingStyle === "casual").length
  };
};
