"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Play,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart3,
  Users,
  Zap,
  Shield,
  Eye,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react"
import Link from "next/link"

const DEMO_AGENTS = [
  { name: "Sarah", avatar: "👩‍💻", sentiment: 0.8, reaction: "Love this! The UI looks amazing! 🎉" },
  { name: "Marcus", avatar: "🎨", sentiment: 0.6, reaction: "Great design choices here!" },
  { name: "Elena", avatar: "🔬", sentiment: 0.9, reaction: "This is exactly what I needed!" },
  { name: "Jake", avatar: "🤔", sentiment: -0.2, reaction: "Interesting approach..." },
  { name: "Lisa", avatar: "😊", sentiment: 0.7, reaction: "Can't wait to try this out!" },
  { name: "Alex", avatar: "🚀", sentiment: 0.5, reaction: "Looks promising!" },
  { name: "Maya", avatar: "💡", sentiment: 0.8, reaction: "Brilliant idea!" },
  { name: "Tom", avatar: "🔥", sentiment: 0.9, reaction: "This is going viral!" },
]

const FLOATING_ELEMENTS = [
  { id: 1, icon: Zap, color: "text-blue-500", delay: 0, x: "10%", y: "20%" },
  { id: 2, icon: Target, color: "text-purple-500", delay: 1000, x: "80%", y: "30%" },
  { id: 3, icon: Shield, color: "text-green-500", delay: 2000, x: "20%", y: "70%" },
  { id: 4, icon: Eye, color: "text-orange-500", delay: 3000, x: "70%", y: "80%" },
  { id: 5, icon: Users, color: "text-pink-500", delay: 4000, x: "50%", y: "10%" },
]

const FULL_DEMO_TEXT = "Just launched my new AI project! What do you think? 🚀"

export default function AgentSphereLanding() {
  const [demoText, setDemoText] = useState("")
  const [isSimulating, setIsSimulating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [animatedAgents, setAnimatedAgents] = useState<Agent[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [animationCompleted, setAnimationCompleted] = useState(false)

  useEffect(() => {
    if (demoText.length < FULL_DEMO_TEXT.length) {
      const timer = setTimeout(() => {
        setDemoText(FULL_DEMO_TEXT.slice(0, demoText.length + 1))
      }, 100)
      return () => clearTimeout(timer)
    } else if (demoText === FULL_DEMO_TEXT && !isSimulating && !animationCompleted) {
      const timer = setTimeout(() => {
        setIsSimulating(true)
        setAnimationCompleted(true)
        // Clear any existing agents first
        setAnimatedAgents([])
        // Simulate agent reactions appearing one by one (limit to 5 agents)
        DEMO_AGENTS.slice(0, 5).forEach((agent, index) => {
          setTimeout(() => {
            setAnimatedAgents((prev) => {
              // Only add if not already present
              if (prev.find(a => a.name === agent.name)) return prev
              return [...prev, { ...agent, id: `agent-${Date.now()}-${index}` }]
            })
          }, index * 300)
        })
        setTimeout(
          () => {
            setShowResults(true)
            setIsSimulating(false)
          },
          5 * 300 + 500,
        )
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [demoText, isSimulating, animationCompleted])

  useEffect(() => {
    // Start the demo animation
    const timer = setTimeout(() => {
      setDemoText("")
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`min-h-screen w-full relative transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Diagonal Grid with Light/Dark */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: isDarkMode ? `
            repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.05) 0, rgba(255, 255, 255, 0.05) 1px, transparent 1px, transparent 20px)
          ` : `
            repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.05) 0, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 0, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 20px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating Elements */}
      {FLOATING_ELEMENTS.map(({ id, icon: Icon, color, delay, x, y }) => (
        <div
          key={id}
          className={`absolute ${color} opacity-30 animate-float`}
          style={{
            left: x,
            top: y,
            animationDelay: `${delay}ms`,
            animationDuration: "6s",
          }}
        >
          <Icon className="w-8 h-8" />
        </div>
      ))}

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg p-1">
              <img 
                src="/agentsphere.png" 
                alt="AgentSphere Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold">AgentSphere</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className={`hover:opacity-80 font-medium transition-opacity ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Pricing
            </a>
            <a href="#" className={`hover:opacity-80 font-medium transition-opacity ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Enterprise
            </a>
            <a href="#" className={`hover:opacity-80 font-medium transition-opacity ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Careers
            </a>
            <a href="#" className={`hover:opacity-80 font-medium transition-opacity ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Help Center
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/simulate">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg">
                Launch App
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            It's like having a{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Crystal Ball
            </span>
            <br />
            for Social Media
          </h1>

          <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            AgentSphere gives you the viral insights you never had to guess for in every post, without you even having
            to publish.
          </p>

          <Link href="/simulate">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold mb-16 shadow-lg">
              <Play className="w-5 h-5 mr-2" />
              Try Your First Simulation
            </Button>
          </Link>

          {/* Interactive Demo */}
          <div className="max-w-2xl mx-auto">
            <Card className={`p-6 border-2 shadow-2xl transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  You
                </div>
                <div className="flex-1">
                  <div className={`rounded-lg p-4 mb-4 border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Textarea
                      value={demoText}
                      readOnly
                      className={`border-none resize-none text-lg font-medium ${
                        isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
                      }`}
                      placeholder="What's happening?"
                      rows={2}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex space-x-2">
                        <Badge variant="outline" className={`text-xs ${
                          isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                        }`}>
                          <Users className="w-3 h-3 mr-1" />
                          Standard Scale
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${
                          isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                        }`}>
                          <Zap className="w-3 h-3 mr-1" />
                          1K Agents
                        </Badge>
                      </div>
                      {isSimulating && (
                        <div className="flex items-center space-x-2 text-blue-500">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">Simulating...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agent Reactions */}
                  {animatedAgents.length > 0 && (
                    <div className="space-y-3 mt-6">
                      {animatedAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <span className="text-lg">{agent.avatar}</span>
                          <div className="flex-1">
                            <span className={`font-semibold text-sm ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{agent.name}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">❤️</span>
                                <span className="text-xs">💬</span>
                                <span className="text-xs">♻️</span>
                              </div>
                              <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                                isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}>
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    agent.sentiment > 0.5
                                      ? "bg-green-500"
                                      : agent.sentiment > 0
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.abs(agent.sentiment) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Results Summary */}
                  {showResults && (
                    <div className="grid grid-cols-3 gap-4 animate-fade-in">
                      <div className={`text-center p-3 rounded-lg border ${
                        isDarkMode ? 'bg-green-900/50 border-green-700' : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="text-2xl font-bold text-green-600">87%</div>
                        <div className={`text-xs font-medium ${
                          isDarkMode ? 'text-green-400' : 'text-green-700'
                        }`}>Positive</div>
                      </div>
                      <div className={`text-center p-3 rounded-lg border ${
                        isDarkMode ? 'bg-blue-900/50 border-blue-700' : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="text-2xl font-bold text-blue-600">342</div>
                        <div className={`text-xs font-medium ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-700'
                        }`}>Reactions</div>
                      </div>
                      <div className={`text-center p-3 rounded-lg border ${
                        isDarkMode ? 'bg-purple-900/50 border-purple-700' : 'bg-purple-50 border-purple-200'
                      }`}>
                        <div className="text-2xl font-bold text-purple-600">9.2</div>
                        <div className={`text-xs font-medium ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-700'
                        }`}>Viral Score</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className={`relative z-10 px-6 py-24 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">This feels like magic</h2>
            <p className={`text-xl ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Content Creation. Marketing Campaigns. Viral Testing. Audience Research.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className={`p-8 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">See Before You Post</h3>
              <p className={`leading-relaxed ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Get instant feedback from thousands of AI agents before your content goes live. No more guessing what
                will resonate.
              </p>
            </Card>

            <Card className={`p-8 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Predict Viral Success</h3>
              <p className={`leading-relaxed ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Our AI agents simulate real audience reactions with 94% accuracy. Know what will go viral before anyone
                else.
              </p>
            </Card>

            <Card className={`p-8 border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">Risk-Free Testing</h3>
              <p className={`leading-relaxed ${
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Test unlimited content variations in complete privacy. No real posting required, no reputation at risk.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`rounded-2xl p-12 border-2 shadow-2xl transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="w-16 h-16 relative mx-auto mb-6 bg-black rounded-lg p-2">
              <img 
                src="/agentsphere.png" 
                alt="AgentSphere Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold mb-4">"Why would I even use AgentSphere?"</h2>
            <p className={`text-lg mb-8 leading-relaxed ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              AgentSphere is a <strong>real-time AI</strong> that gives you the power to predict social media success
              during content creation, without anyone knowing. Insights about audience reactions, viral potential, and
              engagement patterns - all before you hit publish.
            </p>
            <div className={`flex items-center justify-center space-x-8 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Real-time streaming</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Completely private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Up to 15K agents</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">It's time to predict virality</h2>
          <p className={`text-xl mb-8 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Join thousands of creators who never guess about content performance again.
          </p>
          <Link href="/simulate">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg">
              Start Predicting Virality
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className={`text-sm mt-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>Free trial • No credit card required • 5-minute setup</p>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
