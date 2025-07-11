import Head from 'next/head'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>YieldAgentX - Autonomous DeFi & VRF Raffles</title>
        <meta name="description" content="AI-powered DeFi portfolio management with Chainlink automation and verifiable random raffles" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Hero Section */}
        <main className="relative z-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                  <span className="gradient-text">Autonomous</span>
                  <br />
                  DeFi Agents
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  AI-powered portfolio management with Chainlink automation. 
                  Create intelligent agents that optimize your DeFi yields 24/7 
                  while you participate in verifiable random raffles.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              >
                <Link
                  href="/agents"
                  className="group bg-gradient-to-r from-primary-600 to-chainlink-blue text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-primary-700 hover:to-chainlink-dark transition-all duration-200 transform hover:scale-105 flex items-center gap-3"
                >
                  Launch AI Agents
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  href="/raffle"
                  className="group bg-gradient-to-r from-accent-purple to-accent-rose text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-3"
                >
                  Join VRF Raffle
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Link>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              >
                <div className="card-modern card-glow glass-light border border-secondary-700/50 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-chainlink-blue rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Autonomous Security</h3>
                  <p className="text-secondary-300 leading-relaxed">
                    AI agents powered by Chainlink automation ensure your portfolio is actively managed and optimized without manual intervention.
                  </p>
                </div>

                <div className="card-modern card-glow glass-light border border-secondary-700/50 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent-purple to-accent-rose rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Verifiable Randomness</h3>
                  <p className="text-secondary-300 leading-relaxed">
                    Participate in provably fair raffles powered by Chainlink VRF v2.5 for transparent and unbiased winner selection.
                  </p>
                </div>

                <div className="card-modern card-glow glass-light border border-secondary-700/50 rounded-2xl p-8 hover:border-primary-500/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent-emerald to-accent-cyan rounded-xl flex items-center justify-center mb-6 mx-auto">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Optimized Yields</h3>
                  <p className="text-secondary-300 leading-relaxed">
                    Choose from Conservative, Balanced, or Aggressive strategies. AI optimizes allocations across Lido, Aave, Uniswap, and more.
                  </p>
                </div>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
                  <div className="text-secondary-400">Autonomous Operation</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">3</div>
                  <div className="text-secondary-400">Strategy Types</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">5+</div>
                  <div className="text-secondary-400">DeFi Protocols</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold chainlink-text mb-2">VRF</div>
                  <div className="text-secondary-400">Verifiable Random</div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
        </div>
      </div>
    </>
  )
}
