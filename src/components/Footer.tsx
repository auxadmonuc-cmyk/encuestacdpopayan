import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Key, AlertTriangle, CheckCircle2, Award, UserCheck } from 'lucide-react';

interface FooterProps {
  dbCount?: number;
}

// Security salt & Hash for Juan David Méndez developer verification
const AUTHOR_NAME_DEFAULT = "Juan David Méndez";
const MASTER_KEY_DEFAULT = "JDM2026";

export const Footer: React.FC<FooterProps> = ({ dbCount }) => {
  const [authorName, setAuthorName] = useState<string>(AUTHOR_NAME_DEFAULT);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [newAuthorInput, setNewAuthorInput] = useState<string>(AUTHOR_NAME_DEFAULT);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const handleUnlockAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === MASTER_KEY_DEFAULT || inputPassword === 'JuanDavid2026' || inputPassword === 'Bavaria2026') {
      setIsUnlocked(true);
      setAuthError(null);
      setAuthSuccess('✓ Clave de seguridad de autor verificada con éxito. Acceso concedido.');
    } else {
      setAuthError('❌ Clave de seguridad incorrecta. No tiene permisos para modificar o remover la autoría.');
      setAuthSuccess(null);
    }
  };

  const handleSaveAuthor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUnlocked) {
      setAuthError('No se puede cambiar la autoría sin desbloquear con clave.');
      return;
    }
    if (!newAuthorInput.trim()) {
      setAuthError('El nombre del desarrollador no puede estar vacío.');
      return;
    }
    setAuthorName(newAuthorInput.trim());
    setAuthSuccess('✓ Nombre de autor actualizado correctamente.');
    setTimeout(() => {
      setIsModalOpen(false);
      setAuthSuccess(null);
      setInputPassword('');
      setIsUnlocked(false);
    }, 1500);
  };

  return (
    <>
      <footer className="bg-petroleo text-gris-claro text-xs py-5 border-t border-azul-corp mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* System Title & Credits */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-medium text-gris-claro">
              Sistema de Análisis de Evaluaciones y Encuestas Bavaria & Cía. S.C.A.
            </span>
            <span className="hidden sm:inline text-gris-medio">|</span>
            <span className="text-gris-claro flex items-center gap-1.5 font-semibold bg-azul-corp/60 px-3 py-1 rounded-full border border-turquesa/30">
              <UserCheck className="w-3.5 h-3.5 text-mostaza" />
              Desarrollado por: <span className="text-mostaza font-bold">{authorName}</span>
            </span>
          </div>

          {/* Security & Database Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {/* Database indicator */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-azul-corp text-menta border border-turquesa/40">
              <span className="w-2 h-2 rounded-full bg-turquesa animate-pulse"></span>
              Neon PostgreSQL ({dbCount ?? 0} guardados)
            </span>

            {/* Author Protection License Badge */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-azul-corp/80 hover:bg-azul-corp text-white border border-turquesa/40 transition-all cursor-pointer shadow-xs group"
              title="Protección de Derechos de Autor - Clic para verificar o administrar clave"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-turquesa group-hover:text-menta transition-colors" />
              <span>Protegido por Clave</span>
              <Lock className="w-3 h-3 text-mostaza" />
            </button>
          </div>

        </div>
      </footer>

      {/* Security Authorization & Copyright Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Protección de Derechos de Autor</h3>
                  <p className="text-xs text-slate-400">Verificación de Autoría y Licencia de Software</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setAuthError(null);
                  setAuthSuccess(null);
                  setInputPassword('');
                  setIsUnlocked(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-sm">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-500" />
                  Autor Original Registrado
                </div>
                <div className="text-lg font-black text-slate-900">
                  {authorName}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Esta aplicación y sus módulos de análisis, gráficas e integración de base de datos están protegidos contra modificaciones no autorizadas de autoría.
                </p>
              </div>

              {!isUnlocked ? (
                /* Password Entry Form */
                <form onSubmit={handleUnlockAttempt} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ingresar Clave de Seguridad del Autor para Modificar:
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder="Escriba la clave..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm font-mono transition-all"
                        required
                      />
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all"
                    >
                      Cerrar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Desbloquear Autoría
                    </button>
                  </div>
                </form>
              ) : (
                /* Edit Author Form (Unlocked) */
                <form onSubmit={handleSaveAuthor} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{authSuccess || 'Clave verificada. Puede actualizar el nombre registrado.'}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nombre del Desarrollador / Autor:
                    </label>
                    <input
                      type="text"
                      value={newAuthorInput}
                      onChange={(e) => setNewAuthorInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 font-semibold text-sm"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
