"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Lock, Users, Wallet, Trophy, CheckCircle, 
  AlertTriangle, Zap, Eye, Ban, Award, ArrowDown, 
  XCircle, Info, Play, Pause
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export default function TrustFlowDiagram() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showDefaultPath, setShowDefaultPath] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const t = useTranslations("trustFlow");

  const flowSteps = [
    {
      id: 1,
      icon: Users,
      color: "#FF8C42",
      trustPointIcon: Lock,
    },
    {
      id: 2,
      icon: Lock,
      color: "#4A90E2",
      trustPointIcon: Shield,
    },
    {
      id: 3,
      icon: Play,
      color: "#16C47F",
      trustPointIcon: CheckCircle,
    },
    {
      id: 4,
      icon: Wallet,
      color: "#FFC107",
      trustPointIcon: Zap,
    },
    {
      id: 5,
      icon: Trophy,
      color: "#9C27B0",
      trustPointIcon: Eye,
    },
    {
      id: 6,
      icon: Award,
      color: "#E91E63",
      trustPointIcon: Shield,
    },
    {
      id: 7,
      icon: CheckCircle,
      color: "#10B981",
      trustPointIcon: CheckCircle,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
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
          
          <Button
            variant={showDefaultPath ? "destructive" : "outline"}
            size="sm"
            onClick={() => setShowDefaultPath(!showDefaultPath)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {showDefaultPath ? t("hideDefault") : t("showDefault")}
          </Button>
        </div>
      </div>

      <div className="relative">
        {flowSteps.map((step, index) => {
          const Icon = step.icon;
          const TrustIcon = step.trustPointIcon;
          const isExpanded = expandedStep === step.id;
          const isLast = index === flowSteps.length - 1;
          
          const stepKey = `step${step.id}` as const;
          const stepData = t.raw(`steps.${stepKey}`);

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isAnimating ? index * 0.1 : 0 }}
              className="mb-6"
            >
              <Card 
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  isExpanded ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                }`}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                style={{ borderLeft: `4px solid ${step.color}` }}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <motion.div
                      animate={isAnimating ? { 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ 
                        duration: 2, 
                        delay: index * 0.2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: step.color }} />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="shrink-0">
                          {t("step")} {step.id}
                        </Badge>
                        <h3 className="font-bold text-lg">{stepData.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{stepData.subtitle}</p>
                      
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium">
                        <Zap className="w-4 h-4" />
                        {stepData.enforcement}
                      </div>
                    </div>

                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="shrink-0"
                    >
                      <Info className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {t("howItWorks")}
                            </h4>
                            <ul className="space-y-2">
                              {stepData.details.map((detail: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-muted-foreground mt-1">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <div 
                              className="p-4 rounded-lg border-2"
                              style={{ 
                                backgroundColor: `${step.color}10`,
                                borderColor: `${step.color}40`
                              }}
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <TrustIcon 
                                  className="w-5 h-5" 
                                  style={{ color: step.color }}
                                />
                                <h5 className="font-bold text-sm">
                                  {stepData.trustPoint.title}
                                </h5>
                              </div>
                              <p className="text-sm leading-relaxed mb-3">
                                {stepData.trustPoint.description}
                              </p>
                              {stepData.trustPoint.math && (
                                <div className="bg-black/5 dark:bg-white/5 p-2 rounded text-xs font-mono">
                                  {stepData.trustPoint.math}
                                </div>
                              )}
                            </div>

                            {stepData.example && (
                              <div className="mt-4 bg-muted p-4 rounded-lg text-sm">
                                <span className="font-semibold">{t("example")} </span>
                                {stepData.example}
                              </div>
                            )}

                            {stepData.warning && (
                              <div className="mt-3 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-red-500">{stepData.warning}</p>
                              </div>
                            )}

                            {stepData.bonus && (
                              <div className="mt-3 bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-sm text-green-600">
                                {stepData.bonus}
                              </div>
                            )}

                            {stepData.math && (
                              <div className="mt-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-sm font-mono">
                                {stepData.math}
                              </div>
                            )}

                            {stepData.options && (
                              <div className="mt-3 space-y-2">
                                <h5 className="font-semibold text-sm">{t("possibilities")}</h5>
                                {stepData.options.map((opt: {label: string, path: string}, i: number) => (
                                  <div key={i} className="text-sm flex items-center gap-2">
                                    <span>{opt.label}</span>
                                    <span className="text-muted-foreground">→ {opt.path}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {showDefaultPath && stepData.defaultScenario && (
                              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border-2 border-red-500/20">
                                <h5 className="font-bold text-sm text-red-600 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  {t("defaultButton")}
                                </h5>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {stepData.defaultScenario.trigger}
                                </p>
                                <ul className="space-y-1">
                                  {stepData.defaultScenario.actions.map((action: string, i: number) => (
                                    <li key={i} className="text-xs">{action}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>

              {!isLast && (
                <div className="flex justify-center my-3">
                  <motion.div
                    animate={isAnimating ? { 
                      y: [0, 10, 0],
                      opacity: [0.5, 1, 0.5]
                    } : {}}
                    transition={{ 
                      duration: 1.5, 
                      delay: index * 0.2,
                      repeat: Infinity 
                    }}
                  >
                    <ArrowDown className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/20">
        <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          {t("whyTrustless")}
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="font-semibold mb-2">{t("moneyLocked.title")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("moneyLocked.desc")}
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-semibold mb-2">{t("autoEnforce.title")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("autoEnforce.desc")}
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="font-semibold mb-2">{t("transparent.title")}</h4>
            <p className="text-sm text-muted-foreground">
              {t("transparent.desc")}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-primary/20 text-center">
          <p className="text-sm font-medium text-primary">
            💡 {t("bottomLine")} <span className="font-bold">{t("bottomLineText")}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t("bottomLineSubtext")}
          </p>
        </div>
      </div>
    </div>
  );
}
