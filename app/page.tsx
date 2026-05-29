"use client";

import { useState, useMemo } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"tension" | "torsion" | "beam">("tension");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-7">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Engineering Calculators
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-light">
            Structural Analysis & Design Tools
          </p>
        </div>
      </header>

      {/* TAB NAVIGATION */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("tension")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "tension"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Tension & Compression
            </button>
            <button
              onClick={() => setActiveTab("torsion")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "torsion"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Torsion
            </button>
            <button
              onClick={() => setActiveTab("beam")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "beam"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              Beam Deflection
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        {activeTab === "tension" && <TensionTab />}
        {activeTab === "torsion" && <TorsionTab />}
        {activeTab === "beam" && <BeamTab />}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAB 1: TENSION & COMPRESSION
// ═══════════════════════════════════════════════════════════════════════════

function TensionTab() {
  const [L1, setL1] = useState(280);
  const [L2, setL2] = useState(400);
  const [L3, setL3] = useState(280);
  const [A1, setA1] = useState(58);
  const [A2, setA2] = useState(78);
  const [A3, setA3] = useState(78);
  const [c1, setC1] = useState(2);
  const [c2, setC2] = useState(-1);
  const [c3, setC3] = useState(1);
  const [sigma_allow, setSigmaAllow] = useState(180);
  const [E, setE] = useState(205);
  const [s_allow, setSAllow] = useState(0.3);

  const calculations = useMemo(() => {
    const A1_m2 = A1 * 1e-4;
    const A2_m2 = A2 * 1e-4;
    const A3_m2 = A3 * 1e-4;
    const L1_m = L1 * 1e-3;
    const L2_m = L2 * 1e-3;
    const L3_m = L3 * 1e-3;
    const E_Pa = E * 1e9;
    const sigma_allow_Pa = sigma_allow * 1e6;
    const s_allow_m = s_allow * 1e-3;

    const N_12 = c1;
    const N_34 = c1 + c2;
    const N_56 = c1 + c2 + c3;

    const sigma_12_coeff = (N_12 * 1000) / A1_m2;
    const sigma_34_coeff = (N_34 * 1000) / A2_m2;
    const sigma_56_coeff = (N_56 * 1000) / A3_m2;

    const deltaL_12_coeff = (N_12 * 1000 * L1_m) / (E_Pa * A1_m2);
    const deltaL_34_coeff = (N_34 * 1000 * L2_m) / (E_Pa * A2_m2);
    const deltaL_56_coeff = (N_56 * 1000 * L3_m) / (E_Pa * A3_m2);

    const w_56_coeff = Math.abs(deltaL_56_coeff);
    const w_34_coeff = Math.abs(deltaL_34_coeff + deltaL_56_coeff);
    const w_12_coeff = Math.abs(
      deltaL_12_coeff + deltaL_34_coeff + deltaL_56_coeff,
    );

    const max_sigma_coeff = Math.max(
      Math.abs(sigma_12_coeff),
      Math.abs(sigma_34_coeff),
      Math.abs(sigma_56_coeff),
    );
    const F_strength_kN = sigma_allow_Pa / max_sigma_coeff;

    const max_w_coeff = Math.max(w_12_coeff, w_34_coeff, w_56_coeff);
    const F_stiffness_kN = s_allow_m / max_w_coeff;

    const F_allow_kN = Math.min(F_strength_kN, F_stiffness_kN);
    const constraint =
      F_strength_kN < F_stiffness_kN ? "strength" : "stiffness";

    return {
      N_12, N_34, N_56,
      sigma_12_coeff, sigma_34_coeff, sigma_56_coeff,
      deltaL_12_coeff, deltaL_34_coeff, deltaL_56_coeff,
      w_12_coeff, w_34_coeff, w_56_coeff,
      F_strength_kN, F_stiffness_kN, F_allow_kN, constraint,
    };
  }, [L1, L2, L3, A1, A2, A3, c1, c2, c3, sigma_allow, E, s_allow]);

  const totalLength = L1 + L2 + L3;
  const svgH = 480;

  const renderRodDiagram = () => {
    const w1 = Math.sqrt(A1) * 2;
    const w2 = Math.sqrt(A2) * 2;
    const w3 = Math.sqrt(A3) * 2;
    const x = 180;
    const y1 = 14;
    const y2 = y1 + (L1 / totalLength) * svgH;
    const y3 = y2 + (L2 / totalLength) * svgH;
    const y4 = y3 + (L3 / totalLength) * svgH;

    return (
      <svg viewBox="0 0 360 520" className="w-full h-auto">
        <defs>
          <pattern id="hatch" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="4" y2="4" stroke="#6b7280" strokeWidth="0.8" />
          </pattern>
        </defs>

        <rect x={x - w2 / 2} y="0" width={w2} height="12" fill="url(#hatch)" stroke="#6b7280" strokeWidth="1" />

        <rect x={x - w1 / 2} y={y1} width={w1} height={y2 - y1} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
        <text x={x + w1 / 2 + 15} y={y1 + (y2 - y1) / 2 - 2} fontSize="10" fill="#6b7280" fontFamily="system-ui">L₁={L1}mm</text>
        <text x={x + w1 / 2 + 15} y={y1 + (y2 - y1) / 2 + 10} fontSize="10" fill="#6b7280" fontFamily="system-ui">A₁={A1}cm²</text>
        <line x1={x} y1={y1 + (y2 - y1) / 2} x2={c1 > 0 ? x - 60 : x + 60} y2={y1 + (y2 - y1) / 2} stroke={c1 > 0 ? "#22c55e" : "#ef4444"} strokeWidth="2" />
        <text x={c1 > 0 ? x - 75 : x + 65} y={y1 + (y2 - y1) / 2 - 5} fontSize="10" fill="#666" fontFamily="monospace" fontWeight="600">{c1}F</text>

        <rect x={x - w2 / 2} y={y2} width={w2} height={y3 - y2} fill="none" stroke="#f97316" strokeWidth="2.5" />
        <text x={x + w2 / 2 + 15} y={y2 + (y3 - y2) / 2 - 2} fontSize="10" fill="#6b7280" fontFamily="system-ui">L₂={L2}mm</text>
        <text x={x + w2 / 2 + 15} y={y2 + (y3 - y2) / 2 + 10} fontSize="10" fill="#6b7280" fontFamily="system-ui">A₂={A2}cm²</text>
        <line x1={x} y1={y2 + (y3 - y2) / 2} x2={c2 > 0 ? x + 60 : x - 60} y2={y2 + (y3 - y2) / 2} stroke={c2 > 0 ? "#22c55e" : "#ef4444"} strokeWidth="2" />
        <text x={c2 > 0 ? x + 65 : x - 75} y={y2 + (y3 - y2) / 2 - 5} fontSize="10" fill="#666" fontFamily="monospace" fontWeight="600">{c2}F</text>

        <rect x={x - w3 / 2} y={y3} width={w3} height={y4 - y3} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
        <text x={x + w3 / 2 + 15} y={y3 + (y4 - y3) / 2 - 2} fontSize="10" fill="#6b7280" fontFamily="system-ui">L₃={L3}mm</text>
        <text x={x + w3 / 2 + 15} y={y3 + (y4 - y3) / 2 + 10} fontSize="10" fill="#6b7280" fontFamily="system-ui">A₃={A3}cm²</text>
        <line x1={x} y1={y3 + (y4 - y3) / 2} x2={c3 > 0 ? x - 60 : x + 60} y2={y3 + (y4 - y3) / 2} stroke={c3 > 0 ? "#22c55e" : "#ef4444"} strokeWidth="2" />
        <text x={c3 > 0 ? x - 75 : x + 65} y={y3 + (y4 - y3) / 2 - 5} fontSize="10" fill="#666" fontFamily="monospace" fontWeight="600">{c3}F</text>
      </svg>
    );
  };

  const renderNDiagram = () => {
    const maxN = Math.max(Math.abs(calculations.N_12), Math.abs(calculations.N_34), Math.abs(calculations.N_56));
    const scale = 60 / maxN;
    const x0 = 80;
    const y1 = 14;
    const y2 = y1 + (L1 / totalLength) * svgH;
    const y3 = y2 + (L2 / totalLength) * svgH;
    const y4 = y3 + (L3 / totalLength) * svgH;

    return (
      <svg viewBox="0 0 360 520" className="w-full h-auto">
        <line x1={x0} y1="0" x2={x0} y2="520" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3,3" />
        <rect x={calculations.N_12 > 0 ? x0 : x0 - Math.abs(calculations.N_12) * scale} y={y1} width={Math.abs(calculations.N_12) * scale} height={y2 - y1} fill={calculations.N_12 > 0 ? "#22c55e" : "#ef4444"} opacity="0.75" />
        <text x={calculations.N_12 > 0 ? x0 + Math.abs(calculations.N_12) * scale + 8 : x0 - Math.abs(calculations.N_12) * scale - 8} y={y1 + (y2 - y1) / 2 + 4} fontSize="9" fill="#666" fontFamily="monospace" fontWeight="600" textAnchor={calculations.N_12 > 0 ? "start" : "end"}>{calculations.N_12.toFixed(2)}F</text>
        
        <rect x={calculations.N_34 > 0 ? x0 : x0 - Math.abs(calculations.N_34) * scale} y={y2} width={Math.abs(calculations.N_34) * scale} height={y3 - y2} fill={calculations.N_34 > 0 ? "#22c55e" : "#ef4444"} opacity="0.75" />
        <text x={calculations.N_34 > 0 ? x0 + Math.abs(calculations.N_34) * scale + 8 : x0 - Math.abs(calculations.N_34) * scale - 8} y={y2 + (y3 - y2) / 2 + 4} fontSize="9" fill="#666" fontFamily="monospace" fontWeight="600" textAnchor={calculations.N_34 > 0 ? "start" : "end"}>{calculations.N_34.toFixed(2)}F</text>
        
        <rect x={calculations.N_56 > 0 ? x0 : x0 - Math.abs(calculations.N_56) * scale} y={y3} width={Math.abs(calculations.N_56) * scale} height={y4 - y3} fill={calculations.N_56 > 0 ? "#22c55e" : "#ef4444"} opacity="0.75" />
        <text x={calculations.N_56 > 0 ? x0 + Math.abs(calculations.N_56) * scale + 8 : x0 - Math.abs(calculations.N_56) * scale - 8} y={y3 + (y4 - y3) / 2 + 4} fontSize="9" fill="#666" fontFamily="monospace" fontWeight="600" textAnchor={calculations.N_56 > 0 ? "start" : "end"}>{calculations.N_56.toFixed(2)}F</text>
        
        <text x="8" y="28" fontSize="12" fontWeight="bold" fill="#374151" fontFamily="system-ui">N</text>
      </svg>
    );
  };

  const renderSigmaDiagram = () => {
    const maxSigma = Math.max(Math.abs(calculations.sigma_12_coeff), Math.abs(calculations.sigma_34_coeff), Math.abs(calculations.sigma_56_coeff));
    const scale = 60 / maxSigma;
    const x0 = 80;
    const y1 = 14;
    const y2 = y1 + (L1 / totalLength) * svgH;
    const y3 = y2 + (L2 / totalLength) * svgH;
    const y4 = y3 + (L3 / totalLength) * svgH;

    return (
      <svg viewBox="0 0 360 520" className="w-full h-auto">
        <line x1={x0} y1="0" x2={x0} y2="520" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3,3" />
        <rect x={calculations.sigma_12_coeff > 0 ? x0 : x0 - Math.abs(calculations.sigma_12_coeff) * scale} y={y1} width={Math.abs(calculations.sigma_12_coeff) * scale} height={y2 - y1} fill={calculations.sigma_12_coeff > 0 ? "#3b82f6" : "#f97316"} opacity="0.75" />
        <text x={calculations.sigma_12_coeff > 0 ? x0 + Math.abs(calculations.sigma_12_coeff) * scale + 8 : x0 - Math.abs(calculations.sigma_12_coeff) * scale - 8} y={y1 + (y2 - y1) / 2 + 4} fontSize="8" fill="#666" fontFamily="monospace" fontWeight="600" textAnchor={calculations.sigma_12_coeff > 0 ? "start" : "end"}>{(calculations.sigma_12_coeff * 1e-3).toFixed(3)}×10⁻³F</text>
        
        <rect x={calculations.sigma_34_coeff > 0 ? x0 : x0 - Math.abs(calculations.sigma_34_coeff) * scale} y={y2} width={Math.abs(calculations.sigma_34_coeff) * scale} height={y3 - y2} fill={calculations.sigma_34_coeff > 0 ? "#3b82f6" : "#f97316"} opacity="0.75" />
        <text x={calculations.sigma_34_coeff > 0 ? x0 + Math.abs(calculations.sigma_34_coeff) * scale + 8 : x0 - Math.abs(calculations.sigma_34_coeff) * scale - 8} y={y2 + (y3 - y2) / 2 + 4} fontSize="8" fill="#666" fontFamily="monospace" fontWeight="600" textAnchor={calculations.sigma_34_coeff > 0 ? "start" : "end"}>{(calculations.sigma_34_coeff * 1e-3).toFixed(3)}×10⁻³F</text>
        
        <rect x={calculations.sigma_56_coeff > 0 ? x0 : x0 - Math.abs(calculations.sigma_56_coeff) * scale} y={y3} width={Math.abs(calculations.sigma_56_coeff) * scale} height={y4 - y3} fill={calculations.sigma_56_coeff > 0 ? "#3b82f6" : "#f97316"} opacity="0.75" />
        <text x={calculations.sigma_56_coeff > 0 ? x0 + Math.abs(calculations.sigma_56_coeff) * scale + 8 : x0 - Math.abs(calculations.sigma_56_coeff) * scale - 8} y={y3 + (y4 - y3) / 2 + 4} fontSize="8" fill="#666" fontFamily="monospace" fontWeight="600" textAnchor={calculations.sigma_56_coeff > 0 ? "start" : "end"}>{(calculations.sigma_56_coeff * 1e-3).toFixed(3)}×10⁻³F</text>
        
        <text x="8" y="28" fontSize="12" fontWeight="bold" fill="#374151" fontFamily="system-ui">σ</text>
      </svg>
    );
  };

  const renderWDiagram = () => {
    const maxW = Math.max(calculations.w_12_coeff, calculations.w_34_coeff, calculations.w_56_coeff);
    const scale = 80 / (maxW || 1);
    const y1 = 14;
    const y2 = y1 + (L1 / totalLength) * svgH;
    const y3 = y2 + (L2 / totalLength) * svgH;
    const y4 = y3 + (L3 / totalLength) * svgH;

    const w_bottom_seg1 = calculations.w_56_coeff * scale;
    const w_bottom_seg2 = calculations.w_34_coeff * scale;
    const w_bottom_seg3 = calculations.w_12_coeff * scale;
    const x0 = 50;

    return (
      <svg viewBox="0 0 360 520" className="w-full h-auto">
        <line x1={x0} y1="0" x2={x0} y2={520} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
        <polygon points={`${x0},${y1} ${x0 + w_bottom_seg1},${y1} ${x0 + w_bottom_seg1},${y2} ${x0},${y2}`} fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="2" />
        <polygon points={`${x0 + w_bottom_seg1},${y2} ${x0 + w_bottom_seg2},${y2} ${x0 + w_bottom_seg2},${y3} ${x0 + w_bottom_seg1},${y3}`} fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="2" />
        <polygon points={`${x0 + w_bottom_seg2},${y3} ${x0 + w_bottom_seg3},${y3} ${x0 + w_bottom_seg3},${y4} ${x0 + w_bottom_seg2},${y4}`} fill="#3b82f6" opacity="0.12" stroke="#3b82f6" strokeWidth="2" />
        
        <text x={x0 + w_bottom_seg1 / 2 + 8} y={y1 + (y2 - y1) / 2} fontSize="9" fill="#666" fontFamily="monospace" fontWeight="600">{(calculations.w_56_coeff * 1e6).toFixed(1)}µm/kN</text>
        <text x={x0 + (w_bottom_seg1 + w_bottom_seg2) / 2 + 8} y={y2 + (y3 - y2) / 2} fontSize="9" fill="#666" fontFamily="monospace" fontWeight="600">{(calculations.w_34_coeff * 1e6).toFixed(1)}µm/kN</text>
        <text x={x0 + (w_bottom_seg2 + w_bottom_seg3) / 2 + 8} y={y3 + (y4 - y3) / 2} fontSize="9" fill="#666" fontFamily="monospace" fontWeight="600">{(calculations.w_12_coeff * 1e6).toFixed(1)}µm/kN</text>
        
        <text x="8" y="28" fontSize="12" fontWeight="bold" fill="#374151" fontFamily="system-ui">w [µm/kN]</text>
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-10">
          <h2 className="text-xs font-semibold text-slate-900 mb-6 uppercase tracking-widest">Parameters</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-3 uppercase tracking-wide">Geometry</label>
              <div className="space-y-2">
                <div><span className="text-xs text-slate-600">L₁ (mm)</span><input type="number" value={L1} onChange={(e) => setL1(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">L₂ (mm)</span><input type="number" value={L2} onChange={(e) => setL2(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">L₃ (mm)</span><input type="number" value={L3} onChange={(e) => setL3(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-medium text-slate-700 mb-3 uppercase tracking-wide">Cross-Sections</label>
              <div className="space-y-2">
                <div><span className="text-xs text-slate-600">A₁ (cm²)</span><input type="number" value={A1} onChange={(e) => setA1(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">A₂ (cm²)</span><input type="number" value={A2} onChange={(e) => setA2(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">A₃ (cm²)</span><input type="number" value={A3} onChange={(e) => setA3(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-medium text-slate-700 mb-3 uppercase tracking-wide">Load Multipliers</label>
              <div className="space-y-2">
                <div><span className="text-xs text-slate-600">c₁</span><input type="number" value={c1} onChange={(e) => setC1(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">c₂</span><input type="number" value={c2} onChange={(e) => setC2(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">c₃</span><input type="number" value={c3} onChange={(e) => setC3(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-medium text-slate-700 mb-3 uppercase tracking-wide">Material & Limits</label>
              <div className="space-y-2">
                <div><span className="text-xs text-slate-600">σ_allow (MPa)</span><input type="number" value={sigma_allow} onChange={(e) => setSigmaAllow(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">E (GPa)</span><input type="number" value={E} onChange={(e) => setE(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><span className="text-xs text-slate-600">s_allow (mm)</span><input type="number" value={s_allow} onChange={(e) => setSAllow(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-9 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-7">
          <h2 className="text-xs font-semibold text-slate-900 mb-6 uppercase tracking-widest">Diagrams</h2>
          <div className="grid grid-cols-2 gap-8">
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Geometry & Loading</h3>
              {renderRodDiagram()}
            </div>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Axial Force (N)</h3>
              {renderNDiagram()}
            </div>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Normal Stress (σ)</h3>
              {renderSigmaDiagram()}
            </div>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Deflection (w)</h3>
              {renderWDiagram()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-7">
          <h2 className="text-xs font-semibold text-slate-900 mb-5 uppercase">Segment Analysis</h2>
          <div className="overflow-hidden border border-slate-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Segment</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">N (×F)</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">σ (×F MPa)</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Δl (µm/kN)</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">w (µm/kN)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-900">1–2 (L₁, A₁)</td>
                  <td className="text-right py-3 px-4 font-mono" style={{color: calculations.N_12 > 0 ? "#2563eb" : "#dc2626"}}>{calculations.N_12.toFixed(3)}F</td>
                  <td className="text-right py-3 px-4 font-mono" style={{color: calculations.sigma_12_coeff > 0 ? "#2563eb" : "#dc2626"}}>{(calculations.sigma_12_coeff * 1e-3).toFixed(4)}×10⁻³F</td>
                  <td className="text-right py-3 px-4 font-mono text-slate-600">{(calculations.deltaL_12_coeff * 1e6).toFixed(1)}</td>
                  <td className="text-right py-3 px-4 font-mono text-slate-600">{(calculations.w_56_coeff * 1e6).toFixed(1)}</td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-900">3–4 (L₂, A₂)</td>
                  <td className="text-right py-3 px-4 font-mono" style={{color: calculations.N_34 > 0 ? "#2563eb" : "#dc2626"}}>{calculations.N_34.toFixed(3)}F</td>
                  <td className="text-right py-3 px-4 font-mono" style={{color: calculations.sigma_34_coeff > 0 ? "#2563eb" : "#dc2626"}}>{(calculations.sigma_34_coeff * 1e-3).toFixed(4)}×10⁻³F</td>
                  <td className="text-right py-3 px-4 font-mono text-slate-600">{(calculations.deltaL_34_coeff * 1e6).toFixed(1)}</td>
                  <td className="text-right py-3 px-4 font-mono text-slate-600">{(calculations.w_34_coeff * 1e6).toFixed(1)}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-900">5–6 (L₃, A₃)</td>
                  <td className="text-right py-3 px-4 font-mono" style={{color: calculations.N_56 > 0 ? "#2563eb" : "#dc2626"}}>{calculations.N_56.toFixed(3)}F</td>
                  <td className="text-right py-3 px-4 font-mono" style={{color: calculations.sigma_56_coeff > 0 ? "#2563eb" : "#dc2626"}}>{(calculations.sigma_56_coeff * 1e-3).toFixed(4)}×10⁻³F</td>
                  <td className="text-right py-3 px-4 font-mono text-slate-600">{(calculations.deltaL_56_coeff * 1e6).toFixed(1)}</td>
                  <td className="text-right py-3 px-4 font-mono text-slate-600">{(calculations.w_12_coeff * 1e6).toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-900 p-6">
            <div className="text-xs font-medium text-slate-900 mb-3 uppercase">Strength Constraint</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl text-purple-500 font-bold">{calculations.F_strength_kN.toFixed(2)}</div>
              <div className="text-sm text-slate-900">kN</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-900 p-6">
            <div className="text-xs font-medium text-slate-900 mb-3 uppercase">Stiffness Constraint</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl text-amber-500 font-bold">{calculations.F_stiffness_kN.toFixed(2)}</div>
              <div className="text-sm text-slate-900">kN</div>
            </div>
          </div>
          <div className={`rounded-lg shadow-sm border-2 p-6 ${calculations.constraint === "strength" ? "bg-blue-50 border-blue-300" : "bg-amber-50 border-amber-300"}`}>
            <div className="text-xs font-medium mb-3 uppercase" style={{color: calculations.constraint === "strength" ? "#1e40af" : "#b45309"}}>
              Allowable Load ({calculations.constraint === "strength" ? "Strength" : "Stiffness"})
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold" style={{color: calculations.constraint === "strength" ? "#1e40af" : "#b45309"}}>
                {calculations.F_allow_kN.toFixed(2)}
              </div>
              <div style={{color: calculations.constraint === "strength" ? "#1e40af" : "#b45309"}}>kN</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function linearInterp(x: number, xs: number[], ys: number[]): number {
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 0; i < xs.length - 1; i++) {
    if (x >= xs[i] && x <= xs[i + 1]) {
      const t = (x - xs[i]) / (xs[i + 1] - xs[i]);
      return ys[i] * (1 - t) + ys[i + 1] * t;
    }
  }
  return ys[ys.length - 1];
}

function TorsionTab() {
  const [numSegments, setNumSegments] = useState(3);
  const [G, setG] = useState(80);

  const segmentDefaults = [
    { L: 300, torque: 10, type: "solid", param1: 50, param2: 0 },
    { L: 250, torque: -5, type: "solid", param1: 40, param2: 0 },
    { L: 200, torque: 3, type: "solid", param1: 35, param2: 0 },
    { L: 150, torque: 0, type: "solid", param1: 30, param2: 0 },
    { L: 100, torque: 0, type: "solid", param1: 25, param2: 0 },
    { L: 50, torque: 0, type: "solid", param1: 20, param2: 0 },
  ];

  const [segments, setSegments] = useState(segmentDefaults.slice(0, numSegments));

  const interpolateTable = (m: number) => {
    const m_table = [1.0, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0, 6.0, 8.0, 10.0];
    const alpha = [0.140, 0.294, 0.37, 0.45, 0.62, 0.79, 1.123, 1.789, 2.456, 3.123];
    const beta = [0.208, 0.346, 0.41, 0.49, 0.64, 0.801, 1.128, 1.789, 2.456, 3.123];
    return {
      alpha: linearInterp(m, m_table, alpha),
      beta: linearInterp(m, m_table, beta),
    };
  };

  const calculations = useMemo(() => {
    const results = [];
    let cumulativeTorque = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      cumulativeTorque += seg.torque;
      const T = cumulativeTorque;

      let It = 0, Wp = 0;

      if (seg.type === "solid") {
        const d_mm = seg.param1;
        const d_m = d_mm * 1e-3;
        It = (Math.PI * Math.pow(d_m, 4)) / 32;
        Wp = (Math.PI * Math.pow(d_m, 3)) / 16;
      } else if (seg.type === "hollow") {
        const di_m = seg.param1 * 1e-3;
        const de_m = seg.param2 * 1e-3;
        It = (Math.PI * (Math.pow(de_m, 4) - Math.pow(di_m, 4))) / 32;
        Wp = (Math.PI * (Math.pow(de_m, 4) - Math.pow(di_m, 4))) / (16 * de_m);
      } else if (seg.type === "rectangle") {
        const b = seg.param1;
        const h = seg.param2;
        const m = h / b;
        const coeff = interpolateTable(m);
        It = coeff.alpha * Math.pow(b, 4) * 1e-12;
        Wp = coeff.beta * Math.pow(b, 3) * 1e-9;
      }

      const tau_max = Wp > 0 ? Math.abs(T) / Wp : 0;
      const L_m = seg.L * 1e-3;
      const G_Pa = G * 1e9;
      const phi = It > 0 ? (T * L_m) / (G_Pa * It) : 0;

      results.push({ T, It, Wp, tau_max, phi });
    }

    const cumulativePhi = [0];
    for (let i = 0; i < results.length - 1; i++) {
      cumulativePhi.push(cumulativePhi[i] + results[i].phi);
    }
    cumulativePhi.push(cumulativePhi[cumulativePhi.length - 1] + results[results.length - 1].phi);

    return { segments: results, cumulativePhi };
  }, [segments, G, numSegments]);

  const updateSegment = (idx: number, field: string, value: any) => {
    const newSegs = [...segments];
    newSegs[idx] = { ...newSegs[idx], [field]: value };
    setSegments(newSegs);
  };

  const handleNumSegmentsChange = (n: number) => {
    setNumSegments(n);
    if (n > segments.length) {
      setSegments([...segments, ...segmentDefaults.slice(segments.length, n)]);
    } else {
      setSegments(segments.slice(0, n));
    }
  };

  const renderTorqueDiagram = () => {
    const maxT = Math.max(...calculations.segments.map((s) => Math.abs(s.T) || 1));
    const scale = 80 / maxT;
    const x0 = 100;
    const y_start = 20;
    const segment_h = 60;

    return (
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        <line x1={x0} y1="0" x2={x0} y2="400" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3,3" />

        {calculations.segments.map((seg, idx) => {
          const isPos = seg.T >= 0;
          const width = Math.abs(seg.T) * scale;
          const x_start = x0 + (isPos ? 0 : -width);
          const y_pos = y_start + idx * segment_h;

          return (
            <g key={idx}>
              <rect x={x_start} y={y_pos} width={width} height={segment_h - 10} fill={isPos ? "#22c55e" : "#ef4444"} opacity="0.7" />
              <text x={isPos ? x0 + width + 5 : x0 - width - 5} y={y_pos + 30} fontSize="10" fill="#333" fontWeight="600" textAnchor={isPos ? "start" : "end"}>
                {seg.T.toFixed(1)} N·m
              </text>
            </g>
          );
        })}

        <text x="10" y="25" fontSize="12" fontWeight="bold" fill="#374151">T (N·m)</text>
      </svg>
    );
  };

  const renderStressDiagram = () => {
    const maxTau = Math.max(...calculations.segments.map((s) => s.tau_max || 1));
    const scale = 80 / maxTau;
    const x0 = 100;
    const y_start = 20;
    const segment_h = 60;

    return (
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        <line x1={x0} y1="0" x2={x0} y2="400" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3,3" />

        {calculations.segments.map((seg, idx) => {
          const width = seg.tau_max * scale;
          const y_pos = y_start + idx * segment_h;

          return (
            <g key={idx}>
              <rect x={x0} y={y_pos} width={width} height={segment_h - 10} fill="#3b82f6" opacity="0.7" />
              <text x={x0 + width + 5} y={y_pos + 30} fontSize="10" fill="#333" fontWeight="600">
                {seg.tau_max.toFixed(1)} MPa
              </text>
            </g>
          );
        })}

        <text x="10" y="25" fontSize="12" fontWeight="bold" fill="#374151">τ_max (MPa)</text>
      </svg>
    );
  };

  const renderAngleDiagram = () => {
    const allPhi = calculations.cumulativePhi.filter((p) => p !== undefined);
    const maxPhi = Math.max(...allPhi.map(Math.abs)) || 1;
    const scale = 80 / maxPhi;
    const x0 = 100;
    const y_start = 20;
    const segment_h = 60;

    return (
      <svg viewBox="0 0 400 450" className="w-full h-auto">
        <line x1={x0} y1="0" x2={x0} y2="430" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="3,3" />

        {allPhi.map((phi, idx) => {
          const width = phi * scale;
          const y_pos = y_start + idx * segment_h;

          return (
            <g key={idx}>
              <rect x={x0} y={y_pos} width={Math.max(width, 0)} height={segment_h - 10} fill="#9333ea" opacity="0.7" />
              <text x={x0 + Math.max(width, 0) + 5} y={y_pos + 30} fontSize="10" fill="#333" fontWeight="600">
                {(phi * 1000).toFixed(1)} mrad
              </text>
            </g>
          );
        })}

        <text x="10" y="25" fontSize="12" fontWeight="bold" fill="#374151">φ (mrad)</text>
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-10">
          <h2 className="text-xs font-semibold text-slate-900 mb-6 uppercase tracking-widest">Torsion Parameters</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Number of Segments</label>
              <select
                value={numSegments}
                onChange={(e) => handleNumSegmentsChange(+e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Shear Modulus G (GPa)</label>
              <input type="number" value={G} onChange={(e) => setG(+e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900" />
            </div>

            <div className="border-t border-slate-200 pt-4">
              <div className="text-xs font-semibold text-slate-700 mb-3 uppercase">Segments</div>
              <div className="max-h-96 overflow-y-auto space-y-4">
                {segments.map((seg, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Segment {idx + 1}</div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-xs text-slate-600">L (mm)</span>
                        <input
                          type="number"
                          value={seg.L}
                          onChange={(e) => updateSegment(idx, "L", +e.target.value)}
                          className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <span className="text-xs text-slate-600">Torque (N·m)</span>
                        <input
                          type="number"
                          value={seg.torque}
                          onChange={(e) => updateSegment(idx, "torque", +e.target.value)}
                          className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900"
                        />
                      </div>

                      <div>
                        <span className="text-xs text-slate-600">Cross-Section</span>
                        <select
                          value={seg.type}
                          onChange={(e) => updateSegment(idx, "type", e.target.value)}
                          className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs text-slate-900"
                        >
                          <option value="solid">Solid Cylinder</option>
                          <option value="hollow">Hollow Tube</option>
                          <option value="rectangle">Rectangle</option>
                        </select>
                      </div>

                      {seg.type === "solid" && (
                        <div>
                          <span className="text-xs text-slate-600">Diameter d (mm)</span>
                          <input
                            type="number"
                            value={seg.param1}
                            onChange={(e) => updateSegment(idx, "param1", +e.target.value)}
                            className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900"
                          />
                        </div>
                      )}

                      {seg.type === "hollow" && (
                        <>
                          <div>
                            <span className="text-xs text-slate-600">Inner d (mm)</span>
                            <input type="number" value={seg.param1} onChange={(e) => updateSegment(idx, "param1", +e.target.value)} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                          </div>
                          <div>
                            <span className="text-xs text-slate-600">Outer d (mm)</span>
                            <input type="number" value={seg.param2} onChange={(e) => updateSegment(idx, "param2", +e.target.value)} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                          </div>
                        </>
                      )}

                      {seg.type === "rectangle" && (
                        <>
                          <div>
                            <span className="text-xs text-slate-600">Width b (mm)</span>
                            <input type="number" value={seg.param1} onChange={(e) => updateSegment(idx, "param1", +e.target.value)} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                          </div>
                          <div>
                            <span className="text-xs text-slate-600">Height h (mm)</span>
                            <input type="number" value={seg.param2} onChange={(e) => updateSegment(idx, "param2", +e.target.value)} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-9 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-7">
          <h2 className="text-xs font-semibold text-slate-900 mb-6 uppercase">Diagrams</h2>
          <div className="grid grid-cols-1 gap-8">
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Torque</h3>
              {renderTorqueDiagram()}
            </div>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Shear Stress</h3>
              {renderStressDiagram()}
            </div>
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Angle of Twist</h3>
              {renderAngleDiagram()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-7">
          <h2 className="text-xs font-semibold text-slate-900 mb-5 uppercase">Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-300">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Segment</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">T (N·m)</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">τ_max (MPa)</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">φ (mrad)</th>
                </tr>
              </thead>
              <tbody>
                {calculations.segments.map((seg, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono text-slate-900">{idx + 1}</td>
                    <td className="text-right py-3 px-4 font-mono" style={{color: seg.T > 0 ? "#22c55e" : seg.T < 0 ? "#ef4444" : "#1e293b"}}>
                      {seg.T.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-slate-600">{seg.tau_max.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-mono text-slate-600">{(seg.phi * 1000).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function BeamTab() {
  const [span, setSpan] = useState(5000);
  const [E, setE] = useState(205);
  const [sigma_allow, setSigmaAllow] = useState(160);
  const [sectionType, setSectionType] = useState<"S-shape" | "rectangular">("S-shape");
  const [Iy, setIy] = useState(350);
  const [Wy, setWy] = useState(100);
  const [b, setB] = useState(200);
  const [h, setH] = useState(400);

  const [pointForce, setPointForce] = useState({ F: 10, a: 2500 });
  const [pointMoment, setPointMoment] = useState({ M: 0, b: 2500 });
  const [distLoad, setDistLoad] = useState({ q: 0, x1: 0, x2: span });

  const [sectionK, setSectionK] = useState({ x: 2500, yoffset: 200 });

  const calculations = useMemo(() => {
    const L_m = span * 1e-3;
    const a_m = pointForce.a * 1e-3;
    const E_Pa = E * 1e9;
    const Iy_m4 = Iy * 1e-8;
    const Wy_m3 = Wy * 1e-6;
    const sigma_allow_Pa = sigma_allow * 1e6;

    const F_kN = pointForce.F;
    const M_kN_m = pointMoment.M;
    const q_kN_m = distLoad.q / 1000;

    const q_moment = q_kN_m > 0 ? q_kN_m * (distLoad.x2 * 1e-3 - distLoad.x1 * 1e-3) * (L_m / 2 - ((distLoad.x1 + distLoad.x2) * 1e-3) / 2) : 0;

    const R_b = (F_kN * a_m + M_kN_m + q_moment) / L_m;
    const R_a = F_kN - R_b;

    let Mmax = Math.abs(R_a * L_m / 2);
    if (pointForce.F > 0) {
      Mmax = Math.max(Mmax, Math.abs(R_a * a_m - F_kN * 0));
    }

    const Wy_required = Mmax / sigma_allow_Pa;

    const x_K_m = sectionK.x * 1e-3;
    let M_K = 0;
    if (x_K_m < a_m) {
      M_K = R_a * x_K_m;
    } else {
      M_K = R_a * x_K_m - F_kN * (x_K_m - a_m);
    }
    M_K += M_kN_m;

    const y_K_m = sectionK.yoffset * 1e-3;
    const sigma_normal = (M_K * y_K_m) / Iy_m4;

    let V_K = R_a;
    if (x_K_m > a_m) {
      V_K -= F_kN;
    }
    V_K = V_K * 1000;

    const h_m = (h || 400) * 1e-3;
    const b_m = b * 1e-3;
    const S_rect = b_m * (h_m / 2 - y_K_m) * (h_m / 2 + y_K_m) / 2;
    const tau = (V_K * S_rect) / (Iy_m4 * b_m);

    const sigma_avg = sigma_normal / 2;
    const principal1 = sigma_avg + Math.sqrt(sigma_avg * sigma_avg + tau * tau);
    const principal3 = sigma_avg - Math.sqrt(sigma_avg * sigma_avg + tau * tau);
    const angle_rad = Math.atan2(2 * tau, sigma_normal) / 2;
    const angle_deg = (angle_rad * 180) / Math.PI;

    const EI = E_Pa * Iy_m4;
    const u_c = (R_a * L_m * L_m * L_m) / (24 * EI) - (F_kN * a_m * a_m * (L_m - a_m) * (2 * L_m - a_m)) / (6 * EI);
    const theta_a = (R_a * L_m * L_m) / (6 * EI) - (F_kN * a_m * a_m * (L_m - a_m)) / (3 * EI);

    return {
      Ra: R_a,
      Rb: R_b,
      Mmax: Mmax,
      Wy_required: Wy_required,
      sigma_normal: sigma_normal,
      tau: tau,
      principal1: principal1,
      principal3: principal3,
      angle_deg: angle_deg,
      u_c: u_c,
      theta_a: theta_a,
    };
  }, [span, E, sigma_allow, sectionType, Iy, Wy, pointForce, pointMoment, distLoad, sectionK, b, h]);

  const renderMohrsCircle = () => {
    const sx = calculations.sigma_normal / 1e6;
    const tau = calculations.tau / 1e6;
    const sigma_avg = sx / 2;
    const R = Math.sqrt(sigma_avg * sigma_avg + tau * tau);

    const svgSize = 300;
    const center = svgSize / 2;
    const scale = 50;

    return (
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full h-auto">
        <line x1="20" y1={center} x2={svgSize - 20} y2={center} stroke="#d1d5db" strokeWidth="1" />
        <line x1={center} y1="20" x2={center} y2={svgSize - 20} stroke="#d1d5db" strokeWidth="1" />

        <circle cx={center + sigma_avg * scale} cy={center} r={R * scale} fill="none" stroke="#3b82f6" strokeWidth="2" />

        <circle cx={center + sx * scale} cy={center + tau * scale} r="4" fill="#dc2626" />
        <circle cx={center + sx * scale} cy={center - tau * scale} r="4" fill="#22c55e" />

        <circle cx={center + calculations.principal1 / 1e6 * scale} cy={center} r="3" fill="#9333ea" />
        <circle cx={center + calculations.principal3 / 1e6 * scale} cy={center} r="3" fill="#f59e0b" />

        <text x={center + sx * scale + 10} y={center + tau * scale - 5} fontSize="10" fill="#333">σ</text>
        <text x={center - 30} y="25" fontSize="10" fill="#666">τ (MPa)</text>
        <text x={svgSize - 30} y={center + 15} fontSize="10" fill="#666">σ (MPa)</text>
      </svg>
    );
  };

  const renderMdiagram = () => {
    const scale_x = 360 / span;
    const max_M = Math.max(calculations.Mmax || 1, 0.1);
    const scale_M = 200 / max_M;

    const points = [];
    points.push({ x: 0, M: 0 });
    const x1 = pointForce.a;
    const M1 = calculations.Ra * x1 / 1000;
    points.push({ x: x1, M: M1 });
    points.push({ x: span, M: 0 });

    const x_origin = 30;
    const y_origin = 250;

    return (
      <svg viewBox="0 0 400 350" className="w-full h-auto">
        <line x1={x_origin} y1={y_origin} x2="390" y2={y_origin} stroke="#374151" strokeWidth="2" />
        <line x1={x_origin} y1="30" x2={x_origin} y2={y_origin} stroke="#374151" strokeWidth="2" />

        <polyline
          points={points.map((p) => `${x_origin + p.x * scale_x},${y_origin - p.M * scale_M}`).join(" ")}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
        />

        <text x="10" y="25" fontSize="11" fontWeight="bold" fill="#374151">
          M (kN·m)
        </text>
        <text x="370" y={y_origin + 20} fontSize="11" fontWeight="bold" fill="#374151">
          x (mm)
        </text>
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-10">
          <h2 className="text-xs font-semibold text-slate-900 mb-6 uppercase">Beam Parameters</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Span L (mm)</label>
              <input type="number" value={span} onChange={(e) => setSpan(+e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">E (GPa)</label>
              <input type="number" value={E} onChange={(e) => setE(+e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">σ_allow (MPa)</label>
              <input type="number" value={sigma_allow} onChange={(e) => setSigmaAllow(+e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono text-slate-900" />
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-medium text-slate-700 mb-2">Cross-Section</label>
              <select value={sectionType} onChange={(e) => setSectionType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900">
                <option value="S-shape">S-Shape</option>
                <option value="rectangular">Rectangular</option>
              </select>

              {sectionType === "S-shape" && (
                <>
                  <div className="mt-2">
                    <span className="text-xs text-slate-600">Iy (cm⁴)</span>
                    <input type="number" value={Iy} onChange={(e) => setIy(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-slate-600">Wy (cm³)</span>
                    <input type="number" value={Wy} onChange={(e) => setWy(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                  </div>
                </>
              )}

              {sectionType === "rectangular" && (
                <>
                  <div className="mt-2">
                    <span className="text-xs text-slate-600">Width b (mm)</span>
                    <input type="number" value={b} onChange={(e) => setB(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-slate-600">Height h (mm)</span>
                    <input type="number" value={h} onChange={(e) => setH(+e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-3 uppercase">Loads</label>

              <div className="bg-slate-50 p-3 rounded mb-3 text-xs space-y-2">
                <div className="font-medium">Point Force</div>
                <div>
                  <span className="text-xs text-slate-600">F (kN)</span>
                  <input type="number" value={pointForce.F} onChange={(e) => setPointForce({ ...pointForce, F: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
                <div>
                  <span className="text-xs text-slate-600">Position a (mm)</span>
                  <input type="number" value={pointForce.a} onChange={(e) => setPointForce({ ...pointForce, a: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded mb-3 text-xs space-y-2">
                <div className="font-medium">Applied Moment</div>
                <div>
                  <span className="text-xs text-slate-600">M (kN·m)</span>
                  <input type="number" value={pointMoment.M} onChange={(e) => setPointMoment({ ...pointMoment, M: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
                <div>
                  <span className="text-xs text-slate-600">Position (mm)</span>
                  <input type="number" value={pointMoment.b} onChange={(e) => setPointMoment({ ...pointMoment, b: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded text-xs space-y-2">
                <div className="font-medium">Distributed Load</div>
                <div>
                  <span className="text-xs text-slate-600">q (kN/m)</span>
                  <input type="number" value={distLoad.q} onChange={(e) => setDistLoad({ ...distLoad, q: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
                <div>
                  <span className="text-xs text-slate-600">From x₁ (mm)</span>
                  <input type="number" value={distLoad.x1} onChange={(e) => setDistLoad({ ...distLoad, x1: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
                <div>
                  <span className="text-xs text-slate-600">To x₂ (mm)</span>
                  <input type="number" value={distLoad.x2} onChange={(e) => setDistLoad({ ...distLoad, x2: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-3 uppercase">Analysis Point K</label>
              <div className="bg-slate-50 p-3 rounded text-xs space-y-2">
                <div>
                  <span className="text-xs text-slate-600">x (mm)</span>
                  <input type="number" value={sectionK.x} onChange={(e) => setSectionK({ ...sectionK, x: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
                <div>
                  <span className="text-xs text-slate-600">y from neutral axis (mm)</span>
                  <input type="number" value={sectionK.yoffset} onChange={(e) => setSectionK({ ...sectionK, yoffset: +e.target.value })} className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs font-mono text-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-9 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-7">
          <h2 className="text-xs font-semibold text-slate-900 mb-6 uppercase">Analysis</h2>

          <div className="grid grid-cols-2 gap-8">
            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">M(x) Diagram</h3>
              {renderMdiagram()}
            </div>

            <div className="border border-slate-200 rounded-lg bg-slate-50 p-5">
              <h3 className="text-xs font-medium text-slate-700 mb-4 uppercase">Mohr's Circle at K</h3>
              {renderMohrsCircle()}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-7">
          <h2 className="text-xs font-semibold text-slate-900 mb-5 uppercase">Results</h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                <div className="text-xs font-semibold text-blue-900 mb-1">Support Reactions</div>
                <div className="text-sm font-mono text-slate-700">
                  R<sub>A</sub> = {calculations.Ra.toFixed(2)} kN
                </div>
                <div className="text-sm font-mono text-slate-700">
                  R<sub>B</sub> = {calculations.Rb.toFixed(2)} kN
                </div>
              </div>

              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                <div className="text-xs font-semibold text-green-900 mb-1">Moment Analysis</div>
                <div className="text-sm font-mono text-slate-700">
                  M<sub>max</sub> = {calculations.Mmax.toFixed(2)} kN·m
                </div>
                <div className="text-sm font-mono text-slate-700">
                  W<sub>y</sub> required = {(calculations.Wy_required * 1e6).toFixed(0)} cm³
                </div>
              </div>

              <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                <div className="text-xs font-semibold text-purple-900 mb-1">Deflection (Moment-Area)</div>
                <div className="text-sm font-mono text-slate-700">
                  θ<sub>A</sub> = {(calculations.theta_a * 1000).toFixed(2)} mrad
                </div>
                <div className="text-sm font-mono text-slate-700">
                  u<sub>c</sub> = {(calculations.u_c * 1000).toFixed(2)} mm
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                <div className="text-xs font-semibold text-orange-900 mb-1">Stresses at Point K</div>
                <div className="text-sm font-mono text-slate-700">
                  σ = {(calculations.sigma_normal / 1e6).toFixed(2)} MPa
                </div>
                <div className="text-sm font-mono text-slate-700">
                  τ = {(calculations.tau / 1e6).toFixed(2)} MPa
                </div>
              </div>

              <div className="border-l-4 border-pink-500 bg-pink-50 p-4 rounded">
                <div className="text-xs font-semibold text-pink-900 mb-1">Principal Stresses</div>
                <div className="text-sm font-mono text-slate-700">
                  σ<sub>1</sub> = {(calculations.principal1 / 1e6).toFixed(2)} MPa
                </div>
                <div className="text-sm font-mono text-slate-700">
                  σ<sub>3</sub> = {(calculations.principal3 / 1e6).toFixed(2)} MPa
                </div>
                <div className="text-sm font-mono text-slate-700">
                  θ = {calculations.angle_deg.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
