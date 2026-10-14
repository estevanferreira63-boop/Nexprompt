import React, { useState } from 'react';
import {
  Award,
  X,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGamification } from '../context/GamificationContext';
import { sound } from '../utils/soundEffects';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  completedCount,
}) => {
  const { language } = useLanguage();
  const { xp, currentLevel } = useGamification();

  const [studentName, setStudentName] = useState<string>(() => {
    try {
      return localStorage.getItem('de_ai_student_name') || 'Especialista em Dados';
    } catch {
      return 'Especialista em Dados';
    }
  });

  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    setStudentName(name);
    try {
      localStorage.setItem('de_ai_student_name', name);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    sound.playSuccess();
    window.print();
  };

  const certificateId = `DE-AI-2026-${Math.abs(xp * 31 + completedCount * 97).toString(16).toUpperCase().padStart(8, '0')}`;
  const currentDate = new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const shareText =
    `🎓 Conquistei o nível ${currentLevel.level} (${currentLevel.titlePt}) dominando ${completedCount}/100 conceitos de Engenharia de Dados & IA com ${xp} XP!\n` +
    `Certificado #${certificateId} emitido no 100 Data Engineering & AI Concepts Hub.`;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    sound.playSuccess();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:border-none print:shadow-none print:max-w-none print:max-h-none print:bg-white print:text-black">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {language === 'pt' ? 'Certificado Oficial de Domínio' : 'Official Mastery Certificate'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {language === 'pt' ? 'Gere e exporte sua credencial de aprendizado' : 'Generate and export your verified credential'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (language === 'pt' ? 'Copiado!' : 'Copied!') : (language === 'pt' ? 'Compartilhar' : 'Share')}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'pt' ? 'Imprimir / PDF' : 'Print / PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Name Edit Toolbar (Hidden on print) */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3 print:hidden">
          <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <label className="text-xs font-mono text-slate-400 whitespace-nowrap">
            {language === 'pt' ? 'Seu Nome no Certificado:' : 'Student Name:'}
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="flex-1 max-w-sm px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-sans text-white focus:outline-none focus:border-cyan-500"
            placeholder="Digite seu nome completo..."
          />
        </div>

        {/* The Printable Certificate Canvas Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 print:bg-white print:p-8">
          <div className="relative border-4 border-amber-500/40 rounded-3xl p-8 sm:p-12 bg-slate-950/95 shadow-2xl overflow-hidden print:border-amber-600 print:bg-white print:shadow-none">
            {/* Ambient Corner Ornaments */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none print:hidden" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none print:hidden" />

            {/* Inner Border */}
            <div className="border border-amber-500/20 rounded-2xl p-6 sm:p-8 text-center space-y-6 print:border-amber-400">
              {/* Header Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono text-xs uppercase tracking-widest print:text-amber-700 print:border-amber-700">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Verified Competency Credential</span>
                </div>
              </div>

              {/* Certificate Title */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase print:text-black font-sans">
                  {language === 'pt' ? 'Certificado de Excelência' : 'Certificate of Mastery'}
                </h1>
                <p className="text-xs sm:text-sm font-mono text-cyan-400 mt-1 uppercase tracking-wider print:text-cyan-800">
                  100 Concepts Data Engineering & AI Architecture
                </p>
              </div>

              {/* Presented To Text */}
              <div className="py-2">
                <p className="text-xs sm:text-sm font-mono text-slate-400 uppercase tracking-widest print:text-gray-600">
                  {language === 'pt' ? 'Certificamos com distinção que' : 'This is to officially certify that'}
                </p>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight my-2 border-b-2 border-amber-500/30 pb-2 inline-block min-w-[280px] print:text-amber-800 print:border-amber-600">
                  {studentName || 'Especialista em Dados'}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mt-2 print:text-gray-700">
                  {language === 'pt'
                    ? `completou e demonstrou domínio técnico sobre os fundamentos arquiteturais de sistemas distribuídos, processamento de streaming, armazenamento colunar e integração de modelos de IA, acumulando ${xp} pontos de experiência (XP).`
                    : `has demonstrated technical mastery in distributed computing, streaming data pipelines, columnar Lakehouse storage, and AI architectural patterns, earning ${xp} experience points (XP).`}
                </p>
              </div>

              {/* Verified Metrics Badges */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto py-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:bg-gray-100 print:border-gray-300">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block print:text-gray-600">
                    {language === 'pt' ? 'Conceitos' : 'Concepts'}
                  </span>
                  <span className="text-lg font-black text-emerald-400 print:text-emerald-700">
                    {completedCount} / 100
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:bg-gray-100 print:border-gray-300">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block print:text-gray-600">
                    {language === 'pt' ? 'Nível Alcançado' : 'Mastery Rank'}
                  </span>
                  <span className="text-sm font-black text-amber-400 truncate block mt-1 print:text-amber-700">
                    {language === 'pt' ? currentLevel.titlePt : currentLevel.titleEn}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 print:bg-gray-100 print:border-gray-300">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block print:text-gray-600">
                    {language === 'pt' ? 'Total XP' : 'Total XP'}
                  </span>
                  <span className="text-lg font-black text-cyan-400 print:text-cyan-700">
                    {xp} XP
                  </span>
                </div>
              </div>

              {/* Signatures & Security Footer */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400 print:text-gray-600 print:border-gray-300">
                <div className="text-center sm:text-left">
                  <p className="text-slate-200 font-bold print:text-black">100 Data Engineering Hub</p>
                  <p className="text-[11px] text-slate-500 print:text-gray-500">Autonomous Architectural Verification</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-slate-300 print:text-black">{currentDate}</p>
                  <p className="text-[10px] text-cyan-400 font-mono print:text-cyan-800">
                    ID: #{certificateId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
