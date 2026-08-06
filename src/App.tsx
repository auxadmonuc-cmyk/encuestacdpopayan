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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    searchTerm: ''
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
      searchTerm: ''
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

  // Summary KPIs
  const summary = useMemo(() => {
    return calculateSummary(filteredResponses, passingThreshold);
  }, [filteredResponses, passingThreshold]);

  // Question Analysis
  const questionAnalysis = useMemo(() => {
    return analyzeQuestions(filteredResponses);
  }, [filteredResponses]);

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
      searchTerm: ''
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
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col">
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

        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center shadow-xs">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Procesando y Sincronizando Firebase Firestore...</h3>
            <p className="text-xs text-slate-500 mt-1">Calculando puntajes y guardando los registros en Firebase Firestore.</p>
          </div>
        )}

        {/* Upload Excel Card */}
        {!isLoading && (
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
        )}

        {/* Main Dashboard Workspace */}
        {!isLoading && responses.length > 0 && (
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
            />

            {/* Main Survey View */}
            <div className="space-y-6 mt-4">
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
