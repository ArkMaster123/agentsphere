"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAgentSphereStore } from "@/lib/store"
import { simulationService } from "@/lib/simulation-service"
import { AgentPersona } from "@/lib/ai-config"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  ImageIcon,
  Smile,
  Calendar,
  MapPin,
  BarChart3,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Play,
  Users,
  Zap,
  Bot,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const SIMULATION_SCALES = [
  { id: "nano", name: "Nano", range: "5 agents", description: "Coffee Shop Crowd", color: "bg-blue-500" },
  { id: "micro", name: "Micro", range: "51-250 agents", description: "Neighborhood Buzz", color: "bg-green-500" },
  { id: "standard", name: "Standard", range: "251-1K agents", description: "Community Voice", color: "bg-yellow-500" },
  { id: "mega", name: "Mega", range: "1K-5K agents", description: "City Response", color: "bg-orange-500" },
  { id: "ultra", name: "Ultra", range: "5K-10K agents", description: "Regional Reaction", color: "bg-red-500" },
  { id: "cosmic", name: "Cosmic", range: "10K+ agents", description: "Global Simulation", color: "bg-purple-500" },
]

const SAMPLE_POSTS = [
  {
    id: 1,
    author: { name: "v0 🤖", handle: "v0", avatar: "🤖", verified: true },
    content: "v0.app uses agentic ai. wtf is agentic ai? we'll explain:",
    timestamp: "47m",
    media: { type: "video", thumbnail: "/placeholder.svg?height=300&width=500", duration: "0:34" },
    engagement: { likes: 31, comments: 2, retweets: 4, views: "3.9K" },
  },
  {
    id: 2,
    author: { name: "Sharon | AI wonders 🤖", handle: "explorersofai", avatar: "🤖", verified: true },
    content:
      "I have been on this platform for more than 2 years.\n\nMy posts get little to no impressions\n\nI signed up to Threads and my posts already accumulated 1000s of impressions\n\nWhat's up??",
    timestamp: "35m",
    engagement: { likes: 47, comments: 5, retweets: 1, views: "2.8K" },
  },
]

const TRENDING_TOPICS = [
  { category: "Business and finance", topic: "DeFi", posts: "194K posts" },
  { category: "Trending", topic: "#News", posts: "1,585 posts" },
  { category: "Technology", topic: "Messages", posts: "2,847 posts" },
]

const LIVE_SPACES = [
  { title: "Order of the Secret Council — Blame...", listeners: 65, avatars: ["👤", "👤", "👤"] },
  { title: "All Things Crypto: $ETH = $4600; Circle L1 = Are, ...", listeners: 64, avatars: ["👤", "👤", "👤"] },
  { title: "ADHD Support The Reboot", listeners: 13, avatars: ["👤", "👤", "👤"] },
  { title: "$SIAGI AI - What LLMs Reveal About the Nature ...", listeners: 9, avatars: ["👤", "👤", "👤"] },
]

export default function AgentSphere() {
  const [postContent, setPostContent] = useState("")
  const [showAgentsDialog, setShowAgentsDialog] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentPersona | null>(null)
  
  // Use Zustand store
  const {
    selectedScale,
    isSimulating,
    currentSimulation,
    showSimulationResults,
    setSelectedScale,
    setSimulating,
    startSimulation,
    addSimulationResult,
    updateSimulation,
    setShowSimulationResults,
    resetSimulation,
    agents,
    setAgents
  } = useAgentSphereStore()

  // Initialize agents on component mount
  useEffect(() => {
    const agents = simulationService.getAgents()
    setAgents(agents)
  }, [setAgents])

  const handleSimulate = async () => {
    if (!postContent.trim()) return

          // Start simulation in store
      const postId = `post_${Date.now()}`
      startSimulation(postId, selectedScale)
      setSimulating(true)
      setShowSimulationResults(true) // Ensure results are shown

    try {
      // Create a post object
      const post = {
        id: postId,
        content: postContent,
        author: { name: "You", handle: "user", avatar: "👤", verified: false },
        timestamp: "now",
        engagement: { likes: 0, comments: 0, retweets: 0, views: "0" }
      }

      // Start real simulation with AI agents via API
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postContent,
          scale: selectedScale
        })
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            if (data === '[DONE]') break;
            
            try {
              const result = JSON.parse(data);
              // Handle control events first
              if (result.type === 'start' && typeof result.plannedAgents === 'number') {
                updateSimulation(postId, { 
                  agentCount: result.plannedAgents,
                  // Persist server-sent agent metadata to help resolve synthetic agent display if needed
                  agentsById: Array.isArray(result.agents)
                    ? Object.fromEntries(result.agents.map((a: any) => [a.id, a]))
                    : undefined
                });
                continue;
              }
              if (result.type === 'complete') {
                break;
              }
              
              // Convert timestamp string to Date object
              if (result.timestamp) {
                result.timestamp = new Date(result.timestamp);
              }
              
              addSimulationResult(postId, result);
            } catch (e) {
              console.error('Error parsing result:', e, 'Raw data:', data);
            }
          }
        }
      }

      // Update simulation status
      updateSimulation(postId, { 
        status: 'completed', 
        completedAt: new Date() 
      })
      
      setSimulating(false)
    } catch (error) {
      console.error('Simulation failed:', error)
      updateSimulation(postId, { status: 'failed' })
      setSimulating(false)
    }
  }

  // Get agent by ID from simulation service
  const getAgentById = (agentId: string) => {
    return simulationService.getAgentById(agentId)
  }

  // Calculate simulation metrics
  const getSimulationMetrics = () => {
    if (!currentSimulation) return { totalReactions: 0, avgSentiment: 0 }
    
    const results = currentSimulation.results
    const totalReactions = results.length
    const avgSentiment = results.length > 0 
      ? results.reduce((acc, r) => acc + r.sentiment, 0) / results.length 
      : 0
    
    return { totalReactions, avgSentiment }
  }

  return (
    <div className="agent-sphere-container">
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar */}
        <div className="w-64 p-4 border-r border-gray-800 sticky top-0 h-screen">
          <nav className="space-y-2">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: Search, label: "Explore" },
              { icon: Bell, label: "Notifications" },
              { icon: Mail, label: "Messages" },
              { icon: Bot, label: "Agents", onClick: () => setShowAgentsDialog(true) },
              { icon: Bookmark, label: "Bookmarks" },
              { icon: Users, label: "Communities" },
              { icon: User, label: "Profile" },
              { icon: MoreHorizontal, label: "More" },
            ].map(({ icon: Icon, label, active, onClick }) => (
              <div
                key={label}
                onClick={onClick}
                className={`flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 cursor-pointer ${active ? "font-bold" : ""}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xl">{label}</span>
              </div>
            ))}
          </nav>

          <Button className="agent-sphere-button w-full mt-8 font-bold py-3 rounded-full">
            Post
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 border-r border-gray-800">
          {/* Agents Dialog */}
          <Dialog open={showAgentsDialog} onOpenChange={setShowAgentsDialog}>
            <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Agents</DialogTitle>
                <DialogDescription className="text-gray-300">Browse the current AI personas in this simulation.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
                {agents.map((agent) => (
                  <Card key={agent.id} className="agent-sphere-card p-3 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => setSelectedAgent(agent)}>
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{agent.avatarEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-white">{agent.name}</span>
                          <span className="text-xs text-gray-400">@{agent.handle}</span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">{agent.modelType}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent); }}>View</Button>
                    </div>
                  </Card>
                ))}
              </div>
              <DialogFooter>
                <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700" onClick={() => setShowAgentsDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Agent Detail Dialog */}
          <Dialog open={!!selectedAgent} onOpenChange={(open) => !open && setSelectedAgent(null)}>
            <DialogContent className="max-w-lg bg-gray-900 border-gray-700">
              {selectedAgent && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3 text-white">
                      <span className="text-3xl">{selectedAgent.avatarEmoji}</span>
                      <span>{selectedAgent.name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">@{selectedAgent.handle}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">{selectedAgent.modelType}</Badge>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div>Age: {selectedAgent.demographics.age}</div>
                      <div>Location: {selectedAgent.demographics.location}</div>
                      <div>Education: {selectedAgent.demographics.education}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase text-gray-400 mb-1">Behavior</div>
                      <div className="text-sm text-gray-300">Style: {selectedAgent.behaviorPatterns.writingStyle}</div>
                      <div className="text-sm text-gray-300">Engagement: {selectedAgent.behaviorPatterns.engagementStyle}</div>
                    </div>
                    {selectedAgent.expertise.length > 0 && (
                      <div>
                        <div className="text-xs uppercase text-gray-400 mb-1">Expertise</div>
                        <div className="text-sm text-gray-300">{selectedAgent.expertise.join(", ")}</div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="secondary" className="bg-gray-800 text-white hover:bg-gray-700" onClick={() => setSelectedAgent(null)}>Close</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
          {/* Header */}
          <div className="sticky top-0 bg-black/80 backdrop-blur border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8">
                  <img 
                    src="/agentsphere.png" 
                    alt="AgentSphere Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold">AgentSphere</h1>
              </div>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  For you
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  Following
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  AI Aligners on X
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500">
                  Machine Learning & AI
                </Button>
              </div>
            </div>
          </div>

          {/* Compose Section */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex space-x-3">
              <Avatar>
                <AvatarFallback>👤</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="What's happening?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="agent-sphere-input bg-transparent border-none text-xl resize-none"
                  rows={3}
                />

                {/* Scale Selector */}
                <div className="mt-4 p-3 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Simulation Scale</span>
                    <Badge variant="outline" className="text-xs">
                      {SIMULATION_SCALES.find((s) => s.id === selectedScale)?.range}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SIMULATION_SCALES.map((scale) => (
                      <Button
                        key={scale.id}
                        variant={selectedScale === scale.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedScale(scale.id)}
                        className="text-xs"
                      >
                        <div className={`w-2 h-2 rounded-full ${scale.color} mr-1`} />
                        {scale.name}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {SIMULATION_SCALES.find((s) => s.id === selectedScale)?.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-4 text-blue-400">
                    <ImageIcon className="w-5 h-5 cursor-pointer hover:bg-gray-900 rounded-full p-1 w-7 h-7" />
                    <BarChart3 className="w-5 h-5 cursor-pointer hover:bg-gray-900 rounded-full p-1 w-7 h-7" />
                    <Smile className="w-5 h-5 cursor-pointer hover:bg-gray-900 rounded-full p-1 w-7 h-7" />
                    <Calendar className="w-5 h-5 cursor-pointer hover:bg-gray-900 rounded-full p-1 w-7 h-7" />
                    <MapPin className="w-5 h-5 cursor-pointer hover:bg-gray-900 rounded-full p-1 w-7 h-7" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">{280 - postContent.length}</span>
                    <Button
                      onClick={handleSimulate}
                      disabled={!postContent.trim() || isSimulating}
                      className="agent-sphere-button font-bold px-6 rounded-full"
                    >
                      {isSimulating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Simulating...
                        </>
                      ) : (
                        "Simulate Post"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simulation Results */}
          {showSimulationResults && currentSimulation && (
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Simulation Results</h3>
                <Badge variant={currentSimulation.status === 'completed' ? 'default' : 'secondary'}>
                  {currentSimulation.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card className="agent-sphere-card p-3">
                  <div className="text-sm">Total Reactions</div>
                  <div className="text-2xl font-bold">{getSimulationMetrics().totalReactions}</div>
                </Card>
                <Card className="agent-sphere-card p-3">
                  <div className="text-sm">Planned Agents</div>
                  <div className="text-2xl font-bold">{currentSimulation.agentCount}</div>
                </Card>
                <Card className="agent-sphere-card p-3">
                  <div className="text-sm">Avg Sentiment</div>
                  <div className="text-2xl font-bold">
                    {getSimulationMetrics().avgSentiment.toFixed(1)}
                  </div>
                </Card>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentSimulation.results.map((result, idx) => {
                  const agent = getAgentById(result.agentId)
                  if (!agent) return null
                  
                  return (
                    <div key={result.id} className="flex items-center space-x-3 p-2 agent-sphere-card rounded">
                      <span className="text-lg">{agent.avatarEmoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{agent.name}</span>
                          <span className="text-xs">@{agent.handle}</span>
                          <Badge variant="outline" size="sm" className="text-xs">
                            {agent.modelType}
                          </Badge>
                        </div>
                        {result.commentText && (
                          <p className="text-sm mt-1">{result.commentText}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.reactionType === "like" && <Heart className="w-4 h-4 text-red-500" />}
                        {result.reactionType === "comment" && <MessageCircle className="w-4 h-4 text-blue-500" />}
                        {result.reactionType === "retweet" && <Repeat2 className="w-4 h-4 text-green-500" />}
                        <span className="text-xs">
                          {Math.floor((Date.now() - new Date(result.timestamp).getTime()) / 1000)}s
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {currentSimulation.status === 'completed' && (
                <div className="mt-4 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSimulationResults(false)}
                  >
                    Hide Results
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={resetSimulation}
                  >
                    New Simulation
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Posts Feed */}
          <div className="divide-y divide-gray-800">
            {SAMPLE_POSTS.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-950 cursor-pointer">
                <div className="flex space-x-3">
                  <Avatar>
                    <AvatarFallback>{post.author.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{post.author.name}</span>
                      {post.author.verified && <span className="text-blue-400">✓</span>}
                      <span className="text-xs">@{post.author.handle}</span>
                      <span className="text-xs">·</span>
                      <span className="text-xs">{post.timestamp}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line">{post.content}</p>

                    {post.media && (
                      <div className="mt-3 relative">
                        <img
                          src={post.media.thumbnail || "/placeholder.svg"}
                          alt="Post media"
                          className="rounded-2xl w-full max-w-lg"
                        />
                        {post.media.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-3">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        )}
                        {post.media.duration && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {post.media.duration}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 max-w-md">
                      <div className="flex items-center space-x-1 hover:text-blue-400 cursor-pointer">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.engagement.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1 hover:text-green-400 cursor-pointer">
                        <Repeat2 className="w-5 h-5" />
                        <span className="text-sm">{post.engagement.retweets}</span>
                      </div>
                      <div className="flex items-center space-x-1 hover:text-red-400 cursor-pointer">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">{post.engagement.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 hover:text-blue-400 cursor-pointer">
                        <BarChart3 className="w-5 h-5" />
                        <span className="text-sm">{post.engagement.views}</span>
                      </div>
                      <div className="flex items-center space-x-1 hover:text-blue-400 cursor-pointer">
                        <Share className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="agent-sphere-input w-full rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Live on X */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Live on X</h2>
              <div className="space-y-3">
                {LIVE_SPACES.map((space, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-2 hover:bg-gray-800 rounded cursor-pointer">
                    <div className="flex -space-x-1">
                      {space.avatars.map((avatar, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 bg-gray-600 rounded-full border border-gray-800 flex items-center justify-center text-xs"
                        >
                          {avatar}
                        </div>
                      ))}
                      <div className="w-6 h-6 bg-blue-500 rounded-full border border-gray-800 flex items-center justify-center text-xs font-bold">
                        +{space.listeners}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{space.title}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-500">is listening</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-blue-400 p-0 h-auto mt-3">
                Show more
              </Button>
            </div>
          </div>

          {/* What's happening */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-sm">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">What's happening</h2>
              <div className="space-y-3">
                {TRENDING_TOPICS.map((topic, idx) => (
                  <div key={idx} className="hover:bg-gray-800 p-2 rounded cursor-pointer">
                    <p className="text-xs text-gray-500">{topic.category} · Trending</p>
                    <p className="font-bold">{topic.topic}</p>
                    <p className="text-xs text-gray-500">{topic.posts}</p>
                  </div>
                ))}
              </div>
              <Button variant="link" className="text-blue-400 p-0 h-auto mt-3">
                Show more
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
