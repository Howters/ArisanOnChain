"use client";

import { motion } from "framer-motion";
import { Shield, Database, Users, Zap, Lock, AlertTriangle, Award } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SystemArchitectureDiagram() {
  const t = useTranslations("architecture");
  const components = t.raw("components");

  return (
    <div className="w-full max-w-5xl mx-auto py-12">
      <div className="relative">
        <svg viewBox="0 0 800 600" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="factoryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF6B35" stopOpacity="1" />
            </linearGradient>
            
            <linearGradient id="poolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#357ABD" stopOpacity="1" />
            </linearGradient>
            
            <linearGradient id="memberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16C47F" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10A368" stopOpacity="1" />
            </linearGradient>
            
            <linearGradient id="systemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9C27B0" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7B1FA2" stopOpacity="1" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Factory Contract */}
          <motion.g
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <rect x="280" y="40" width="240" height="100" rx="12" fill="url(#factoryGrad)" filter="url(#shadow)" />
            <rect x="290" y="50" width="220" height="80" rx="8" fill="rgba(255,255,255,0.1)" />
            
            <foreignObject x="300" y="65" width="200" height="50">
              <div className="flex items-center justify-center h-full">
                <Shield className="w-8 h-8 text-white mr-2" />
                <div className="text-white">
                  <div className="font-bold text-sm">{components.factory.title}</div>
                  <div className="text-xs opacity-80">{components.factory.subtitle}</div>
                </div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Connecting Lines from Factory to Pools */}
          <motion.path
            d="M 400 140 L 400 180"
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <motion.path
            d="M 400 140 L 200 200"
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
          <motion.path
            d="M 400 140 L 600 200"
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Pool 1 */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <rect x="100" y="200" width="200" height="80" rx="10" fill="url(#poolGrad)" filter="url(#shadow)" />
            <rect x="108" y="208" width="184" height="64" rx="8" fill="rgba(255,255,255,0.1)" />
            <foreignObject x="120" y="220" width="160" height="40">
              <div className="flex items-center justify-center h-full text-white">
                <Database className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-bold text-xs">{components.pool1.title}</div>
                  <div className="text-[10px] opacity-80">{components.pool1.subtitle}</div>
                </div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Pool 2 */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <rect x="300" y="200" width="200" height="80" rx="10" fill="url(#poolGrad)" filter="url(#shadow)" />
            <rect x="308" y="208" width="184" height="64" rx="8" fill="rgba(255,255,255,0.1)" />
            <foreignObject x="320" y="220" width="160" height="40">
              <div className="flex items-center justify-center h-full text-white">
                <Database className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-bold text-xs">{components.pool2.title}</div>
                  <div className="text-[10px] opacity-80">{components.pool2.subtitle}</div>
                </div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Pool 3 */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <rect x="500" y="200" width="200" height="80" rx="10" fill="url(#poolGrad)" filter="url(#shadow)" />
            <rect x="508" y="208" width="184" height="64" rx="8" fill="rgba(255,255,255,0.1)" />
            <foreignObject x="520" y="220" width="160" height="40">
              <div className="flex items-center justify-center h-full text-white">
                <Database className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-bold text-xs">{components.pool3.title}</div>
                  <div className="text-[10px] opacity-80">{components.pool3.subtitle}</div>
                </div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Lines from Pool 1 to Members */}
          <motion.path
            d="M 150 280 L 150 320"
            stroke="#16C47F"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          />
          <motion.path
            d="M 200 280 L 200 320"
            stroke="#16C47F"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          />
          <motion.path
            d="M 250 280 L 250 320"
            stroke="#16C47F"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          />

          {/* Members */}
          {[150, 200, 250].map((x, i) => (
            <motion.g
              key={`member-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.3 + i * 0.1 }}
            >
              <circle cx={x} cy="340" r="25" fill="url(#memberGrad)" filter="url(#shadow)" />
              <circle cx={x} cy="340" r="20" fill="rgba(255,255,255,0.2)" />
              <foreignObject x={x - 15} y="325" width="30" height="30">
                <div className="flex items-center justify-center h-full">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </foreignObject>
            </motion.g>
          ))}

          {/* Line to Token */}
          <motion.path
            d="M 400 280 L 400 380"
            stroke="#FFC107"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
          />

          {/* Token */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          >
            <rect x="300" y="380" width="200" height="80" rx="10" fill="#FFC107" filter="url(#shadow)" />
            <rect x="308" y="388" width="184" height="64" rx="8" fill="rgba(255,255,255,0.2)" />
            <foreignObject x="320" y="400" width="160" height="40">
              <div className="flex items-center justify-center h-full text-gray-900">
                <Zap className="w-6 h-6 mr-2" />
                <div>
                  <div className="font-bold text-xs">{components.token.title}</div>
                  <div className="text-[10px] opacity-70">{components.token.subtitle}</div>
                </div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Lines to Support Systems */}
          <motion.path
            d="M 300 440 L 180 490"
            stroke="#9C27B0"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 2 }}
          />
          <motion.path
            d="M 400 460 L 400 490"
            stroke="#9C27B0"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 2.1 }}
          />
          <motion.path
            d="M 500 440 L 620 490"
            stroke="#9C27B0"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
          />

          {/* DebtNFT */}
          <motion.g
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 2.3 }}
          >
            <rect x="80" y="490" width="140" height="70" rx="8" fill="url(#systemGrad)" filter="url(#shadow)" />
            <rect x="86" y="496" width="128" height="58" rx="6" fill="rgba(255,255,255,0.1)" />
            <foreignObject x="90" y="505" width="120" height="40">
              <div className="flex flex-col items-center justify-center h-full text-white text-center">
                <AlertTriangle className="w-5 h-5 mb-1" />
                <div className="font-bold text-[10px]">{components.debtNft.title}</div>
                <div className="text-[8px] opacity-70">{components.debtNft.subtitle}</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Reputation */}
          <motion.g
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 2.4 }}
          >
            <rect x="330" y="490" width="140" height="70" rx="8" fill="url(#systemGrad)" filter="url(#shadow)" />
            <rect x="336" y="496" width="128" height="58" rx="6" fill="rgba(255,255,255,0.1)" />
            <foreignObject x="340" y="505" width="120" height="40">
              <div className="flex flex-col items-center justify-center h-full text-white text-center">
                <Award className="w-5 h-5 mb-1" />
                <div className="font-bold text-[10px]">{components.reputation.title}</div>
                <div className="text-[8px] opacity-70">{components.reputation.subtitle}</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Platform Wallet */}
          <motion.g
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 2.5 }}
          >
            <rect x="580" y="490" width="140" height="70" rx="8" fill="url(#systemGrad)" filter="url(#shadow)" />
            <rect x="586" y="496" width="128" height="58" rx="6" fill="rgba(255,255,255,0.1)" />
            <foreignObject x="590" y="505" width="120" height="40">
              <div className="flex flex-col items-center justify-center h-full text-white text-center">
                <Lock className="w-5 h-5 mb-1" />
                <div className="font-bold text-[10px]">{components.wallet.title}</div>
                <div className="text-[8px] opacity-70">{components.wallet.subtitle}</div>
              </div>
            </foreignObject>
          </motion.g>

          {/* Animated Money Flows */}
          {[
            { x1: 100, y1: 340, x2: 350, y2: 420, delay: 2.6 },
            { x1: 200, y1: 340, x2: 400, y2: 420, delay: 2.7 },
            { x1: 250, y1: 340, x2: 450, y2: 420, delay: 2.8 },
          ].map((arrow, i) => (
            <motion.g key={`flow-${i}`}>
              <motion.path
                d={`M ${arrow.x1} ${arrow.y1} Q ${(arrow.x1 + arrow.x2) / 2} ${(arrow.y1 + arrow.y2) / 2 - 30} ${arrow.x2} ${arrow.y2}`}
                stroke="#22c55e"
                strokeWidth="1.5"
                fill="none"
                opacity="0.4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 0] }}
                transition={{ 
                  duration: 2, 
                  delay: arrow.delay,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
              <motion.circle
                r="3"
                fill="#22c55e"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 2,
                  delay: arrow.delay,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <animateMotion
                  dur="2s"
                  begin={`${arrow.delay}s`}
                  repeatCount="indefinite"
                  path={`M ${arrow.x1} ${arrow.y1} Q ${(arrow.x1 + arrow.x2) / 2} ${(arrow.y1 + arrow.y2) / 2 - 30} ${arrow.x2} ${arrow.y2}`}
                />
              </motion.circle>
            </motion.g>
          ))}
        </svg>

        <div className="mt-8 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#FF8C42]" />
              <span>{t("legend.factory")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#4A90E2]" />
              <span>{t("legend.pools")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#16C47F]" />
              <span>{t("legend.members")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#FFC107]" />
              <span>{t("legend.token")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#9C27B0]" />
              <span>{t("legend.support")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
