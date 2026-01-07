"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, Lock, Users, Wallet, Trophy, CheckCircle, 
  AlertCircle, Zap, ArrowRight, Play, Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function TrustFlowVisual() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showPath, setShowPath] = useState<"happy" | "default">("happy");
  const t = useTranslations("trustFlow");

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          {t("badge")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          {t("title")}
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          {t("description")}
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant={isAnimating ? "default" : "outline"}
            size="sm"
            onClick={() => setIsAnimating(!isAnimating)}
          >
            {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isAnimating ? t("pauseAnimation") : t("playAnimation")}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant={showPath === "happy" ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPath("happy")}
              className="bg-green-500 hover:bg-green-600"
            >
              ✅ Happy Path
            </Button>
            <Button
              variant={showPath === "default" ? "destructive" : "outline"}
              size="sm"
              onClick={() => setShowPath("default")}
            >
              ⚠️ Default Path
            </Button>
          </div>
        </div>
      </div>

      {/* Visual Flow Diagram */}
      <div className="relative min-h-[800px]">
        <svg
          viewBox="0 0 1200 1000"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="errorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="stepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            
            {/* Glow effects */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Happy Path Flow */}
          {showPath === "happy" && (
            <>
              {/* Main Flow Line */}
              <motion.path
                d="M 600 100 L 600 200 L 400 300 L 400 400 L 600 500 L 600 600 L 800 700 L 800 800"
                stroke="url(#successGrad)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isAnimating ? 1 : 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Animated particle */}
              {isAnimating && (
                <motion.circle
                  r="8"
                  fill="#22c55e"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M 600 100 L 600 200 L 400 300 L 400 400 L 600 500 L 600 600 L 800 700 L 800 800"
                  />
                </motion.circle>
              )}
            </>
          )}

          {/* Default Path Flow */}
          {showPath === "default" && (
            <>
              {/* Branch to Default */}
              <motion.path
                d="M 600 100 L 600 200 L 400 300 L 400 400 L 200 500 L 200 650"
                stroke="url(#errorGrad)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {isAnimating && (
                <motion.circle
                  r="8"
                  fill="#ef4444"
                  filter="url(#glow)"
                >
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path="M 600 100 L 600 200 L 400 300 L 400 400 L 200 500 L 200 650"
                  />
                </motion.circle>
              )}
            </>
          )}

          {/* Step 1: Create Pool */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <circle cx="600" cy="100" r="60" fill="url(#stepGrad)" filter="url(#shadow)" />
            <foreignObject x="540" y="40" width="120" height="120">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Users className="w-10 h-10 mb-2" />
                <div className="text-xs font-bold text-center">Create Pool</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Step 2: Lock Deposit */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <rect x="540" y="180" width="120" height="80" rx="15" fill="url(#stepGrad)" filter="url(#shadow)" />
            <foreignObject x="540" y="185" width="120" height="70">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Lock className="w-8 h-8 mb-1" />
                <div className="text-xs font-bold text-center">Lock Deposit</div>
                <div className="text-[10px] opacity-80">Rp 2jt</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Step 3: Activate */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <circle cx="400" cy="300" r="50" fill="url(#stepGrad)" filter="url(#shadow)" />
            <foreignObject x="350" y="260" width="100" height="80">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Zap className="w-8 h-8 mb-1" />
                <div className="text-xs font-bold text-center">Activate</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Step 4: Pay Contribution */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <rect x="320" y="360" width="160" height="90" rx="20" fill="url(#stepGrad)" filter="url(#shadow)" />
            <foreignObject x="330" y="370" width="140" height="70">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Wallet className="w-10 h-10 mb-1" />
                <div className="text-sm font-bold text-center">Pay Monthly</div>
                <div className="text-xs opacity-80">Rp 1jt x 4</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Branch Decision */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <polygon
              points="400,470 500,520 400,570 300,520"
              fill="#FFC107"
              filter="url(#shadow)"
            />
            <foreignObject x="340" y="495" width="120" height="50">
              <div className="flex items-center justify-center h-full">
                <div className="text-xs font-bold text-center text-gray-900">
                  Everyone<br/>Paid?
                </div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Happy Path: Winner */}
          {showPath === "happy" && (
            <>
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <circle cx="600" cy="600" r="60" fill="url(#successGrad)" filter="url(#shadow)" />
                <foreignObject x="540" y="540" width="120" height="120">
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <Trophy className="w-10 h-10 mb-2" />
                    <div className="text-xs font-bold text-center">Winner Claims</div>
                    <div className="text-[10px] opacity-90">Rp 3.94jt</div>
                  </div>
                </foreignObject>
              </motion.g>

              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <rect x="720" y="660" width="160" height="100" rx="20" fill="url(#successGrad)" filter="url(#shadow)" />
                <foreignObject x="730" y="675" width="140" height="70">
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <CheckCircle className="w-12 h-12 mb-2" />
                    <div className="text-sm font-bold text-center">Complete!</div>
                    <div className="text-xs opacity-90">Get deposit back</div>
                  </div>
                </foreignObject>
              </motion.g>
            </>
          )}

          {/* Default Path: Penalty */}
          {showPath === "default" && (
            <>
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <rect x="120" y="580" width="160" height="140" rx="20" fill="url(#errorGrad)" filter="url(#shadow)" />
                <foreignObject x="130" y="595" width="140" height="110">
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <AlertCircle className="w-12 h-12 mb-2" />
                    <div className="text-sm font-bold text-center mb-2">PENALTY</div>
                    <div className="text-[10px] text-center space-y-1">
                      <div>⚡ Deposit Seized</div>
                      <div>💀 DebtNFT</div>
                      <div>🚫 Banned</div>
                    </div>
                  </div>
                </foreignObject>
              </motion.g>
            </>
          )}

          {/* Labels */}
          <text x="520" y="525" fontSize="12" fill="#22c55e" fontWeight="bold">
            ✓ YES
          </text>
          <text x="260" y="470" fontSize="12" fill="#ef4444" fontWeight="bold">
            ✗ NO
          </text>
        </svg>

        {/* Trust Points - Floating Cards */}
        <div className="absolute top-0 right-0 space-y-3 hidden xl:block">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">Math > Trust</div>
                <div className="text-xs text-muted-foreground">
                  Deposit (Rp 2jt) &gt; Contribution (Rp 1jt)
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">Auto Penalty</div>
                <div className="text-xs text-muted-foreground">
                  No voting needed. Code enforces rules.
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 max-w-xs"
          >
            <div className="flex items-start gap-3">
              <Lock className="w-6 h-6 text-purple-500 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">Money Locked</div>
                <div className="text-xs text-muted-foreground">
                  Smart contract holds funds. Can't steal.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-bold text-lg">Happy Path</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>All members pay on time</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Everyone gets their turn</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Deposit returned in full</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Reputation +1</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/10 border-2 border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-lg">Default Path</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Member doesn't pay &gt;7 days</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Deposit automatically seized</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Permanent DebtNFT minted</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Banned from platform</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

