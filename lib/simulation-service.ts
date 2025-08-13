import { 
  getAxAI, 
  createSocialAgent, 
  createSimulationOrchestrator, 
  assignFreeModel,
  distributeAgentsAcrossModels,
  AgentPersona, 
  TextResponse 
} from './ai-config';

// Sample agent personas for testing
export const SAMPLE_AGENTS: AgentPersona[] = [
  {
    id: "1",
    name: "Sarah Chen",
    handle: "sarahc_dev",
    avatarEmoji: "👩‍💻",
    modelType: "technical",
    demographics: { age: 28, location: "SF", income: "100k+", education: "Masters" },
    psychographics: {
      personality: ["analytical", "detail-oriented"],
      interests: ["programming", "AI", "technology"],
      values: ["innovation", "efficiency"],
      politicalLean: "moderate"
    },
    behaviorPatterns: {
      engagementStyle: "active",
      responseRate: 0.8,
      controversyTolerance: 0.6,
      influenceability: 0.4,
      writingStyle: "technical"
    },
    expertise: ["software development", "machine learning"],
    textResponseHistory: [],
    axSignature: "technical_analytical_developer"
  },
  {
    id: "2",
    name: "Marcus Johnson",
    handle: "mjohnson_art",
    avatarEmoji: "🎨",
    modelType: "creative",
    demographics: { age: 34, location: "NYC", income: "80k", education: "Bachelors" },
    psychographics: {
      personality: ["creative", "expressive"],
      interests: ["art", "design", "culture"],
      values: ["creativity", "authenticity"],
      politicalLean: "liberal"
    },
    behaviorPatterns: {
      engagementStyle: "influencer",
      responseRate: 0.9,
      controversyTolerance: 0.8,
      influenceability: 0.7,
      writingStyle: "creative"
    },
    expertise: ["graphic design", "digital art"],
    textResponseHistory: [],
    axSignature: "creative_artistic_influencer"
  },
  {
    id: "3",
    name: "Dr. Elena Rodriguez",
    handle: "dr_elena_r",
    avatarEmoji: "🔬",
    modelType: "analytical",
    demographics: { age: 42, location: "Boston", income: "120k+", education: "PhD" },
    psychographics: {
      personality: ["intellectual", "curious"],
      interests: ["research", "science", "data"],
      values: ["knowledge", "evidence"],
      politicalLean: "progressive"
    },
    behaviorPatterns: {
      engagementStyle: "active",
      responseRate: 0.7,
      controversyTolerance: 0.5,
      influenceability: 0.3,
      writingStyle: "academic"
    },
    expertise: ["data science", "research methodology"],
    textResponseHistory: [],
    axSignature: "analytical_researcher_phd"
  },
  {
    id: "4",
    name: "Jake Thompson",
    handle: "jakethoughts",
    avatarEmoji: "🤔",
    modelType: "philosophical",
    demographics: { age: 29, location: "Austin", income: "70k", education: "Masters" },
    psychographics: {
      personality: ["thoughtful", "contemplative"],
      interests: ["philosophy", "ethics", "politics"],
      values: ["wisdom", "justice"],
      politicalLean: "independent"
    },
    behaviorPatterns: {
      engagementStyle: "active",
      responseRate: 0.6,
      controversyTolerance: 0.9,
      influenceability: 0.5,
      writingStyle: "philosophical"
    },
    expertise: ["ethics", "political theory"],
    textResponseHistory: [],
    axSignature: "philosophical_thinker_ethicist"
  },
  {
    id: "5",
    name: "Lisa Park",
    handle: "lisap_casual",
    avatarEmoji: "😊",
    modelType: "casual",
    demographics: { age: 25, location: "LA", income: "60k", education: "Bachelors" },
    psychographics: {
      personality: ["friendly", "social"],
      interests: ["lifestyle", "fashion", "travel"],
      values: ["connection", "fun"],
      politicalLean: "moderate"
    },
    behaviorPatterns: {
      engagementStyle: "lurker",
      responseRate: 0.4,
      controversyTolerance: 0.3,
      influenceability: 0.8,
      writingStyle: "casual"
    },
    expertise: ["social media", "content creation"],
    textResponseHistory: [],
    axSignature: "casual_social_lifestyle"
  }
];

export class SimulationService {
  private orchestrator: any = null;
  private agents: AgentPersona[] = SAMPLE_AGENTS;
  private dynamicAgents: Map<string, AgentPersona> = new Map();

  constructor() {
    this.initializeAgents();
  }

  private async initializeAgents() {
    // Initialize agents with Ax LLM
    this.agents = SAMPLE_AGENTS.map(agent => ({
      ...agent,
      textResponseHistory: []
    }));
    
    // Lazy initialize orchestrator
    if (!this.orchestrator) {
      this.orchestrator = createSimulationOrchestrator();
    }
  }

  async simulatePost(
    postContent: string, 
    scale: string,
    onResult?: (result: any) => void
  ): Promise<TextResponse[]> {
    // Check if we're missing API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.log('Missing OPENROUTER_API_KEY, returning mock results');
      return this.generateMockResults(postContent, scale, onResult);
    }
    
    console.log('API Key found, attempting real AI simulation...');

    const results: TextResponse[] = [];
    const agentCount = this.getAgentCountForScale(scale);
    const selectedAgents = this.selectAgentsForSimulation(agentCount);
    
    // Update simulation status
    console.log(`Starting simulation with ${agentCount} agents for scale: ${scale}`);

    // Emit a start event so the frontend can reflect the actual planned agent count
    try {
      onResult?.({ type: 'start', plannedAgents: selectedAgents.length });
    } catch (e) {
      // No-op: streaming start event is best-effort
    }

    // Process agents in batches to respect rate limits
    const batchSize = 5; // Process 5 agents at a time
    for (let i = 0; i < selectedAgents.length; i += batchSize) {
      const batch = selectedAgents.slice(i, i + batchSize);
      
      // Process batch concurrently
      const batchPromises = batch.map(agent => 
        this.processAgentResponse(agent, postContent)
      );
      
      const batchResults = await Promise.all(batchPromises);
      
      // Add results and notify
      batchResults.forEach(result => {
        if (result) {
          results.push(result);
          onResult?.(result);
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < selectedAgents.length) {
        await this.delay(1000); // 1 second delay
      }
    }

    return results;
  }

  private async processAgentResponse(
    agent: AgentPersona, 
    postContent: string
  ): Promise<TextResponse | null> {
    try {
      // Synthetic agents always use mock responses to avoid excessive API calls
      if (agent.id.startsWith('syn_')) {
        return this.generateMockResponse(agent, postContent);
      }

      // Always produce a reaction for base agents

      // Check if we have API key for real AI processing
      if (!process.env.OPENROUTER_API_KEY) {
        console.log('No API key in processAgentResponse, using mock');
        return this.generateMockResponse(agent, postContent);
      }

      console.log('Creating Ax agent for:', agent.name);
      
      // Create social agent with Ax
      const socialAgent = createSocialAgent(agent);
      const ai = getAxAI();
      
      console.log('Ax AI instance created successfully');

      // Generate response using Ax
      try {
        const response = await socialAgent.forward(ai, {
          post: postContent,
          context: this.getAgentContext(agent)
        });

        console.log('Ax response:', response);
        
        // Parse response
        const reactionType = this.determineReactionType(response, agent);
        const commentText = reactionType === 'comment' ? response.comment_text : undefined;
        const sentiment = response.sentiment || 0;
        const engagementLikelihood = response.engagement_likelihood || 0.5;

        const result: TextResponse = {
          id: `response_${Date.now()}_${agent.id}`,
          postId: `post_${Date.now()}`,
          agentId: agent.id,
          reactionType,
          commentText,
          sentiment,
          engagementLikelihood,
          timestamp: new Date()
        };

        // Update agent history
        agent.textResponseHistory.push(result);

        return result;
      } catch (error) {
        console.error('Ax AI call failed:', error);
        console.log('Falling back to mock response for agent:', agent.name);
        return this.generateMockResponse(agent, postContent);
      }
    } catch (error) {
      console.error(`Error processing agent ${agent.name}:`, error);
      // Fallback to mock response
      return this.generateMockResponse(agent, postContent);
    }
  }

  private determineReactionType(response: any, agent: AgentPersona): "like" | "comment" | "retweet" | "ignore" {
    // Always produce at least a like; never ignore
    if (response.engagement_likelihood > 0.7 && agent.behaviorPatterns.engagementStyle === "influencer") {
      return "retweet";
    }
    
    if (response.comment_text && response.comment_text.length > 10) {
      return "comment";
    }
    
    return "like";
  }

  private getAgentContext(agent: AgentPersona): string {
    // Get recent context from agent's response history
    const recentResponses = agent.textResponseHistory.slice(-3);
    const contextFromHistory = recentResponses.map(r => r.commentText).filter(Boolean).join(" ");
    
    // Provide default context if no history exists
    if (!contextFromHistory) {
      return `Agent ${agent.name} is a ${agent.demographics.age}-year-old from ${agent.demographics.location} with ${agent.behaviorPatterns.engagementStyle} engagement style.`;
    }
    
    return contextFromHistory;
  }

  private getAgentCountForScale(scale: string): number {
    const scaleRanges = {
      nano: { min: 5, max: 5 },
      micro: { min: 51, max: 250 },
      standard: { min: 251, max: 1000 },
      mega: { min: 1001, max: 5000 },
      ultra: { min: 5001, max: 10000 },
      cosmic: { min: 10001, max: 15000 }
    };
    
    const range = scaleRanges[scale as keyof typeof scaleRanges];
    if (!range) return 10;
    
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  private selectAgentsForSimulation(requestedCount: number): AgentPersona[] {
    // Reset dynamic agents for this run
    this.dynamicAgents.clear();

    const selected: AgentPersona[] = [];
    const shuffled = [...this.agents].sort(() => Math.random() - 0.5);

    // Use available base agents first
    const baseCount = Math.min(requestedCount, shuffled.length);
    for (let i = 0; i < baseCount; i++) {
      selected.push(shuffled[i]);
    }

    // Generate synthetic agents to reach target
    const remaining = requestedCount - baseCount;
    const runId = Date.now();
    for (let i = 0; i < remaining; i++) {
      const synthetic = this.generateSyntheticAgent(runId, i);
      this.dynamicAgents.set(synthetic.id, synthetic);
      selected.push(synthetic);
    }

    return selected;
  }

  private generateSyntheticAgent(runId: number, index: number): AgentPersona {
    const id = `syn_${runId}_${index}`;
    const names = ['Alex','Jordan','Taylor','Casey','Riley','Sam','Morgan','Avery','Drew','Quinn'];
    const emojis = ['👩‍💻','🧠','🎨','🔬','🤔','😊','🧑‍🚀','🧑‍🔧','🧑‍🏫','🧑‍🍳'];
    const modelTypes: AgentPersona['modelType'][] = ['creative','analytical','technical','philosophical','casual'];
    const writingStyles: AgentPersona['behaviorPatterns']['writingStyle'][] = ['casual','formal','academic','sarcastic','enthusiastic','technical'];
    const engagementStyles: AgentPersona['behaviorPatterns']['engagementStyle'][] = ['lurker','active','influencer','troll'];

    const name = `${names[Math.floor(Math.random()*names.length)]} #${index+1}`;
    const handle = `agent_${runId.toString().slice(-5)}_${index+1}`;
    const avatarEmoji = emojis[Math.floor(Math.random()*emojis.length)];
    const modelType = modelTypes[Math.floor(Math.random()*modelTypes.length)];
    const writingStyle = writingStyles[Math.floor(Math.random()*writingStyles.length)];
    const engagementStyle = engagementStyles[Math.floor(Math.random()*engagementStyles.length)];

    return {
      id,
      name,
      handle,
      avatarEmoji,
      modelType,
      demographics: {
        age: 18 + Math.floor(Math.random()*50),
        location: 'Internet',
        income: 'n/a',
        education: 'n/a'
      },
      psychographics: {
        personality: [],
        interests: [],
        values: [],
        politicalLean: 'n/a'
      },
      behaviorPatterns: {
        engagementStyle,
        responseRate: 0.35 + Math.random()*0.5,
        controversyTolerance: Math.random(),
        influenceability: Math.random(),
        writingStyle,
      },
      expertise: [],
      textResponseHistory: [],
      axSignature: `${modelType}_${writingStyle}_${engagementStyle}`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAgents(): AgentPersona[] {
    return this.agents;
  }

  getAgentById(id: string): AgentPersona | undefined {
    return this.agents.find(agent => agent.id === id) || this.dynamicAgents.get(id);
  }

  private generateMockResponse(agent: AgentPersona, postContent: string): TextResponse {
    const reactionType = Math.random() > 0.3 ? "like" : Math.random() > 0.5 ? "comment" : "retweet";
    const sentiment = Math.random() * 2 - 1; // -1 to 1
    const engagementLikelihood = Math.random();
    
    const mockComments = [
      "Interesting perspective! 🤔",
      "I disagree with this take tbh",
      "This is exactly what I was thinking",
      "Can you elaborate on this?",
      "Love this insight! 💯",
      "Not sure about this one...",
      "This hits different 🔥",
      "Facts! 💯",
    ];
    
    return {
      id: `mock_${Date.now()}_${agent.id}`,
      postId: `post_${Date.now()}`,
      agentId: agent.id,
      reactionType,
      commentText: reactionType === 'comment' ? mockComments[Math.floor(Math.random() * mockComments.length)] : undefined,
      sentiment,
      engagementLikelihood,
      timestamp: new Date()
    };
  }

  private async generateMockResults(
    postContent: string,
    scale: string,
    onResult?: (result: TextResponse) => void
  ): Promise<TextResponse[]> {
    const results: TextResponse[] = [];
    const agentCount = this.getAgentCountForScale(scale);
    const selectedAgents = this.selectAgentsForSimulation(agentCount);
    
    console.log(`Generating mock results for ${agentCount} agents`);
    // Emit a start event to align UI with actual planned agent count in mock mode
    try {
      (onResult as any)?.({ type: 'start', plannedAgents: selectedAgents.length });
    } catch (e) {
      // best-effort only
    }
    
    for (let i = 0; i < selectedAgents.length; i++) {
      const agent = selectedAgents[i];
      
      // Simulate response delay
      await this.delay(100 + Math.random() * 200);
      
      // Generate mock response
      const reactionType = Math.random() > 0.3 ? "like" : Math.random() > 0.5 ? "comment" : "retweet";
      const sentiment = Math.random() * 2 - 1; // -1 to 1
      const engagementLikelihood = Math.random();
      
      const mockComments = [
        "Interesting perspective! 🤔",
        "I disagree with this take tbh",
        "This is exactly what I was thinking",
        "Can you elaborate on this?",
        "Love this insight! 💯",
        "Not sure about this one...",
        "This hits different 🔥",
        "Facts! 💯",
      ];
      
      const result: TextResponse = {
        id: `mock_${Date.now()}_${agent.id}`,
        postId: `post_${Date.now()}`,
        agentId: agent.id,
        reactionType,
        commentText: reactionType === 'comment' ? mockComments[Math.floor(Math.random() * mockComments.length)] : undefined,
        sentiment,
        engagementLikelihood,
        timestamp: new Date()
      };
      
      results.push(result);
      onResult?.(result);
    }
    
    return results;
  }
}

// Export singleton instance
export const simulationService = new SimulationService();
