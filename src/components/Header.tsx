import React from 'react';
import { ShieldCheck, HeartHandshake, FileText, BarChart3, Smile } from 'lucide-react';
import { SurveyType } from '../types/survey';
import { LogisticaLogo } from './LogisticaLogo';

interface HeaderProps {
  activeSurveyType: SurveyType;
  onSelectSurveyType: (type: SurveyType) => void;
  onFileUpload: (file: File) => void;
  onLoadSampleData: () => void;
  passingThreshold: number;
  onPassingThresholdChange: (val: number) => void;
  hasData: boolean;
  onExportFiltered: () => void;
  activeTab: 'dashboard' | 'failed' | 'questions' | 'participants';
  setActiveTab: (tab: 'dashboard' | 'failed' | 'questions' | 'participants') => void;
  failedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeSurveyType,
  onSelectSurveyType,
  hasData
}) => {
  return (
    <header className="bg-petroleo text-white border-b border-azul-corp sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
          
          {/* Brand Logo & Title with LOGÍSTICA Emblem */}
          <div className="flex items-center space-x-4">
            {/* New Logística Logo Component */}
            <div className="bg-azul-corp/30 p-2 rounded-2xl border border-turquesa/30 shadow-md flex items-center">
              <LogisticaLogo className="h-11 sm:h-12" />
            </div>

            <div className="hidden xl:block border-l border-azul-corp/60 pl-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-turquesa">
                  {activeSurveyType === 'ambiente_seguro' 
                    ? 'Ambiente Seguro e Inclusivo' 
                    : activeSurveyType === 'job_description'
                    ? 'Job Description'
                    : activeSurveyType === 'engagement'
                    ? 'Engagement'
                    : 'Principios de la Compañía'}
                </span>
                <span className="bg-mostaza/20 text-mostaza text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-mostaza/40">
                  Bavaria
                </span>
              </div>
              <p className="text-[11px] text-gris-medio mt-0.5">
                Plataforma de evaluación y análisis de encuestas
              </p>
            </div>
          </div>

          {/* Survey Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-negro-suave/80 p-1.5 rounded-2xl border border-azul-corp">
            <button
              onClick={() => onSelectSurveyType('principios')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
                activeSurveyType === 'principios'
                  ? 'bg-mostaza text-petroleo shadow-md scale-[1.02]'
                  : 'text-gris-claro hover:text-white hover:bg-azul-corp/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Principios de la Compañía</span>
            </button>

            <button
              onClick={() => onSelectSurveyType('ambiente_seguro')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
                activeSurveyType === 'ambiente_seguro'
                  ? 'bg-mostaza text-petroleo shadow-md scale-[1.02]'
                  : 'text-gris-claro hover:text-white hover:bg-azul-corp/60'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Ambiente Trabajo Seguro</span>
            </button>

            <button
              onClick={() => onSelectSurveyType('job_description')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
                activeSurveyType === 'job_description'
                  ? 'bg-mostaza text-petroleo shadow-md scale-[1.02]'
                  : 'text-gris-claro hover:text-white hover:bg-azul-corp/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Job Description</span>
            </button>

            <button
              onClick={() => onSelectSurveyType('engagement')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all ${
                activeSurveyType === 'engagement'
                  ? 'bg-mostaza text-petroleo shadow-md scale-[1.02]'
                  : 'text-gris-claro hover:text-white hover:bg-azul-corp/60'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Engagement</span>
            </button>
          </div>

        </div>

        {/* Navigation Bar Header indicator */}
        {hasData && (
          <nav className="flex items-center border-t border-azul-corp/60 pt-2.5 pb-2">
            <div className="flex items-center bg-azul-corp/40 border border-turquesa/40 text-turquesa font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs">
              <BarChart3 className="w-4 h-4 mr-2 text-turquesa" />
              <span className="tracking-tight text-xs uppercase font-bold">
                JM Dashboard — {activeSurveyType === 'ambiente_seguro' 
                  ? 'Encuesta Ambiente Trabajo Seguro e Inclusivo' 
                  : activeSurveyType === 'job_description'
                  ? 'Encuesta Job Description'
                  : activeSurveyType === 'engagement'
                  ? 'Encuesta Engagement'
                  : 'Encuesta Principios de la Compañía'}
              </span>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
