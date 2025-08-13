import { create } from 'zustand';
import { AgentPersona, TextResponse } from './ai-config';

export interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  timestamp: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    duration?: string;
  };
  engagement: {
    likes: number;
    comments: number;
    retweets: number;
    views: string;
  };
}

export interface Simulation {
  id: string;
  postId: string;
  scale: 'nano' | 'micro' | 'standard' | 'mega' | 'ultra' | 'cosmic';
  agentCount: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: TextResponse[];
  createdAt: Date;
  completedAt?: Date;
  // Optional map of agent metadata for this simulation (used for synthetic agents streamed from server)
  agentsById?: Record<string, {
    id: string;
    name: string;
    handle: string;
    avatarEmoji: string;
    modelType: AgentPersona['modelType'];
  }>;
}

interface AgentSphereState {
  // Posts
  posts: Post[];
  currentPost: Post | null;
  
  // Simulations
  simulations: Simulation[];
  currentSimulation: Simulation | null;
  isSimulating: boolean;
  
  // Agents
  agents: AgentPersona[];
  selectedAgents: AgentPersona[];
  
  // UI State
  selectedScale: 'nano' | 'micro' | 'standard' | 'mega' | 'ultra' | 'cosmic';
  showSimulationResults: boolean;
  
  // Actions
  setCurrentPost: (post: Post | null) => void;
  addPost: (post: Post) => void;
  setSelectedScale: (scale: 'nano' | 'micro' | 'standard' | 'mega' | 'ultra' | 'cosmic') => void;
  startSimulation: (postId: string, scale: string) => void;
  updateSimulation: (simulationId: string, updates: Partial<Simulation>) => void;
  addSimulationResult: (simulationId: string, result: TextResponse) => void;
  setAgents: (agents: AgentPersona[]) => void;
  setSelectedAgents: (agents: AgentPersona[]) => void;
  setSimulating: (isSimulating: boolean) => void;
  setShowSimulationResults: (show: boolean) => void;
  resetSimulation: () => void;
}

export const useAgentSphereStore = create<AgentSphereState>((set, get) => ({
  // Initial state
  posts: [],
  currentPost: null,
  simulations: [],
  currentSimulation: null,
  isSimulating: false,
  agents: [],
  selectedAgents: [],
  selectedScale: 'nano',
  showSimulationResults: false,
  
  // Actions
  setCurrentPost: (post) => set({ currentPost: post }),
  
  addPost: (post) => set((state) => ({ 
    posts: [post, ...state.posts] 
  })),
  
  setSelectedScale: (scale) => set({ selectedScale: scale }),
  
  startSimulation: (postId, scale) => {
    const simulation: Simulation = {
      // Use the postId as the simulation id so UI updates target the correct simulation
      id: postId,
      postId,
      scale: scale as any,
      agentCount: getScaleAgentCount(scale),
      status: 'pending',
      results: [],
      createdAt: new Date(),
    };
    
    set((state) => ({
      simulations: [simulation, ...state.simulations],
      currentSimulation: simulation,
      isSimulating: true,
      showSimulationResults: true,
    }));
  },
  
  updateSimulation: (simulationId, updates) => set((state) => ({
    simulations: state.simulations.map(sim => 
      sim.id === simulationId ? { ...sim, ...updates } : sim
    ),
    currentSimulation: state.currentSimulation?.id === simulationId 
      ? { ...state.currentSimulation, ...updates }
      : state.currentSimulation,
  })),
  
  addSimulationResult: (simulationId, result) => set((state) => ({
    simulations: state.simulations.map(sim => 
      sim.id === simulationId 
        ? { ...sim, results: [...sim.results, result] }
        : sim
    ),
    currentSimulation: state.currentSimulation?.id === simulationId 
      ? { ...state.currentSimulation, results: [...state.currentSimulation.results, result] }
      : state.currentSimulation,
  })),
  
  setAgents: (agents) => set({ agents }),
  
  setSelectedAgents: (agents) => set({ selectedAgents: agents }),
  
  setSimulating: (isSimulating) => set({ isSimulating }),
  
  setShowSimulationResults: (show) => set({ showSimulationResults: show }),
  
  resetSimulation: () => set({
    currentSimulation: null,
    isSimulating: false,
    showSimulationResults: false,
  }),
}));

// Helper function to get agent count for scale
function getScaleAgentCount(scale: string): number {
  const scaleRanges = {
    nano: { min: 5, max: 5 },
    micro: { min: 51, max: 250 },
    standard: { min: 251, max: 1000 },
    mega: { min: 1001, max: 5000 },
    ultra: { min: 5001, max: 10000 },
    cosmic: { min: 10001, max: 15000 },
  };
  
  const range = scaleRanges[scale as keyof typeof scaleRanges];
  if (!range) return 10;
  
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}
