import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { UploadCard } from './components/UploadCard';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { OverviewCharts } from './components/OverviewCharts';
import { FailedParticipantsAnalysis } from './components/FailedParticipantsAnalysis';
import { QuestionBreakdown } from './components/QuestionBreakdown';
import { ParticipantTable } from './components/ParticipantTable';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { parseExcelData, filterResponses, calculateSummary, analyzeQuestions } from './utils/excelParser';
import { generateBavariaSampleData } from './utils/sampleDataGenerator';
import { ParticipantResponse, FilterState, SurveyType } from './types/survey';
import { Upload, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { fetchResponsesFromFirebase, saveResponsesToFirebase, clearSurveyResponsesFromFirebase, isFirestoreQuotaExceeded } from './db/firebaseService';
import { getQuestionBlock } from './utils/engagementBlocks';
import { EngagementBlockTable } from './components/EngagementBlockTable';


export default function App() {
  const [activeSurveyType, setActiveSurveyType] = useState<SurveyType>(() => {
    try {
      const saved = localStorage.getItem('jm_active_survey_type');
      if (saved === 'principios' || saved === 'ambiente_seguro' || saved === 'job_description' || saved === 'engagement') {
        return saved as SurveyType;
      }
    } catch {}
    return 'principios';
  });
  const [responses, setResponses] = useState<ParticipantResponse[]>([]);
  const [passingThreshold, setPassingThreshold] = useState<number>(70);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Cargando información...');
  const [loadingSubMessage, setLoadingSubMessage] = useState<string>('Por favor espera un momento.');
  const [loadingSeconds, setLoadingSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingSeconds(0);
      interval = setInterval(() => {
        setLoadingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'failed' | 'questions' | 'participants'>(() => {
    try {
      const saved = localStorage.getItem('jm_active_tab');
      if (saved === 'dashboard' || saved === 'failed' || saved === 'questions' || saved === 'participants') {
        return saved as any;
      }
    } catch {}
    return 'dashboard';
  });

  useEffect(() => {
    try {
      localStorage.setItem('jm_active_survey_type', activeSurveyType);
    } catch {}
  }, [activeSurveyType]);

  useEffect(() => {
    try {
      localStorage.setItem('jm_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

  const [filters, setFilters] = useState<FilterState>({
    regional: 'ALL',
    city: 'ALL',
    operator: 'ALL',
    cargo: 'ALL',
    trainingType: 'ALL',
    year: 'ALL',
    month: 'ALL',
    status: 'ALL',
    satisfaction: 'ALL',
    searchTerm: '',
    engagementBlock: 'ALL'
  });

  const [dbStatus, setDbStatus] = useState<{ connected: boolean; provider?: string; count?: number } | null>(null);
  const [uploadMode, setUploadMode] = useState<'overwrite' | 'append'>('append');

  // Function to fetch DB status
  const fetchDbStatus = async (responsesLength: number) => {
    setDbStatus({ connected: true, provider: 'Firebase Firestore', count: responsesLength });
  };

  // Function to load responses from Firebase
  const loadFromDatabase = async (showNotification = false, surveyTypeToLoad = activeSurveyType) => {
    setIsLoading(true);
    setLoadingMessage('Consultando Base de Datos en la Nube de Bavaria...');
    setLoadingSubMessage('Recuperando las respuestas históricas y sincronizando el panel principal.');
    setErrorMessage(null);
    try {
      const data = await fetchResponsesFromFirebase(surveyTypeToLoad);
      setResponses(data);
      fetchDbStatus(data.length);
      if (showNotification) {
        if (data.length > 0) {
          setSuccessMessage(`Se cargaron ${data.length} respuestas almacenadas en Firebase.`);
        } else {
          setErrorMessage('La base de datos está vacía para esta encuesta. Sube un archivo Excel para guardar información.');
        }
      }
    } catch (err: any) {
      console.error('Error auto-loading from Firebase:', err);
      if (showNotification) {
        setErrorMessage(`Error al conectar con Firebase: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceOfflineLoad = () => {
    setIsLoading(false);
    try {
      const localKey = `firebase_backup_${activeSurveyType}`;
      const raw = localStorage.getItem(localKey);
      if (raw) {
        const localItems = JSON.parse(raw);
        if (Array.isArray(localItems) && localItems.length > 0) {
          setResponses(localItems);
          setDbStatus({ connected: false, provider: 'Caché Local Offline', count: localItems.length });
          setSuccessMessage(`Se cargaron ${localItems.length} registros desde el almacenamiento local sin esperar a la nube.`);
          return;
        }
      }
      setErrorMessage('No se encontró copia de seguridad local en este dispositivo para esta encuesta. Intente cargar datos de ejemplo o un archivo Excel.');
    } catch (e) {
      setErrorMessage('Error al leer el almacenamiento local offline.');
    }
  };

  // Switch survey handler
  const handleSelectSurveyType = (type: SurveyType) => {
    setActiveSurveyType(type);
    setFilters({
      regional: 'ALL',
      city: 'ALL',
      operator: 'ALL',
      cargo: 'ALL',
      trainingType: 'ALL',
      year: 'ALL',
      month: 'ALL',
      status: 'ALL',
      satisfaction: 'ALL',
      searchTerm: '',
      engagementBlock: 'ALL'
    });
    loadFromDatabase(false, type);
  };

  // Load stored data from Firebase Firestore on app mount or survey change
  useEffect(() => {
    loadFromDatabase(false, activeSurveyType);
  }, [activeSurveyType]);

  // Helper to save responses to Firebase Firestore
  const saveToDatabase = async (dataToSave: ParticipantResponse[], surveyTypeToSave = activeSurveyType, mode = uploadMode) => {
    if (!dataToSave || dataToSave.length === 0) {
      setErrorMessage('No hay datos en pantalla para guardar.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Sincronizando información con Firebase...');
    setLoadingSubMessage('Guardando y respaldando respuestas de forma segura en la nube de Bavaria.');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await saveResponsesToFirebase(dataToSave, surveyTypeToSave, mode);
      
      setDbStatus({ connected: true, provider: 'Firebase Firestore', count: result.count });
      if (result.quotaExceeded) {
        setSuccessMessage(
          `¡Información resguardada con éxito! (${result.count} registros). Nota: La cuota diaria gratuita de Firebase Firestore en la nube se encuentra agotada temporalmente, por lo que tus datos han sido respaldados de forma segura localmente.`
        );
      } else {
        setSuccessMessage(`¡Información guardada con éxito en Firebase Firestore! (${result.count} registros totales almacenados).`);
      }
    } catch (err: any) {
      console.error('Failed to save to Firebase:', err);
      setErrorMessage(`Error al guardar en Firebase: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to clear responses from Firebase
  const clearDatabase = async (clearAll: boolean = false) => {
    setIsLoading(true);
    setLoadingMessage('Eliminando registros de la Base de Datos...');
    setLoadingSubMessage('Vaciando las encuestas y refrescando el almacenamiento local.');
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await clearSurveyResponsesFromFirebase(clearAll ? undefined : activeSurveyType);
      if (result.success) {
        setResponses([]);
        setDbStatus({ connected: true, provider: 'Firebase Firestore', count: 0 });
        if (result.quotaExceeded) {
          setSuccessMessage(
            '¡Se han eliminado los datos locales y la memoria caché! (Nota: La cuota gratuita de lectura/escritura de Firebase en la nube fue excedida en este proyecto, pero el panel local ha sido reiniciado).'
          );
        } else {
          setSuccessMessage(
            clearAll 
              ? '¡Se han eliminado TODOS los datos de la base de datos con éxito!' 
              : `¡Se han eliminado los datos de la encuesta actual de la base de datos con éxito!`
          );
        }
      }
    } catch (err: any) {
      console.error('Failed to clear database:', err);
      setErrorMessage(`Error de conexión al vaciar la base de datos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleData = () => {
    setIsLoading(true);
    setLoadingMessage('Generando datos simulados de Bavaria...');
    setLoadingSubMessage('Creando respuestas aleatorias con lógica de principios para visualización inmediata.');
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const sample = generateBavariaSampleData(passingThreshold, activeSurveyType);
      setResponses(sample);
      saveToDatabase(sample, activeSurveyType, 'overwrite');
      setActiveTab('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al generar datos de ejemplo.');
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setLoadingMessage('Procesando archivo Excel...');
    setLoadingSubMessage('Leyendo columnas, mapeando preguntas e identificando factores de satisfacción.');
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use activeSurveyType as the hint for mapping
      const parsed = parseExcelData(arrayBuffer, passingThreshold, activeSurveyType);
      if (parsed.responses.length === 0) {
        throw new Error('No se encontraron filas con respuestas válidas en el archivo.');
      }
      
      // Identify the actual detected survey type from the parsed rows
      const detectedType = parsed.responses[0]?.surveyType || activeSurveyType;
      
      // Save parsed responses using the detectedType
      await saveToDatabase(parsed.responses, detectedType, uploadMode);
      
      // Switch active survey type state if it differs
      if (detectedType !== activeSurveyType) {
        setActiveSurveyType(detectedType);
      } else {
        // Crucial: reload the entire combined dataset from the database so the screen updates with everything stored!
        await loadFromDatabase(false, detectedType);
      }
      
      setActiveTab('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al procesar el archivo de Excel.');
      setIsLoading(false);
    }
  };

  // Recalculate pass/fail when threshold changes
  useEffect(() => {
    if (responses.length > 0) {
      setResponses(prev => prev.map(r => {
        const passed = r.scorePercentage >= passingThreshold;
        return { ...r, passed };
      }));
    }
  }, [passingThreshold]);

  // Derived filter options
  const regionals = useMemo(() => {
    const set = new Set<string>();
    (responses || []).forEach(r => { if (r && r.regional) set.add(String(r.regional)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [responses]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    (responses || []).forEach(r => { if (r && r.city) set.add(String(r.city)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [responses]);

  const operators = useMemo(() => {
    const set = new Set<string>();
    (responses || []).forEach(r => { if (r && r.operator) set.add(String(r.operator)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [responses]);

  const cargos = useMemo(() => {
    const set = new Set<string>();
    (responses || []).forEach(r => { if (r && r.cargo) set.add(String(r.cargo)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [responses]);

  const trainingTypes = useMemo(() => {
    const set = new Set<string>();
    (responses || []).forEach(r => { if (r && r.trainingType) set.add(String(r.trainingType)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [responses]);

  const years = useMemo(() => {
    const set = new Set<string>();
    (responses || []).forEach(r => { if (r && r.year !== undefined && r.year !== null) set.add(String(r.year)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [responses]);

  const months = useMemo(() => {
    const set = new Set<string>();
    (responses || []).forEach(r => { if (r && r.month) set.add(String(r.month)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [responses]);

  // Filtered dataset
  const filteredResponses = useMemo(() => {
    return filterResponses(responses, filters);
  }, [responses, filters]);

  // Summary KPIs and Question Analysis calculated on a block-specific basis for engagement survey
  const responsesForSummaryAndAnalysis = useMemo(() => {
    if (activeSurveyType === 'engagement' && filters.engagementBlock && filters.engagementBlock !== 'ALL') {
      const blockName = filters.engagementBlock;
      return filteredResponses.map(r => {
        const blockQuestions = r.questions.filter(q => getQuestionBlock(q.questionText) === blockName);
        if (blockQuestions.length === 0) return r;
        
        const totalPoints = blockQuestions.reduce((sum, q) => sum + q.pointsObtained, 0);
        const maxPointsPossible = blockQuestions.reduce((sum, q) => sum + q.maxPoints, 0);
        const average = blockQuestions.length > 0 ? (totalPoints / blockQuestions.length) : 0;
        
        // Recalculate status and passed for this block
        const scorePercentage = maxPointsPossible > 0 ? Math.round((totalPoints / maxPointsPossible) * 100) : 0;
        const statusType: 'PROMOTOR' | 'NEUTRO' | 'DETRACTOR' = average >= 9.0 ? 'PROMOTOR' : average >= 7.0 ? 'NEUTRO' : 'DETRACTOR';
        const passed = average >= 7.0;

        return {
          ...r,
          questions: blockQuestions,
          totalPoints,
          maxPointsPossible,
          scorePercentage,
          statusType,
          passed
        };
      });
    }
    return filteredResponses;
  }, [filteredResponses, filters.engagementBlock, activeSurveyType]);

  // Summary KPIs
  const summary = useMemo(() => {
    return calculateSummary(responsesForSummaryAndAnalysis, passingThreshold);
  }, [responsesForSummaryAndAnalysis, passingThreshold]);

  // Question Analysis
  const questionAnalysis = useMemo(() => {
    const allAnalysis = analyzeQuestions(responsesForSummaryAndAnalysis);
    if (activeSurveyType === 'engagement' && filters.engagementBlock && filters.engagementBlock !== 'ALL') {
      const blockName = filters.engagementBlock;
      return allAnalysis.filter(q => getQuestionBlock(q.questionText) === blockName);
    }
    return allAnalysis;
  }, [responsesForSummaryAndAnalysis, filters.engagementBlock, activeSurveyType]);

  // Failed participants list
  const failedParticipants = useMemo(() => {
    return filteredResponses.filter(r => !r.passed);
  }, [filteredResponses]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      regional: 'ALL',
      city: 'ALL',
      operator: 'ALL',
      cargo: 'ALL',
      trainingType: 'ALL',
      year: 'ALL',
      month: 'ALL',
      status: 'ALL',
      satisfaction: 'ALL',
      searchTerm: '',
      engagementBlock: 'ALL'
    });
  };

  // Export filtered dataset to XLSX
  const handleExportFiltered = () => {
    if (filteredResponses.length === 0) return;

    const exportRows = filteredResponses.map(r => ({
      ID: r.id,
      Nombre: r.name,
      'Cédula / Identificación': r.identification,
      Correo: r.email,
      Regional: r.regional,
      Operador: r.operator,
      Cargo: r.cargo,
      'Tipo Entrenamiento': r.trainingType,
      'Puntaje Total': r.totalPoints,
      'Puntaje Máximo': r.maxPointsPossible,
      'Porcentaje (%)': `${r.scorePercentage}%`,
      Estado: r.passed ? 'APROBADO' : 'REPROBADO',
      'Tiempo (min)': r.durationMinutes
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Evaluados_Filtrados');
    XLSX.writeFile(workbook, `Reporte_Evaluaciones_Bavaria_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-8 max-w-md w-full text-center space-y-6 animate-zoom-in">
            {/* Spinning Indicator */}
            <div className="relative w-20 h-20 mx-auto">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-teal-600 animate-spin"></div>
              {/* Inner ring */}
              <div className="absolute inset-2 rounded-full border-4 border-slate-100 border-b-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Database className="w-6 h-6 text-teal-700 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                {loadingMessage}
              </h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                {loadingSubMessage}
              </p>
            </div>

            {/* Loading Seconds & Dynamic Tips */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Estado del Proceso</span>
                <span className="font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-600">{loadingSeconds}s</span>
              </div>
              
              <div className="text-xs text-slate-600 font-medium leading-relaxed">
                {loadingSeconds < 4 ? (
                  "Estableciendo canal seguro con los servidores de base de datos en la nube de Bavaria..."
                ) : loadingSeconds < 8 ? (
                  "Verificando cuota diaria y estado del servicio de base de datos de Firebase..."
                ) : (
                  "La conexión en la nube está demorando un poco. Esto puede deberse a la latencia de red de tu equipo."
                )}
              </div>
            </div>

            {/* Offline Fallback Actions if taking too long */}
            {loadingSeconds >= 4 && (
              <div className="space-y-2 pt-2 animate-fade-in border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleForceOfflineLoad}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-black py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                  OMITIR ESPERA Y USAR COPIA LOCAL
                </button>
                <p className="text-[10px] text-slate-400 font-medium text-center">
                  Carga los datos previamente guardados de manera instantánea en tu navegador.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        activeSurveyType={activeSurveyType}
        onSelectSurveyType={handleSelectSurveyType}
        onFileUpload={handleFileUpload}
        onLoadSampleData={handleLoadSampleData}
        passingThreshold={passingThreshold}
        onPassingThresholdChange={setPassingThreshold}
        hasData={responses.length > 0}
        onExportFiltered={handleExportFiltered}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        failedCount={failedParticipants.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-center justify-between text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-800 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 flex items-center justify-between text-xs font-semibold shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Excel Card */}
        <UploadCard
          activeSurveyType={activeSurveyType}
          onFileUpload={handleFileUpload}
          onLoadSampleData={handleLoadSampleData}
          onSaveToDb={() => saveToDatabase(responses)}
          onReloadFromDb={() => loadFromDatabase(true)}
          isLoading={isLoading}
          totalLoaded={responses.length}
          dbCount={dbStatus?.count ?? 0}
          isDbConnected={dbStatus?.connected}
          isQuotaExceeded={isFirestoreQuotaExceeded()}
          uploadMode={uploadMode}
          onUploadModeChange={setUploadMode}
          onClearDb={clearDatabase}
        />

        {/* Main Dashboard Workspace */}
        {responses.length > 0 && (
          <ErrorBoundary onResetFilters={handleResetFilters}>
            {/* KPI Metrics Strip */}
            <KpiCards
              summary={summary}
              surveyType={activeSurveyType}
              onSelectFailedFilter={() => {
                setActiveTab('failed');
              }}
            />

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              regionals={regionals}
              cities={cities}
              operators={operators}
              cargos={cargos}
              trainingTypes={trainingTypes}
              years={years}
              months={months}
              totalFilteredCount={filteredResponses.length}
              activeSurveyType={activeSurveyType}
            />

            {/* Main Survey View */}
            <div className="space-y-6 mt-4">
              {/* Engagement Dimension Block Summary Table - ONLY for engagement survey */}
              {activeSurveyType === 'engagement' && (
                <EngagementBlockTable
                  responses={filteredResponses}
                  activeBlock={filters.engagementBlock || 'ALL'}
                  onBlockSelect={(block) => setFilters({ ...filters, engagementBlock: block })}
                />
              )}

              {/* Section 1: GRÁFICAS DE ANÁLISIS Y CARGO CRÍTICO */}
              <OverviewCharts
                responses={filteredResponses}
                questionAnalysis={questionAnalysis}
                surveyType={activeSurveyType}
              />

              {/* Section 2: RESULTADOS POR PRINCIPIO */}
              <QuestionBreakdown
                questionAnalysisList={questionAnalysis}
                totalEvaluated={filteredResponses.length}
                surveyType={activeSurveyType}
              />

              {/* Section 3: PERSONAS EVALUADAS */}
              <ParticipantTable
                responses={filteredResponses}
                onExport={handleExportFiltered}
                passingThresholdPercent={passingThreshold}
                searchTerm={filters.searchTerm}
                onSearchChange={(term) => setFilters({ ...filters, searchTerm: term })}
                surveyType={activeSurveyType}
              />
            </div>
          </ErrorBoundary>
        )}

      </main>

      {/* Protected Footer with Developer Rights */}
      <Footer dbCount={dbStatus?.count ?? responses.length} />
    </div>
  );
}
