import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, UserCheck, Lock, Key, Database } from 'lucide-react';

type UserRole = 'ADMIN' | 'DATA_SCIENTIST' | 'MARKETING' | 'AUDITOR';

interface CustomerRow {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  salario: number;
  regiao: string;
}

const RAW_CUSTOMERS: CustomerRow[] = [
  { id: 101, nome: 'Marina Santos', cpf: '123.456.789-01', email: 'marina.santos@tech.com', salario: 12500, regiao: 'SP' },
  { id: 102, nome: 'Rodrigo Alves', cpf: '987.654.321-99', email: 'rodrigo.alves@startup.io', salario: 8900, regiao: 'RJ' },
  { id: 103, nome: 'Camila Ferreira', cpf: '456.789.012-34', email: 'camila.ferreira@corp.br', salario: 15400, regiao: 'MG' },
  { id: 104, nome: 'Lucas Oliveira', cpf: '321.654.987-12', email: 'lucas.oliveira@fintech.com', salario: 9800, regiao: 'SP' },
];

export const DataMaskingRbacLab: React.FC = () => {
  const [role, setRole] = useState<UserRole>('MARKETING');

  const maskCpf = (cpf: string): string => {
    if (role === 'ADMIN') return cpf;
    if (role === 'AUDITOR') return '***.***.***-**';
    return `***.***.${cpf.slice(8, 11)}-**`;
  };

  const maskEmail = (email: string): string => {
    if (role === 'ADMIN') return email;
    if (role === 'DATA_SCIENTIST') return `sha256_${email.slice(0, 4)}...`;
    const parts = email.split('@');
    return parts.length === 2 ? `${parts[0].slice(0, 2)}***@${parts[1]}` : '***@***';
  };

  const maskSalario = (sal: number): string => {
    if (role === 'ADMIN' || role === 'AUDITOR') return `R$ ${sal.toLocaleString()}`;
    if (role === 'DATA_SCIENTIST') {
      // Generalization into brackets
      return sal > 10000 ? 'Faixa R$ 10k - 20k' : 'Faixa R$ 5k - 10k';
    }
    return '[OCULTO: SEM ACESSO]';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Laboratório Visual 09 • Conceitos #93, #94, #95
          </div>
          <h3 className="text-xl font-bold text-white">Simulador de RBAC & Mascaramento Dinâmico de PII</h3>
          <p className="text-slate-400 text-sm mt-1">
            Alterne o papel (Role) do usuário logado e veja o motor de banco de dados aplicar máscaras em tempo real em colunas sensíveis.
          </p>
        </div>

        {/* Role Selector Pills */}
        <div className="flex flex-wrap bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1 text-xs font-semibold">
          <button
            onClick={() => setRole('ADMIN')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              role === 'ADMIN' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Role: ADMIN / DPO
          </button>
          <button
            onClick={() => setRole('DATA_SCIENTIST')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              role === 'DATA_SCIENTIST' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Role: Cientista de Dados
          </button>
          <button
            onClick={() => setRole('MARKETING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              role === 'MARKETING' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Role: Analista Marketing
          </button>
          <button
            onClick={() => setRole('AUDITOR')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              role === 'AUDITOR' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            Role: Auditor Externo
          </button>
        </div>
      </div>

      {/* Role Context Bar */}
      <div className="mt-6 bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-rose-400" />
          <span className="text-slate-400">Usuário Atual no Catálogo:</span>
          <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            CURRENT_ROLE() = '{role}'
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {role === 'ADMIN' && 'Acesso irrestrito a PII para conformidade legal.'}
          {role === 'DATA_SCIENTIST' && 'Salário anonimizado em faixas e e-mail pseudonimizado com hash.'}
          {role === 'MARKETING' && 'Salário totalmente bloqueado e e-mail mascarado para campanhas.'}
          {role === 'AUDITOR' && 'CPF totalmente protegido por sigilo de identidade.'}
        </span>
      </div>

      {/* Customer Table with dynamic mask */}
      <div className="mt-6 bg-slate-950 p-5 rounded-xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
              <th className="p-3">ID</th>
              <th className="p-3">NOME CLIENTE</th>
              <th className="p-3">CPF (PII CRÍTICO)</th>
              <th className="p-3">E-MAIL (PII)</th>
              <th className="p-3">SALÁRIO (DADO FINANCEIRO)</th>
              <th className="p-3">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {RAW_CUSTOMERS.map((cust) => (
              <tr key={cust.id} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                <td className="p-3 text-slate-500 font-bold">#{cust.id}</td>
                <td className="p-3 text-slate-200 font-semibold">{cust.nome}</td>
                <td className={`p-3 font-bold ${role === 'ADMIN' ? 'text-rose-400' : 'text-slate-400'}`}>
                  {maskCpf(cust.cpf)}
                </td>
                <td className="p-3 text-cyan-300">{maskEmail(cust.email)}</td>
                <td className={`p-3 font-bold ${role === 'MARKETING' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {maskSalario(cust.salario)}
                </td>
                <td className="p-3 text-slate-400">{cust.regiao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-sans">
        <span className="text-rose-400 font-bold font-mono block mb-1">Princípio do Menor Privilégio (PoLP):</span>
        O dado gravado no disco físico S3 continua intacto e único. O motor de consulta (Snowflake / Databricks / Postgres RLS) aplica uma função de mascaramento durante a projeção de colunas baseado na sessão do usuário. Isso evita criar tabelas duplicadas para cada time!
      </div>
    </div>
  );
};
