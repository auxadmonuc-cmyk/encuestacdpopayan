import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LabelList
} from 'recharts';
import { PieChart as PieIcon, BarChart2, Users, MapPin, Award, CheckCircle2, Calendar } from 'lucide-react';
import { ParticipantResponse, QuestionAnalysis } from '../types/survey';

interface OverviewChartsProps {
  responses: ParticipantResponse[];
  questionAnalysis: QuestionAnalysis[];
  surveyType?: string;
}

// Color palette aligned with custom 9-color theme
const DONUT_COLORS = [
  '#4CB7A5', // Verde aguamarina / turquesa
  '#2F5D73', // Azul medio corporativo
  '#E3B23C', // Amarillo mostaza
  '#1F2A33', // Azul petróleo oscuro
  '#8FD9C8', // Verde claro / menta
  '#F6E6B4', // Amarillo claro
  '#9FA1A4', // Gris medio
  '#2B2B2B', // Negro suave
];

export const OverviewCharts: React.FC<OverviewChartsProps> = ({ responses, questionAnalysis, surveyType }) => {
  const isEngagement = surveyType === 'engagement';
  const [cargoChartType, setCargoChartType] = useState<'donut' | 'bar'>('donut');
  const [monthChartMetric, setMonthChartMetric] = useState<'both' | 'preguntas' | 'evaluaciones'>('both');
  const [regionalChartType, setRegionalChartType] = useState<'bar' | 'donut'>('bar');

  // --- 1. CARGO CRÍTICO DATA ---
  const cargoData = useMemo(() => {
    const map: Record<string, number> = {};
    responses.forEach(r => {
      const cargoName = (r.cargo && r.cargo.trim()) ? r.cargo.trim() : 'Sin Cargo Especificado';
      map[cargoName] = (map[cargoName] || 0) + 1;
    });

    const total = responses.length;
    return Object.entries(map)
      .map(([name, count], index) => {
        const pctNum = total > 0 ? (count / total) * 100 : 0;
        return {
          name,
          count,
          percentage: pctNum,
          pctFormatted: pctNum.toFixed(2).replace('.', ','),
          color: DONUT_COLORS[index % DONUT_COLORS.length]
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [responses]);

  // --- 2. CANTIDAD DE PREGUNTAS Y EVALUACIONES POR MES ---
  const monthlyData = useMemo(() => {
    const MONTH_ORDER = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      'ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];

    const map: Record<string, { month: string; evaluaciones: number; preguntas: number; aprobados: number; reprobados: number }> = {};

    responses.forEach(r => {
      const rawMonth = (r.month && String(r.month).trim()) ? String(r.month).trim() : 'Sin Mes';
      const key = rawMonth.toLowerCase();

      if (!map[key]) {
        map[key] = {
          month: rawMonth,
          evaluaciones: 0,
          preguntas: 0,
          aprobados: 0,
          reprobados: 0
        };
      }

      map[key].evaluaciones += 1;
      const numQuestions = (r.questions && r.questions.length > 0) ? r.questions.length : 5;
      map[key].preguntas += numQuestions;

      if (r.passed) map[key].aprobados += 1;
      else map[key].reprobados += 1;
    });

    return Object.values(map).sort((a, b) => {
      const idxA = MONTH_ORDER.findIndex(m => a.month.toLowerCase().includes(m));
      const idxB = MONTH_ORDER.findIndex(m => b.month.toLowerCase().includes(m));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return a.month.localeCompare(b.month);
    });
  }, [responses]);

  // --- 3. REGIONAL PASS/FAIL DATA ---
  const regionalData = useMemo(() => {
    const map: Record<string, { passed: number; failed: number; total: number }> = {};
    responses.forEach(r => {
      const reg = (r.regional && r.regional.trim()) ? r.regional.trim() : 'Sin Regional';
      if (!map[reg]) map[reg] = { passed: 0, failed: 0, total: 0 };
      map[reg].total += 1;
      if (r.passed) map[reg].passed += 1;
      else map[reg].failed += 1;
    });

    const total = responses.length;
    return Object.entries(map)
      .map(([name, val], index) => ({
        name,
        count: val.total,
        passed: val.passed,
        failed: val.failed,
        percentage: total > 0 ? (val.total / total) * 100 : 0,
        color: DONUT_COLORS[(index + 6) % DONUT_COLORS.length]
      }))
      .sort((a, b) => b.count - a.count);
  }, [responses]);

  // --- 4. TIPO DE CAPACITACIÓN ---
  const trainingData = useMemo(() => {
    const map: Record<string, number> = {};
    responses.forEach(r => {
      const type = (r.trainingType && r.trainingType.trim()) ? r.trainingType.trim() : 'General';
      map[type] = (map[type] || 0) + 1;
    });

    const total = responses.length;
    return Object.entries(map).map(([name, count], idx) => {
      const pctNum = total > 0 ? (count / total) * 100 : 0;
      return {
        name,
        count,
        percentage: pctNum,
        pctFormatted: pctNum.toFixed(1).replace('.', ','),
        color: idx === 0 ? '#4CB7A5' : idx === 1 ? '#2F5D73' : '#E3B23C'
      };
    });
  }, [responses]);

  const [cityMetric, setCityMetric] = useState<'both' | 'preguntas' | 'evaluaciones'>('both');

  // --- 5. PREGUNTAS Y EVALUACIONES POR CIUDAD / CD ---
  const cityChartData = useMemo(() => {
    const map: Record<string, { city: string; evaluaciones: number; preguntas: number; aprobados: number; reprobados: number }> = {};

    responses.forEach(r => {
      const cityRaw = (r.city && r.city.trim()) ? r.city.trim() : (r.regional || 'Sin Ciudad / CD');
      const key = cityRaw.toLowerCase();

      if (!map[key]) {
        map[key] = {
          city: cityRaw,
          evaluaciones: 0,
          preguntas: 0,
          aprobados: 0,
          reprobados: 0
        };
      }

      map[key].evaluaciones += 1;
      const numQuestions = (r.questions && r.questions.length > 0) ? r.questions.length : 5;
      map[key].preguntas += numQuestions;
      if (r.passed) map[key].aprobados += 1;
      else map[key].reprobados += 1;
    });

    return Object.values(map)
      .map((item, idx) => ({
        ...item,
        name: item.city.length > 25 ? item.city.substring(0, 23) + '...' : item.city,
        fullName: item.city,
        color: DONUT_COLORS[idx % DONUT_COLORS.length]
      }))
      .sort((a, b) => b.preguntas - a.preguntas);
  }, [responses]);

  // Custom Pie Outer Label Renderer for Donut Chart
  const renderCustomPieLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    value
  }: any) => {
    if (percent < 0.025) return null; // Hide if less than 2.5% to avoid overlapping
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const pctStr = `${(percent * 100).toFixed(2).replace('.', ',')}%`;

    return (
      <text
        x={x}
        y={y}
        fill="#334155"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[10px] font-bold fill-slate-700"
      >
        {`${value} (${pctStr})`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Grid of Main Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ---------------- CARD 1: CARGO CRÍTICO ---------------- */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          {/* Header Banner - Dark Petróleo #1F2A33 */}
          <div className="bg-petroleo border-b border-azul-corp px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-turquesa" />
              <span>Cargo Crítico</span>
            </h3>
            
            {/* View Mode Switcher: Dona vs Barras */}
            <div className="flex items-center bg-azul-corp/70 p-0.5 rounded-lg border border-turquesa/30">
              <button
                type="button"
                onClick={() => setCargoChartType('donut')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all flex items-center gap-1 ${
                  cargoChartType === 'donut'
                    ? 'bg-mostaza text-petroleo shadow-xs'
                    : 'text-gris-claro hover:bg-azul-corp/50'
                }`}
              >
                <PieIcon className="w-3 h-3" />
                <span>Dona</span>
              </button>
              <button
                type="button"
                onClick={() => setCargoChartType('bar')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all flex items-center gap-1 ${
                  cargoChartType === 'bar'
                    ? 'bg-mostaza text-petroleo shadow-xs'
                    : 'text-gris-claro hover:bg-azul-corp/50'
                }`}
              >
                <BarChart2 className="w-3 h-3" />
                <span>Barras</span>
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            {cargoData.length > 0 ? (
              cargoChartType === 'donut' ? (
                /* DONUT CHART MODE - Identical layout to provided image */
                <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Left: Interactive Donut Chart */}
                  <div className="w-full md:w-3/5 h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 10, right: 35, left: 35, bottom: 10 }}>
                        <Pie
                          data={cargoData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          label={renderCustomPieLabel}
                          labelLine={true}
                        >
                          {cargoData.map((entry, index) => (
                            <Cell key={`cell-cargo-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1.5} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: number, name: string, item: any) => [
                            `${val} participantes (${item.payload.pctFormatted}%)`,
                            'Cargo'
                          ]}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '8px',
                            border: 'none',
                            color: '#fff',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Right: Legend Column with Cargo Names (like image) */}
                  <div className="w-full md:w-2/5 max-h-64 overflow-y-auto pr-1 space-y-1.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-3">
                    <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider block mb-1">
                      Cargo
                    </span>
                    {cargoData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] leading-snug group">
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate font-medium text-slate-700 group-hover:text-slate-900">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-slate-500 font-bold shrink-0 text-[10px]">
                          {item.count} ({item.pctFormatted}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* BAR CHART MODE FOR CARGO */
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cargoData.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={130}
                        tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                      />
                      <Tooltip
                        formatter={(val: number, name: string, item: any) => [
                          `${val} participantes (${item.payload.pctFormatted}%)`,
                          'Total'
                        ]}
                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="count" position="right" fill="#1e293b" fontSize={11} fontWeight="bold" />
                        {cargoData.slice(0, 10).map((entry, index) => (
                          <Cell key={`cell-bar-cargo-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                Sin datos de cargo disponibles
              </div>
            )}
          </div>
        </div>

        {/* ---------------- CARD 2: CANTIDAD DE PREGUNTAS Y EVALUACIONES POR MES ---------------- */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          {/* Header Banner - Dark Petróleo #1F2A33 */}
          <div className="bg-petroleo border-b border-azul-corp px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-white">
              <Calendar className="w-4 h-4 text-turquesa" />
              <span>{isEngagement ? 'Cantidad de Respuestas y Encuestas por Mes' : 'Cantidad de Preguntas y Evaluaciones por Mes'}</span>
            </h3>

            {/* Metric Filter */}
            <div className="flex items-center bg-azul-corp/70 p-0.5 rounded-lg border border-turquesa/30">
              <button
                type="button"
                onClick={() => setMonthChartMetric('both')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                  monthChartMetric === 'both'
                    ? 'bg-mostaza text-petroleo shadow-xs'
                    : 'text-gris-claro hover:text-white'
                }`}
              >
                Ambos
              </button>
              <button
                type="button"
                onClick={() => setMonthChartMetric('preguntas')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                  monthChartMetric === 'preguntas'
                    ? 'bg-mostaza text-petroleo shadow-xs'
                    : 'text-gris-claro hover:text-white'
                }`}
              >
                {isEngagement ? 'Respuestas' : 'Preguntas'}
              </button>
              <button
                type="button"
                onClick={() => setMonthChartMetric('evaluaciones')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                  monthChartMetric === 'evaluaciones'
                    ? 'bg-mostaza text-petroleo shadow-xs'
                    : 'text-gris-claro hover:text-white'
                }`}
              >
                {isEngagement ? 'Encuestas' : 'Evaluaciones'}
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            {monthlyData.length > 0 ? (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 25, right: 15, left: -15, bottom: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    
                    {(monthChartMetric === 'both' || monthChartMetric === 'preguntas') && (
                      <Bar dataKey="preguntas" name={isEngagement ? "Total Respuestas" : "Total Preguntas"} fill="#E3B23C" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="preguntas" position="top" fill="#1F2A33" fontSize={11} fontWeight="bold" />
                      </Bar>
                    )}

                    {(monthChartMetric === 'both' || monthChartMetric === 'evaluaciones') && (
                      <Bar dataKey="evaluaciones" name={isEngagement ? "Encuestas Realizadas" : "Evaluaciones Realizadas"} fill="#2F5D73" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="evaluaciones" position="top" fill="#1F2A33" fontSize={11} fontWeight="bold" />
                      </Bar>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
                {isEngagement ? 'Sin datos de encuestas de satisfacción' : 'Sin datos mensuales en las encuestas cargadas'}
              </div>
            )}
          </div>
        </div>

        {/* ---------------- CARD 3: APROBADOS VS REPROBADOS POR REGIONAL ---------------- */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          {/* Header Banner - Dark Petróleo #1F2A33 */}
          <div className="bg-petroleo border-b border-azul-corp px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-turquesa" />
              <span>{isEngagement ? 'Satisfechos vs Insatisfechos por Regional' : 'Aprobados vs Reprobados por Regional'}</span>
            </h3>

            <div className="flex items-center bg-azul-corp/70 p-0.5 rounded-lg border border-turquesa/30">
              <button
                type="button"
                onClick={() => setRegionalChartType('bar')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all flex items-center gap-1 ${
                  regionalChartType === 'bar'
                    ? 'bg-mostaza text-petroleo shadow-xs'
                    : 'text-gris-claro hover:bg-azul-corp/50'
                }`}
              >
                <BarChart2 className="w-3 h-3" />
                <span>Barras</span>
              </button>
              <button
                type="button"
                onClick={() => setRegionalChartType('donut')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all flex items-center gap-1 ${
                  regionalChartType === 'donut'
                    ? 'bg-mostaza text-petroleo shadow-xs'
                    : 'text-gris-claro hover:bg-azul-corp/50'
                }`}
              >
                <PieIcon className="w-3 h-3" />
                <span>Dona</span>
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            {regionalData.length > 0 ? (
              regionalChartType === 'bar' ? (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      <Bar dataKey="passed" name={isEngagement ? "Satisfechos (≥7)" : "Aprobados"} fill="#4CB7A5" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="passed" position="top" fill="#1F2A33" fontSize={10} fontWeight="bold" formatter={(val: number) => val > 0 ? val : ''} />
                      </Bar>
                      <Bar dataKey="failed" name={isEngagement ? "Insatisfechos (<7)" : "Reprobados"} fill="#E3B23C" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="failed" position="top" fill="#1F2A33" fontSize={10} fontWeight="bold" formatter={(val: number) => val > 0 ? val : ''} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-full md:w-3/5 h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                        <Pie
                          data={regionalData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          label={renderCustomPieLabel}
                        >
                          {regionalData.map((entry, index) => (
                            <Cell key={`cell-reg-${index}`} fill={entry.color} stroke="#fff" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-2/5 max-h-64 overflow-y-auto space-y-1.5 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-3">
                    <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider block mb-1">
                      Regional
                    </span>
                    {regionalData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="truncate font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="text-slate-500 font-bold shrink-0 text-[10px]">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Sin datos</div>
            )}
          </div>
        </div>

        {/* ---------------- CARD 4: TIPO DE CAPACITACIÓN ---------------- */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
          {/* Header Banner - Dark Petróleo #1F2A33 */}
          <div className="bg-petroleo border-b border-azul-corp px-4 py-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-turquesa" />
              <span>Tipo de Capacitación</span>
            </h3>
            <span className="text-[10px] bg-azul-corp text-menta font-bold px-2 py-0.5 rounded-full border border-turquesa/30">
              Inicial vs Reentrenamiento
            </span>
          </div>

          <div className="p-4 flex-1 flex items-center justify-center">
            {trainingData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center w-full gap-4">
                <div className="w-full md:w-3/5 h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                      <Pie
                        data={trainingData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        label={renderCustomPieLabel}
                      >
                        {trainingData.map((entry, index) => (
                          <Cell key={`cell-train-${index}`} fill={entry.color} stroke="#fff" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-2/5 space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-3">
                  <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider block mb-1">
                    Modalidad
                  </span>
                  {trainingData.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        {item.count} ({item.pctFormatted}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Sin datos</div>
            )}
          </div>
        </div>

      </div>

      {/* ---------------- CARD 5: PREGUNTAS Y EVALUACIONES POR CIUDAD / CD ---------------- */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-petroleo border-b border-azul-corp px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4 text-turquesa" />
              <span>{isEngagement ? 'Respuestas y Encuestas Registradas por Ciudad / CD' : 'Preguntas y Evaluaciones Registradas por Ciudad / CD'}</span>
            </h3>
            <p className="text-[11px] text-gris-medio mt-0.5 font-medium">
              {isEngagement 
                ? 'Cantidad total de respuestas y encuestas de satisfacción desglosadas por ciudad, sede o centro de distribución (CD)'
                : 'Cantidad total de preguntas respondidas y evaluaciones realizadas desglosadas por ciudad, sede o centro de distribución (CD)'
              }
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-azul-corp/70 px-3 py-1.5 rounded-lg border border-turquesa/30 self-start sm:self-auto">
            <span className="text-gris-claro font-bold text-[11px]">Ver:</span>
            <div className="flex items-center bg-petroleo p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setCityMetric('both')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                  cityMetric === 'both' ? 'bg-mostaza text-petroleo' : 'text-gris-claro hover:text-white'
                }`}
              >
                Ambos
              </button>
              <button
                type="button"
                onClick={() => setCityMetric('preguntas')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                  cityMetric === 'preguntas' ? 'bg-mostaza text-petroleo' : 'text-gris-claro hover:text-white'
                }`}
              >
                {isEngagement ? 'Respuestas' : 'Preguntas'}
              </button>
              <button
                type="button"
                onClick={() => setCityMetric('evaluaciones')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                  cityMetric === 'evaluaciones' ? 'bg-mostaza text-petroleo' : 'text-gris-claro hover:text-white'
                }`}
              >
                {isEngagement ? 'Encuestas' : 'Evaluaciones'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="h-80 w-full pt-2">
          {cityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cityChartData}
                layout="vertical"
                margin={{ top: 5, right: 65, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: number, name: string) => [
                    val,
                    name === 'preguntas' 
                      ? (isEngagement ? 'Respuestas Registradas' : 'Preguntas Registradas')
                      : (isEngagement ? 'Encuestas Realizadas' : 'Evaluaciones Realizadas')
                  ]}
                  labelFormatter={(label) => {
                    const found = cityChartData.find(c => c.name === label);
                    return found ? found.fullName : label;
                  }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                {(cityMetric === 'both' || cityMetric === 'preguntas') && (
                  <Bar dataKey="preguntas" name={isEngagement ? "Respuestas Registradas" : "Preguntas Registradas"} fill="#2F5D73" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="preguntas" position="right" fill="#1F2A33" fontSize={11} fontWeight="bold" />
                  </Bar>
                )}
                {(cityMetric === 'both' || cityMetric === 'evaluaciones') && (
                  <Bar dataKey="evaluaciones" name={isEngagement ? "Encuestas Realizadas" : "Evaluaciones Realizadas"} fill="#E3B23C" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="evaluaciones" position="right" fill="#1F2A33" fontSize={11} fontWeight="bold" />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Sin datos de ciudad o sede en el archivo
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
