"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, Lock, Users, Wallet, Trophy, CheckCircle, 
  AlertCircle, Zap, ArrowRight, Play, Pause, TrendingUp,
  Coins, ArrowUpCircle, User, DollarSign, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function TrustFlowVisual() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [showPath, setShowPath] = useState<"happy" | "default">("happy");
  const t = useTranslations("trustFlow");

  const memberColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];
  const memberNames = ["Siti", "Ani", "Budi", "Citra"];

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
      <div className="relative min-h-[900px]">
        <svg
          viewBox="0 0 1200 1100"
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
            <linearGradient id="yieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
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
                d="M 600 100 L 600 200 L 400 300 L 400 450 L 600 550 L 600 650 L 800 750 L 800 850"
                stroke="url(#successGrad)"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isAnimating ? 1 : 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Animated particle on main path */}
              {isAnimating && (
                <motion.circle
                  r="8"
                  fill="#22c55e"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: "100%" }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <animateMotion
                    dur="5s"
                    repeatCount="indefinite"
                    path="M 600 100 L 600 200 L 400 300 L 400 450 L 600 550 L 600 650 L 800 750 L 800 850"
                  />
                </motion.circle>
              )}
            </>
          )}

          {/* Deposit to Yield Vault Flow */}
          <motion.path
            d="M 600 220 L 900 220 L 900 350"
            stroke="url(#yieldGrad)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="8,4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          
          {/* Animated coins flowing to yield vault */}
          {isAnimating && (
            <>
              <motion.circle r="4" fill="#f59e0b" filter="url(#glow)">
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  path="M 600 220 L 900 220 L 900 350"
                />
              </motion.circle>
              <motion.circle r="4" fill="#f59e0b" filter="url(#glow)">
                <animateMotion
                  dur="2s"
                  begin="0.5s"
                  repeatCount="indefinite"
                  path="M 600 220 L 900 220 L 900 350"
                />
              </motion.circle>
              <motion.circle r="4" fill="#f59e0b" filter="url(#glow)">
                <animateMotion
                  dur="2s"
                  begin="1s"
                  repeatCount="indefinite"
                  path="M 600 220 L 900 220 L 900 350"
                />
              </motion.circle>
            </>
          )}

          {/* Member Avatars Contributing (NEW!) */}
          {showPath === "happy" && (
            <>
              {memberColors.map((color, i) => {
                const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
                const startX = 400 + Math.cos(angle) * 100;
                const startY = 450 + Math.sin(angle) * 100;
                
                return (
                  <g key={i}>
                    {/* Member Avatar */}
                    <motion.g
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.2 + i * 0.1, duration: 0.3 }}
                    >
                      <circle cx={startX} cy={startY} r="25" fill={color} filter="url(#shadow)" />
                      <foreignObject x={startX - 12} y={startY - 12} width="24" height="24">
                        <div className="flex items-center justify-center h-full">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </foreignObject>
                      <text
                        x={startX}
                        y={startY + 40}
                        fontSize="11"
                        fill="currentColor"
                        textAnchor="middle"
                        className="fill-muted-foreground font-semibold"
                      >
                        {memberNames[i]}
                      </text>
                    </motion.g>

                    {/* Contribution Flow Line */}
                    <motion.path
                      d={`M ${startX} ${startY} L 200 450`}
                      stroke={color}
                      strokeWidth="2"
                      strokeDasharray="5,3"
                      fill="none"
                      opacity="0.6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 1.5 + i * 0.1 }}
                    />

                    {/* Animated contribution coins */}
                    {isAnimating && (
                      <motion.circle r="4" fill={color} filter="url(#glow)">
                        <animateMotion
                          dur="2s"
                          begin={`${i * 0.3}s`}
                          repeatCount="indefinite"
                          path={`M ${startX} ${startY} L 200 450`}
                        />
                      </motion.circle>
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* Contributions to Pool Pot */}
          <motion.path
            d="M 200 500 L 200 580"
            stroke="url(#potGrad)"
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 2 }}
          />

          {/* Default Path Flow */}
          {showPath === "default" && (
            <>
              {/* Branch to Default */}
              <motion.path
                d="M 600 100 L 600 200 L 400 300 L 400 450 L 950 550 L 950 680"
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
                    dur="5s"
                    repeatCount="indefinite"
                    path="M 600 100 L 600 200 L 400 300 L 400 450 L 950 550 L 950 680"
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
                <div className="text-[10px] opacity-80">Rp 2jt × 4</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Yield Vault */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <rect x="820" y="350" width="160" height="120" rx="20" fill="url(#yieldGrad)" filter="url(#shadow)" />
            <foreignObject x="830" y="365" width="140" height="90">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <TrendingUp className="w-10 h-10 mb-2" />
                <div className="text-sm font-bold text-center">Yield Vault</div>
                <div className="text-xs opacity-90 text-center">Earning ~5% APY</div>
                {isAnimating && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10px] mt-1"
                  >
                    💰 +Rp 400k/year
                  </motion.div>
                )}
              </div>
            </foreignObject>
          </motion.g>

          {/* Step 3: Activate */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <circle cx="400" cy="300" r="50" fill="url(#stepGrad)" filter="url(#shadow)" />
            <foreignObject x="350" y="260" width="100" height="80">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Zap className="w-8 h-8 mb-1" />
                <div className="text-xs font-bold text-center">Activate</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Step 4: Pay Contribution (Central Hub) */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <circle cx="400" cy="450" r="60" fill="url(#stepGrad)" filter="url(#shadow)" />
            <foreignObject x="340" y="400" width="120" height="100">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Wallet className="w-10 h-10 mb-1" />
                <div className="text-xs font-bold text-center">Contributions</div>
                <div className="text-[10px] opacity-80">Rp 1jt each</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Pool Pot */}
          {showPath === "happy" && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            >
              <circle cx="200" cy="650" r="70" fill="url(#potGrad)" filter="url(#shadow)" />
              <foreignObject x="130" y="580" width="140" height="140">
                <div className="flex flex-col items-center justify-center h-full text-white">
                  <Coins className="w-12 h-12 mb-2" />
                  <div className="text-sm font-bold text-center">Pool Pot</div>
                  <div className="text-lg font-bold mt-1">Rp 4jt</div>
                  {isAnimating && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="text-xl mt-1"
                    >
                      💰
                    </motion.div>
                  )}
                </div>
              </foreignObject>
            </motion.g>
          )}

          {/* Branch Decision */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.5 }}
          >
            <polygon
              points="600,520 700,570 600,620 500,570"
              fill="#FFC107"
              filter="url(#shadow)"
            />
            <foreignObject x="540" y="545" width="120" height="50">
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
              {/* Arrow from pot to winner */}
              <motion.path
                d="M 270 650 L 540 650"
                stroke="url(#successGrad)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="8,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 2.6 }}
              />

              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.8, duration: 0.5 }}
              >
                <circle cx="600" cy="650" r="60" fill="url(#successGrad)" filter="url(#shadow)" />
                <foreignObject x="540" y="590" width="120" height="120">
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <Trophy className="w-10 h-10 mb-2" />
                    <div className="text-xs font-bold text-center">Siti Wins!</div>
                    <div className="text-sm font-bold">Rp 3.94jt</div>
                  </div>
                </foreignObject>
              </motion.g>

              {/* Platform Fee Breakdown (NEW!) */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 3, duration: 0.5 }}
              >
                <rect x="540" y="730" width="120" height="100" rx="15" fill="#6366f1" fillOpacity="0.3" stroke="#6366f1" strokeWidth="2" filter="url(#shadow)" />
                <foreignObject x="545" y="740" width="110" height="80">
                  <div className="text-center text-white">
                    <div className="text-[10px] font-bold mb-2">Fee Breakdown</div>
                    <div className="text-[9px] space-y-1">
                      <div className="flex justify-between">
                        <span>Total Pot:</span>
                        <span className="font-bold">Rp 4.00jt</span>
                      </div>
                      <div className="flex justify-between text-amber-300">
                        <span>Platform (1.5%):</span>
                        <span className="font-bold">-Rp 60k</span>
                      </div>
                      <div className="border-t border-white/20 pt-1 flex justify-between text-green-300">
                        <span>Winner Gets:</span>
                        <span className="font-bold">Rp 3.94jt</span>
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </motion.g>

              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 3.2, duration: 0.5 }}
              >
                <rect x="720" y="710" width="160" height="140" rx="20" fill="url(#successGrad)" filter="url(#shadow)" />
                <foreignObject x="730" y="725" width="140" height="110">
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <CheckCircle className="w-12 h-12 mb-2" />
                    <div className="text-sm font-bold text-center">Complete!</div>
                    <div className="text-[10px] opacity-90 space-y-0.5 mt-1">
                      <div>✓ Get deposit: Rp 2jt</div>
                      <div>✓ +Yield: Rp 100k</div>
                      <div>✓ Reputation +1</div>
                    </div>
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
                transition={{ delay: 2.6, duration: 0.5 }}
              >
                <rect x="870" y="680" width="160" height="160" rx="20" fill="url(#errorGrad)" filter="url(#shadow)" />
                <foreignObject x="880" y="695" width="140" height="130">
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    <AlertCircle className="w-12 h-12 mb-2" />
                    <div className="text-sm font-bold text-center mb-2">AUTOMATIC PENALTY</div>
                    <div className="text-[10px] text-center space-y-1">
                      <div>⚡ Deposit Seized (Rp 2jt)</div>
                      <div>💀 DebtNFT Minted</div>
                      <div>📉 Reputation = 0</div>
                      <div>🚫 Platform Ban</div>
                    </div>
                  </div>
                </foreignObject>
              </motion.g>
            </>
          )}

          {/* Labels */}
          {showPath === "happy" && (
            <text x="620" y="575" fontSize="12" fill="#22c55e" fontWeight="bold">
              ✓ YES
            </text>
          )}
          {showPath === "default" && (
            <text x="700" y="555" fontSize="12" fill="#ef4444" fontWeight="bold">
              ✗ NO
            </text>
          )}
        </svg>

        {/* Trust Points - Floating Cards */}
        <div className="absolute top-0 right-0 space-y-3 hidden xl:block max-w-xs">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">Math &gt; Trust</div>
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
            className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">Deposits Earn Yield</div>
                <div className="text-xs text-muted-foreground">
                  Your deposit earns ~5% APY while locked
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4"
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
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-purple-500 shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">Transparent Fees</div>
                <div className="text-xs text-muted-foreground">
                  Only 1.5% platform fee. Fully visible.
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
              <span>4 members lock Rp 2jt deposit each</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Deposits earn yield (~5% APY = Rp 100k/year)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>All pay Rp 1jt monthly → Pot: Rp 4jt</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Winner gets Rp 3.94jt (after 1.5% fee)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Complete → Get deposit + yield back</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Reputation +1 (permanent on-chain)</span>
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
              <span>Member doesn't pay &gt;7 days grace period</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Deposit (Rp 2jt) automatically seized</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Permanent DebtNFT minted to wallet</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Reputation destroyed (visible on-chain)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Banned from platform forever</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Seized funds compensate other members</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
