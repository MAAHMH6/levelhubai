import React, { useState, useMemo } from 'react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { resourcesStore, FormulaSheetRecord } from '@/lib/resourcesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FileCode2, 
  Search, 
  Copy, 
  Check, 
  Printer, 
  Sparkles, 
  Calculator,
  Atom,
  Binary,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export const FormulaSheetHubTool: React.FC = () => {
  const { programmeLabel } = useStudentProgramme();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  // Interactive Calculator State
  const [calcDialogOpen, setCalcDialogOpen] = useState<boolean>(false);
  const [activeCalculator, setActiveCalculator] = useState<string>('quadratic');

  // Quadratic state
  const [quadA, setQuadA] = useState<string>('1');
  const [quadB, setQuadB] = useState<string>('-5');
  const [quadC, setQuadC] = useState<string>('6');

  // Ohm state
  const [ohmV, setOhmV] = useState<string>('12');
  const [ohmI, setOhmI] = useState<string>('2');
  const [ohmR, setOhmR] = useState<string>('');

  // KE state
  const [keM, setKeM] = useState<string>('2');
  const [keV, setKeV] = useState<string>('10');

  // Moles state
  const [moleM, setMoleM] = useState<string>('44');
  const [moleMr, setMoleMr] = useState<string>('44');

  const sheets: FormulaSheetRecord[] = useMemo(() => {
    return resourcesStore.getAllFormulaSheets();
  }, []);

  const handleCopy = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    toast.success('Formula copied to clipboard!');
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const filteredSheets = useMemo(() => {
    return sheets.filter((sheet) => {
      if (sheet.status === 'archived') return false;
      if (selectedSubject !== 'all' && !sheet.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = sheet.title.toLowerCase().includes(q);
        const matchTopic = sheet.topic.toLowerCase().includes(q);
        const matchFormula = sheet.sections.some(sec => 
          sec.items.some(item => item.name.toLowerCase().includes(q) || item.formula.toLowerCase().includes(q))
        );
        if (!matchTitle && !matchTopic && !matchFormula) return false;
      }
      return true;
    });
  }, [sheets, selectedSubject, searchQuery]);

  const subjects = useMemo(() => {
    return Array.from(new Set(sheets.map(s => s.subject)));
  }, [sheets]);

  // Quadratic Calculation
  const quadraticResult = useMemo(() => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);
    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

    const disc = b * b - 4 * a * c;
    if (disc < 0) {
      return {
        discriminant: disc,
        message: 'No real roots (Discriminant < 0). Complex roots only.',
      };
    }
    const root1 = (-b + Math.sqrt(disc)) / (2 * a);
    const root2 = (-b - Math.sqrt(disc)) / (2 * a);
    return {
      discriminant: disc,
      root1: Number(root1.toFixed(4)),
      root2: Number(root2.toFixed(4)),
    };
  }, [quadA, quadB, quadC]);

  // Kinetic Energy Calculation
  const keResult = useMemo(() => {
    const m = parseFloat(keM);
    const v = parseFloat(keV);
    if (isNaN(m) || isNaN(v) || m < 0) return null;
    const ke = 0.5 * m * v * v;
    return Number(ke.toFixed(2));
  }, [keM, keV]);

  // Moles Calculation
  const moleResult = useMemo(() => {
    const m = parseFloat(moleM);
    const mr = parseFloat(moleMr);
    if (isNaN(m) || isNaN(mr) || mr === 0) return null;
    const moles = m / mr;
    const gasVol = moles * 24;
    return {
      moles: Number(moles.toFixed(4)),
      gasVolumeDm3: Number(gasVol.toFixed(2)),
    };
  }, [moleM, moleMr]);

  return (
    <div className="space-y-6 print:p-0">
      {/* Top Banner (Hidden in print) */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-blue-500/20 text-white shadow-md print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase mb-3">
              <FileCode2 className="w-3.5 h-3.5" />
              Cambridge Official Syllabus Formulas
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Formula Sheet Hub & Solvers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Official Cambridge CIE formulas for Mathematics, Physics, and Chemistry. Includes interactive step-by-step formula calculators and 1-click print export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setCalcDialogOpen(true)}
              className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              <span>Interactive Formula Solvers</span>
            </Button>

            <Button
              onClick={() => window.print()}
              variant="outline"
              className="rounded-xl text-xs font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700 gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF Export</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search formula, variable or topic (e.g. Pythagoras, Snell, PV=nRT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-slate-800/90 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-10 text-xs rounded-xl bg-slate-800/90 border-slate-700 text-white">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white text-xs">
              <SelectItem value="all">All Cambridge Subjects</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Formula Sheets Grid */}
      <div className="space-y-6">
        {filteredSheets.map((sheet) => (
          <Card key={sheet.id} className="p-6 rounded-3xl border-border bg-card shadow-sm hover:border-blue-500/40 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/80">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-600 dark:text-blue-400">
                    {sheet.subject}
                  </Badge>
                  <span className="text-xs text-muted-foreground">• {sheet.topic}</span>
                </div>
                <h3 className="text-lg font-black text-foreground mt-1">{sheet.title}</h3>
              </div>

              <div className="text-xs text-muted-foreground italic">
                Cambridge CAIE Aligned
              </div>
            </div>

            {/* Sections & Formulas */}
            <div className="mt-5 space-y-6">
              {sheet.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {section.title}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.items.map((item, iIdx) => (
                      <div
                        key={iIdx}
                        className="p-4 rounded-2xl bg-muted/50 border border-border/70 hover:border-blue-500/50 transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-1 pr-3">
                          <div className="text-xs font-semibold text-muted-foreground">
                            {item.name}
                          </div>
                          <div className="text-base font-black font-mono text-foreground tracking-tight select-all">
                            {item.formula}
                          </div>
                          {item.explanation && (
                            <div className="text-[11px] text-muted-foreground">
                              {item.explanation}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.formula)}
                          className="h-8 px-2.5 rounded-xl text-xs gap-1 text-muted-foreground hover:text-blue-600 shrink-0 print:hidden"
                          title="Copy formula"
                        >
                          {copiedFormula === item.formula ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Formula Solver Dialog */}
      <Dialog open={calcDialogOpen} onOpenChange={setCalcDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              Cambridge Interactive Formula Solvers
            </DialogTitle>
          </DialogHeader>

          {/* Calculator Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { id: 'quadratic', label: 'Quadratic Equation' },
              { id: 'kinetic', label: 'Kinetic Energy' },
              { id: 'moles', label: 'Moles & Gas Volume' },
            ].map(calc => (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  activeCalculator === calc.id 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {calc.label}
              </button>
            ))}
          </div>

          {/* Active Calculator Views */}
          <div className="mt-4 p-4 rounded-2xl bg-muted/40 border border-border space-y-4">
            {activeCalculator === 'quadratic' && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-mono">
                  ax² + bx + c = 0
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">a</label>
                    <Input
                      type="number"
                      value={quadA}
                      onChange={e => setQuadA(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">b</label>
                    <Input
                      type="number"
                      value={quadB}
                      onChange={e => setQuadB(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">c</label>
                    <Input
                      type="number"
                      value={quadC}
                      onChange={e => setQuadC(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {quadraticResult && (
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1 text-xs">
                    <div className="font-bold text-foreground">
                      Discriminant (b² - 4ac) = {quadraticResult.discriminant}
                    </div>
                    {quadraticResult.root1 !== undefined ? (
                      <div className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                        x₁ = {quadraticResult.root1}, x₂ = {quadraticResult.root2}
                      </div>
                    ) : (
                      <div className="text-amber-500">{quadraticResult.message}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeCalculator === 'kinetic' && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-mono">
                  KE = ½ m v²
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Mass m (kg)</label>
                    <Input
                      type="number"
                      value={keM}
                      onChange={e => setKeM(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Velocity v (m/s)</label>
                    <Input
                      type="number"
                      value={keV}
                      onChange={e => setKeV(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {keResult !== null && (
                  <div className="p-3 rounded-xl bg-card border border-border text-xs">
                    <span className="text-muted-foreground">Kinetic Energy = </span>
                    <strong className="text-blue-600 dark:text-blue-400 text-sm font-mono">{keResult} Joules (J)</strong>
                  </div>
                )}
              </div>
            )}

            {activeCalculator === 'moles' && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-mono">
                  Moles n = Mass (g) / Molar Mass Mr
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Mass (grams)</label>
                    <Input
                      type="number"
                      value={moleM}
                      onChange={e => setMoleM(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground block mb-1">Molar Mass Mr (g/mol)</label>
                    <Input
                      type="number"
                      value={moleMr}
                      onChange={e => setMoleMr(e.target.value)}
                      className="h-8 text-xs rounded-xl"
                    />
                  </div>
                </div>

                {moleResult && (
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">Amount = </span>
                      <strong className="text-blue-600 dark:text-blue-400 font-mono">{moleResult.moles} moles</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gas Volume at r.t.p. = </span>
                      <strong className="text-foreground font-mono">{moleResult.gasVolumeDm3} dm³</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
