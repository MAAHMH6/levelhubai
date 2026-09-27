import React, { useState } from "react";
import { FileText, Clock, Award, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AIMockExamsSectionProps {}

export function AIMockExamsSection({}: AIMockExamsSectionProps = {}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"marking" | "timer" | "boundaries">("marking");

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden" id="mock-exams">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>AI Mock Exams & Instant Marking</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Full Exam Simulation.{" "}
            <span className="bg-gradient-to-r from-rose-500 via-primary to-purple-600 bg-clip-text text-transparent">
              Instant AI Method Marking.
            </span>
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Experience real Cambridge exam hall conditions. Take timed past papers and receive instant, question-by-question method marks based on official mark schemes.
          </p>
        </div>

        {/* Feature Interactive Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3 Core Capabilities */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => setActiveTab("marking")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === "marking"
                  ? "bg-card border-rose-500/50 shadow-md ring-1 ring-rose-500/20"
                  : "bg-card/60 border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">Instant Method Marking</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Marks your typed or written steps with Cambridge M1 (Method), A1 (Accuracy), and B1 (Independent) criteria.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("timer")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === "timer"
                  ? "bg-card border-rose-500/50 shadow-md ring-1 ring-rose-500/20"
                  : "bg-card/60 border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">Real Exam Timer & Pressure Training</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Timed countdown with pacing alerts so you never run out of time on 6-mark questions in paper 4.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("boundaries")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                activeTab === "boundaries"
                  ? "bg-card border-rose-500/50 shadow-md ring-1 ring-rose-500/20"
                  : "bg-card/60 border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">Official Grade Boundary Mapping</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Matches your score against historical Cambridge threshold curves (June 2024, Nov 2023) to project your exact grade.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/mock-exams")}
                className="font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md"
              >
                Try an AI Mock Exam
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Mock Exam Cockpit Simulator */}
          <div className="lg:col-span-7 bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xl">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div>
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Cambridge Assessment International</span>
                <h4 className="text-lg font-extrabold text-foreground">IGCSE Physics (0625/42) — Mock Paper 4</h4>
              </div>
              <div className="flex items-center gap-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>01:14:22 Left</span>
              </div>
            </div>

            {/* Question Breakdown Preview */}
            <div className="py-5 space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground mb-1">
                  <span>Question 4 (Thermal Capacity & Latent Heat)</span>
                  <span className="text-foreground font-bold">[6 Marks]</span>
                </div>
                <p className="text-sm text-foreground">
                  A 2.5 kW electric kettle heats 0.80 kg of water from 22°C to 100°C. Calculate the minimum time taken. [Specific heat capacity of water = 4200 J/(kg·°C)]
                </p>
              </div>

              {/* Instant Marked Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Step 1: Q = mcΔθ = 0.80 × 4200 × 78 = 262,080 J</span>
                    <p className="text-muted-foreground text-[11px]">Correct formula and temperature difference (100 - 22)</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-background px-2 py-0.5 rounded border border-emerald-500/40">
                    M1 + A1
                  </span>
                </div>

                <div className="flex items-start justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Step 2: t = Q / P = 262,080 / 2500 = 104.8 s (approx 105 s)</span>
                    <p className="text-muted-foreground text-[11px]">Power in Watts and final time calculation</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-background px-2 py-0.5 rounded border border-emerald-500/40">
                    M1 + A1
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Result Bar */}
            <div className="pt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-black text-rose-500">6 / 6</div>
                <div className="text-xs text-muted-foreground">
                  <div>Full Marks Awarded</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold">Projected: Grade A* (Boundary: 82%)</div>
                </div>
              </div>

              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Verified Against Official Mark Scheme
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
