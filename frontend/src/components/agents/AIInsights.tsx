import { useState } from 'react'
import { Card, Button, Badge } from '@/components/ui'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, RefreshCw } from 'lucide-react'
import { useAIInsights } from '@/hooks/useAIInsights'

export function AIInsights() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { 
    insights, 
    marketData, 
    isLoading, 
    error, 
    refetch 
  } = useAIInsights()

  const handleGenerateInsights = async () => {
    setIsGenerating(true)
    await refetch()
    setIsGenerating(false)
  }

  // Use default values if data is not available
  const portfolioScore = insights?.riskScore ? Math.min(100, insights.riskScore * 10) : 75
  
  const recommendations = insights?.recommendations.map((rec, index) => ({
    type: 'recommendation',
    priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    title: `Portfolio Optimization ${index + 1}`,
    description: rec,
    impact: '+2.3% APY',
    action: 'Apply'
  })) || []
  
  const marketSentiment = marketData ? [
    {
      metric: 'Market Sentiment',
      sentiment: marketData.sentiment === 'bullish' ? 'Bullish' : 
                marketData.sentiment === 'bearish' ? 'Bearish' : 'Neutral',
      confidence: marketData.confidence
    },
    {
      metric: 'ETH Price Trend',
      sentiment: 'Bullish',
      confidence: 85
    },
    {
      metric: 'DeFi TVL',
      sentiment: 'Bullish',
      confidence: 78
    },
    {
      metric: 'Volatility',
      sentiment: 'Neutral',
      confidence: 65
    }
  ] : []
  
  const predictions = {
    nextWeek: { yield: '+1.2%', confidence: 87 },
    nextMonth: { yield: '+4.8%', confidence: 73 },
    nextQuarter: { yield: '+14.2%', confidence: 62 }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900/30 text-red-400 border-red-800'
      case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
      case 'low': return 'bg-green-900/30 text-green-400 border-green-800'
      default: return 'bg-dark-tertiary text-dark-secondary border-dark'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return TrendingUp
      case 'opportunity': return Target
      case 'risk': return AlertTriangle
      default: return Lightbulb
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading AI insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">AI Insights</h2>
          <p className="text-purple-200 text-lg">Advanced AI analysis and recommendations for your portfolio</p>
        </div>
        <Button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Refresh Insights
            </>
          )}
        </Button>
      </div>

      {/* AI Score */}
      <Card className="p-6 bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Portfolio Health Score</h3>
            <p className="text-purple-200">AI-powered assessment of your portfolio optimization</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-purple-300">{portfolioScore}</div>
            <div className="text-sm text-purple-200">/ 100</div>
          </div>
        </div>
        <div className="w-full bg-purple-900/30 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${portfolioScore}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-purple-200 mt-2">
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-6">AI Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const IconComponent = getTypeIcon(rec.type)
            return (
              <div key={index} className="border border-purple-500/20 rounded-lg p-4 hover:bg-purple-800/20 transition-colors bg-purple-900/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{rec.title}</h4>
                      <Badge className={`${getPriorityColor(rec.priority)} text-xs border`}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-400">{rec.impact}</div>
                  </div>
                </div>
                <p className="text-purple-200 mb-3">{rec.description}</p>
                <Button size="sm" variant="outline" className="border-purple-500/50 text-purple-200 hover:bg-purple-700/30">
                  {rec.action}
                </Button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Market Sentiment */}
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-6">Market Sentiment Analysis</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {marketSentiment.map((sentiment, index) => (
            <div key={index} className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{sentiment.metric}</h4>
                <Badge className={
                  sentiment.sentiment === 'Bullish' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  sentiment.sentiment === 'Bearish' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }>
                  {sentiment.sentiment}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-200">Confidence:</span>
                <div className="flex-1 bg-purple-900/40 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${sentiment.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-white">{sentiment.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Predictions */}
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-6">AI Yield Predictions</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 bg-blue-800/20 rounded-lg border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">{predictions.nextWeek.yield}</div>
            <div className="text-sm text-purple-200 mb-2">Next Week</div>
            <div className="text-xs text-purple-300">
              {predictions.nextWeek.confidence}% confidence
            </div>
          </div>
          <div className="text-center p-4 bg-purple-800/20 rounded-lg border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">{predictions.nextMonth.yield}</div>
            <div className="text-sm text-purple-200 mb-2">Next Month</div>
            <div className="text-xs text-purple-300">
              {predictions.nextMonth.confidence}% confidence
            </div>
          </div>
          <div className="text-center p-4 bg-green-800/20 rounded-lg border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">{predictions.nextQuarter.yield}</div>
            <div className="text-sm text-purple-200 mb-2">Next Quarter</div>
            <div className="text-xs text-purple-300">
              {predictions.nextQuarter.confidence}% confidence
            </div>
          </div>
        </div>
      </Card>

      {/* AI Info */}
      <Card className="p-6 bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Powered by Advanced AI</h3>
            <p className="text-purple-200 text-sm">
              Our AI models analyze real-time market data, protocol performance, gas optimization, 
              and risk factors to provide personalized recommendations for maximizing your DeFi yields 
              while minimizing risks.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
