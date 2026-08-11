import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Sparkles, FileCheck, Database, Save, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import { SurveyType } from '../types/survey';

interface UploadCardProps {
  activeSurveyType?: SurveyType;
  onFileUpload: (file: File) => void;
  onLoadSampleData: () => void;
  onSaveToDb: () => void;
  onReloadFromDb: () => void;
  onClearDb?: (clearAll: boolean) => void;
  isLoading: boolean;
  totalLoaded: number;
  dbCount?: number;
  isDbConnected?: boolean;
  isQuotaExceeded?: boolean;
  uploadMode?: 'overwrite' | 'append';
  onUploadModeChange?: (mode: 'overwrite' | 'append') => void;
  isOfflineMode?: boolean;
  onOfflineModeChange?: (offline: boolean) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  activeSurveyType = 'principios',
  onFileUpload,
  onLoadSampleData,
  onSaveToDb,
  onReloadFromDb,
  onClearDb,
  isLoading,
  totalLoaded,
  dbCount = 0,
  isDbConnected = true,
  isQuotaExceeded = false,
  uploadMode = 'append',
  onUploadModeChange,
  isOfflineMode = false,
  onOfflineModeChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const surveyTitle = activeSurveyType === 'ambiente_seguro'
    ? 'Encuesta Ambiente Trabajo Seguro e Inclusivo'
    : activeSurveyType === 'job_description'
    ? 'Encuesta Job Description'
    : activeSurveyType === 'engagement'
    ? 'Encuesta Engagement'
    : 'Encuesta Principios de la Compañía';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gris-medio/30 shadow-xs p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-gris-claro">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-menta/30 text-petroleo rounded-xl border border-turquesa/40">
            <FileSpreadsheet className="w-6 h-6 text-azul-corp" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-petroleo tracking-tight">
              Carga y Procesamiento de la {surveyTitle}
            </h2>
            <p className="text-xs text-gris-medio mt-0.5 font-medium">
              Arrastra o selecciona el archivo Excel (.xlsx / .csv) exportado de Microsoft Forms
            </p>
          </div>
        </div>

        {/* DB Sync & Count status */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {totalLoaded > 0 && (
            <div className="flex items-center gap-2 bg-menta/30 text-petroleo border border-turquesa/50 px-3 py-1.5 rounded-xl text-xs font-bold">
              <FileCheck className="w-4 h-4 text-azul-corp" />
              <span>{totalLoaded} Respuestas en Pantalla</span>
            </div>
          )}

          {/* Connection Mode Toggle (Offline vs Online) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOfflineModeChange?.(!isOfflineMode);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all active:scale-95 shadow-xs ${
              isOfflineMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
            title={isOfflineMode ? 'Trabajando Offline. Clic para activar sincronización con la nube.' : 'Trabajando Online con la Nube. Clic para activar modo Offline.'}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-700" />
                <span>Modo Local (Offline)</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-700 animate-pulse" />
                <span>Modo Sincronizado (Nube)</span>
              </>
            )}
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            isOfflineMode
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : isQuotaExceeded
              ? 'bg-amber-800 text-amber-100 border-amber-600'
              : 'bg-petroleo text-white border-azul-corp'
          }`}>
            <Database className={`w-3.5 h-3.5 ${isOfflineMode ? 'text-amber-600' : isQuotaExceeded ? 'text-amber-300' : 'text-turquesa'}`} />
            <span>
              {isOfflineMode
                ? `Caché Local: ${dbCount} Reg.`
                : isQuotaExceeded
                ? `Almacenamiento Seguro: ${dbCount} Reg.`
                : `Base Firebase: ${dbCount} Registros`}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones de Base de Datos y Selector de Modo */}
      <div className="bg-gris-claro/50 border border-gris-medio/30 rounded-xl p-4 mb-5 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-xs font-extrabold text-petroleo flex items-center gap-2">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-turquesa"></span>
              Método de carga de múltiples archivos
            </h3>
            <p className="text-[11px] text-negro-suave/80 font-medium leading-relaxed">
              Permite combinar varias partes de encuestas (ej: principios de año a junio, y de junio a la actualidad) sin duplicar filas.
            </p>
          </div>
          <div className="flex gap-1.5 bg-gris-medio/20 p-1 rounded-lg w-full md:w-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUploadModeChange?.('append');
              }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                uploadMode === 'append'
                  ? 'bg-white text-petroleo shadow-xs border border-turquesa/40'
                  : 'text-negro-suave hover:text-petroleo hover:bg-white/50'
              }`}
            >
              Acoplar y Sumar (Sin duplicados)
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUploadModeChange?.('overwrite');
              }}
              className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                uploadMode === 'overwrite'
                  ? 'bg-mostaza/20 text-petroleo shadow-xs border border-mostaza'
                  : 'text-negro-suave hover:text-petroleo hover:bg-white/50'
              }`}
            >
              Reemplazar todo
            </button>
          </div>
        </div>

        {/* Acciones de Firebase Firestore: Guardar, Cargar, Borrar */}
        <div className="pt-3 border-t border-gris-medio/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {totalLoaded > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveToDb();
                }}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar datos en Firebase</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReloadFromDb();
              }}
              className="px-3.5 py-1.5 bg-petroleo hover:bg-azul-corp text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-turquesa" />
              <span>Cargar de Firebase</span>
            </button>
          </div>

          {onClearDb && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('¿Estás seguro de que deseas eliminar los datos de la encuesta actual en Firebase Firestore?')) {
                    onClearDb(false);
                  }
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Eliminar solo las respuestas de la encuesta seleccionada"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Borrar Encuesta Actual</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('⚠️ ATENCIÓN: ¿Estás seguro de que deseas eliminar TODOS los datos de TODAS las encuestas en Firebase Firestore? Esta acción no se puede deshacer.')) {
                    onClearDb(true);
                  }
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Eliminar absolutamente todos los registros guardados"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>Borrar Toda la Base de Datos</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-turquesa/60 hover:border-turquesa bg-menta/10 hover:bg-menta/25 rounded-xl p-6 text-center cursor-pointer transition-all space-y-3 group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />

        <div className="w-12 h-12 bg-menta/50 group-hover:bg-turquesa/30 text-petroleo rounded-full flex items-center justify-center mx-auto transition-colors">
          <Upload className="w-6 h-6 text-azul-corp" />
        </div>

        <div>
          <span className="text-sm font-bold text-petroleo group-hover:text-azul-corp transition-colors">
            Haz clic aquí para seleccionar tu archivo Excel
          </span>
          <span className="text-xs text-negro-suave/70 block mt-1">
            o arrastra el archivo de la {surveyTitle} directamente a este recuadro
          </span>
        </div>

        <div className="pt-2 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-5 py-2.5 bg-azul-corp hover:bg-petroleo text-white font-extrabold text-xs rounded-xl shadow-md transition-all transform hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-turquesa" />
            <span>Examinar y Cargar Archivo Excel</span>
          </button>
        </div>
      </div>

    </div>
  );
};
