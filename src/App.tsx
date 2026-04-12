/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from './lib/supabase';
import { 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  ChevronRight,
  Search,
  Bell,
  User,
  Menu,
  X,
  PlusCircle,
  Save,
  Inbox,
  Lock,
  LogOut
} from 'lucide-react';
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
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data from Images ---

const INITIAL_DAILY_SUMMARY = [
  { label: 'Pendente', value: 0, percentage: '0,0%', meta: '-', color: 'bg-slate-100 text-slate-700' },
  { label: 'Encaminhados', value: 2187, percentage: '0,8%', meta: '<0,4%', color: 'bg-blue-100 text-blue-700' },
  { label: 'Em Atendimento', value: 18566, percentage: '6,65%', meta: '<2,5%', color: 'bg-indigo-100 text-indigo-700' },
  { label: 'Atendido', value: 83, percentage: '0,0%', meta: '<0,1%', color: 'bg-purple-100 text-purple-700' },
  { label: 'Resolvidas', value: 260548, percentage: '93,3%', meta: '>97%', color: 'bg-green-100 text-green-700' },
  { label: 'Recusadas', value: 10715, percentage: '3,8%', meta: '-', color: 'bg-red-100 text-red-700' },
  { label: 'Indeferidas', value: 2014, percentage: '0,72%', meta: '-', color: 'bg-orange-100 text-orange-700' },
];

const neighborhoodData = [
  { name: 'Alto Uruguai', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
  { name: 'Banco de Areia', total: 22072, resolved: 21684, current: 98, previous: 98, signal: 0, open: 388 },
  { name: 'BNH', total: 12622, resolved: 12433, current: 99, previous: 99, signal: 0, open: 189 },
  { name: 'Centro', total: 37170, resolved: 36389, current: 98, previous: 98, signal: 0, open: 781 },
  { name: 'Chatuba', total: 35904, resolved: 35232, current: 98, previous: 98, signal: 0, open: 672 },
  { name: 'Coreia', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
  { name: 'Cosmorama', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
  { name: 'Cruzeiro do Sul', total: 8654, resolved: 8509, current: 98, previous: 98, signal: 0, open: 145 },
  { name: 'Edson Passos', total: 26985, resolved: 26560, current: 98, previous: 99, signal: -1, open: 425 },
  { name: 'Jacutinga', total: 13063, resolved: 12827, current: 98, previous: 98, signal: 0, open: 236 },
  { name: 'Juscelino', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
  { name: 'Rocha Sobrinho', total: 7183, resolved: 6993, current: 98, previous: 98, signal: 0, open: 190 },
  { name: 'Santa Terezinha', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
  { name: 'Santo Elias', total: 20261, resolved: 19924, current: 98, previous: 98, signal: 0, open: 337 },
  { name: 'Vila Emil', total: 30231, resolved: 29770, current: 98, previous: 99, signal: -1, open: 461 },
  { name: 'Vila Norma', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
];

const pieData = [
  { name: 'Resolvidas', value: 260548, color: '#10b981' },
  { name: 'Outros', value: 18566, color: '#94a3b8' },
];

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, valueContainerClass = "" }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-4 pb-2 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between h-36"
  >
    <div className="flex flex-col h-full justify-between">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <div className={`mt-auto ${valueContainerClass}`}>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className={`text-xs text-slate-400 mt-1 ${subValue ? '' : 'invisible'}`}>
          {subValue || 'Placeholder'}
        </p>
      </div>
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon size={20} />
    </div>
  </motion.div>
);

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [summaryData, setSummaryData] = useState(INITIAL_DAILY_SUMMARY);
  const [receivedToday, setReceivedToday] = useState(1245);
  const [totalDemands, setTotalDemands] = useState(279114);
  const [referenceDate, setReferenceDate] = useState('2026-04-10');
  const [neighborhoodData, setNeighborhoodData] = useState([
    { name: 'Alto Uruguai', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
    { name: 'Banco de Areia', total: 22072, resolved: 21684, current: 98, previous: 98, signal: 0, open: 388 },
    { name: 'BNH', total: 12622, resolved: 12433, current: 99, previous: 99, signal: 0, open: 189 },
    { name: 'Centro', total: 37170, resolved: 36389, current: 98, previous: 98, signal: 0, open: 781 },
    { name: 'Chatuba', total: 35904, resolved: 35232, current: 98, previous: 98, signal: 0, open: 672 },
    { name: 'Coreia', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
    { name: 'Cosmorama', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
    { name: 'Cruzeiro do Sul', total: 8654, resolved: 8509, current: 98, previous: 98, signal: 0, open: 145 },
    { name: 'Edson Passos', total: 26985, resolved: 26560, current: 98, previous: 99, signal: -1, open: 425 },
    { name: 'Jacutinga', total: 13063, resolved: 12827, current: 98, previous: 98, signal: 0, open: 236 },
    { name: 'Juscelino', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
    { name: 'Rocha Sobrinho', total: 7183, resolved: 6993, current: 98, previous: 98, signal: 0, open: 190 },
    { name: 'Santa Terezinha', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
    { name: 'Santo Elias', total: 20261, resolved: 19924, current: 98, previous: 98, signal: 0, open: 337 },
    { name: 'Vila Emil', total: 30231, resolved: 29770, current: 98, previous: 99, signal: -1, open: 461 },
    { name: 'Vila Norma', total: 5000, resolved: 4900, current: 98, previous: 98, signal: 0, open: 100 },
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateData = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTotal = Number(formData.get('totalDemands'));
    const newReceived = Number(formData.get('receivedToday'));
    const newDate = formData.get('referenceDate') as string;
    
    setTotalDemands(newTotal);
    setReceivedToday(newReceived);
    setReferenceDate(newDate);

    const updatedSummary = summaryData.map(item => {
      const newValue = Number(formData.get(item.label));
      return {
        ...item,
        value: newValue,
        percentage: ((newValue / newTotal) * 100).toFixed(2).replace('.', ',') + '%'
      };
    });

    setSummaryData(updatedSummary);
    setActiveTab('daily');
  };

  const groupedMetaLabels = ['Resolvidas', 'Recusadas', 'Indeferidas'];
  const resolvidaIdx = summaryData.findIndex(i => i.label === 'Resolvidas');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-6 flex items-center gap-3 border-bottom border-slate-100">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-purple-900">COLAB</h1>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1">
          <button 
            onClick={() => setActiveTab('daily')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'daily' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Calendar size={18} />
            Dados Diários
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'weekly' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <TrendingUp size={18} />
            Planilha dos Bairros
          </button>
          {isLoggedIn && (
            <>
              <button 
                onClick={() => setActiveTab('input')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'input' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <PlusCircle size={18} />
                Inserir dados Diários
              </button>
              <button 
                onClick={() => setActiveTab('input-neighborhood')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'input-neighborhood' ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <PlusCircle size={18} />
                Inserir Dados Bairros
              </button>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-slate-100">
          {!isLoggedIn ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Lock size={16} />
                <span className="text-sm">Acesso Restrito</span>
              </div>
              <form onSubmit={handleLogin} className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input 
                  type="password" 
                  placeholder="Senha" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors">Entrar</button>
              </form>
            </div>
          ) : (
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 text-sm text-red-600 font-medium bg-red-50 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {activeTab === 'daily' ? 'Planilha Diária' : activeTab === 'weekly' ? 'Planilha dos Bairros' : activeTab === 'input-neighborhood' ? 'Inserir Dados Bairros' : 'Inserir dados Diários'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'daily' ? 'Visão geral das demandas recebidas hoje.' : activeTab === 'weekly' ? 'Desempenho por localidade.' : activeTab === 'input-neighborhood' ? 'Preencha os dados da planilha dos bairros.' : 'Atualize os números do sistema.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Data de Referência</p>
              <p className="text-sm font-bold text-slate-900">
                {referenceDate.split('-').reverse().join('/')}
              </p>
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'daily' ? (
              <motion.div 
                key="daily"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Novas Demandas" 
                    value={receivedToday.toLocaleString('pt-BR')} 
                    subValue={undefined}
                    icon={Inbox} 
                    colorClass="bg-orange-100 text-orange-600"
                  />
                  <StatCard 
                    title="Total de Demandas" 
                    value={totalDemands.toLocaleString('pt-BR')} 
                    subValue={undefined}
                    icon={LayoutDashboard} 
                    colorClass="bg-purple-100 text-purple-600"
                  />
                  <StatCard 
                    title="Resolvidas" 
                    value={summaryData.find(i => i.label === 'Resolvidas')?.value.toLocaleString('pt-BR')} 
                    subValue={undefined}
                    icon={CheckCircle2} 
                    colorClass="bg-green-100 text-green-600"
                    valueContainerClass="pt-2"
                  />
                  <StatCard 
                    title="Em Atendimento" 
                    value={(totalDemands - (summaryData.find(i => i.label === 'Resolvidas')?.value || 0)).toLocaleString('pt-BR')} 
                    subValue={undefined}
                    icon={Clock} 
                    colorClass="bg-blue-100 text-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Table Section */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Demandas</th>
                            <th className="px-6 py-4 font-semibold">%</th>
                            <th className="px-6 py-4 font-semibold">Meta</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {summaryData.map((item, idx) => {
                            const isGrouped = groupedMetaLabels.includes(item.label);
                            const isFirstInGroup = item.label === 'Resolvidas';
                            
                            return (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-3">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${item.color}`}>
                                    {item.label}
                                  </span>
                                </td>
                                <td className="px-6 py-3 font-mono text-sm">{item.value.toLocaleString('pt-BR')}</td>
                                <td className="px-6 py-3 text-sm font-medium">{item.percentage}</td>
                                {isGrouped ? (
                                  isFirstInGroup ? (
                                    <td rowSpan={3} className="px-6 py-3 text-sm font-bold text-slate-900 bg-slate-50/50 border-l border-slate-100 text-center align-middle">
                                      <div className="flex items-center justify-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        <span>{'>'}97%</span>
                                      </div>
                                    </td>
                                  ) : null
                                ) : (
                                  <td className="px-6 py-3 text-sm text-slate-400 text-center">
                                    {item.meta}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'weekly' ? (
              <motion.div 
                key="weekly"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  {/* Title moved to header */}
                  <div className="flex gap-2">
                  </div>
                </div>

                {/* Neighborhood Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-2 py-3 font-semibold whitespace-nowrap">Bairro</th>
                          <th className="px-2 py-3 font-semibold text-right">Total de Demandas</th>
                          <th className="px-2 py-3 font-semibold text-right">Demandas Resolvidas</th>
                          <th className="px-2 py-3 font-semibold text-right">Demandas em Atendimento</th>
                          <th className="px-2 py-3 font-semibold text-center">% Semana Atual</th>
                          <th className="px-2 py-3 font-semibold text-center">% Semana Anterior</th>
                          <th className="px-2 py-3 font-semibold text-center">Indicador</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {neighborhoodData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-2 py-3 font-medium text-slate-900 whitespace-nowrap">{item.name}</td>
                            <td className="px-2 py-3 text-right font-mono text-sm">{item.total.toLocaleString('pt-BR')}</td>
                            <td className="px-2 py-3 text-right font-mono text-sm text-green-600">{item.resolved.toLocaleString('pt-BR')}</td>
                            <td className="px-2 py-3 text-right">
                              <span className="text-sm font-bold text-slate-700">{item.open}</span>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <span className="text-sm font-bold">{item.current}%</span>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <span className="text-sm font-bold text-slate-500">{item.previous}%</span>
                            </td>
                            <td className="px-2 py-3 text-center">
                              {(() => {
                                const diff = item.previous - item.current;
                                if (diff === 0) {
                                  return (
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full">
                                      <Clock size={12} />
                                    </span>
                                  );
                                } else if (diff > 0) {
                                  return (
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                      <TrendingUp size={12} />
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full">
                                      <TrendingDown size={12} />
                                    </span>
                                  );
                                }
                              })()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex gap-6 mt-4 px-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-green-600"><TrendingUp size={10} /></div> Verde - Crescimento
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Clock size={10} /></div> Amarelo - Estável
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center text-red-600"><TrendingDown size={10} /></div> Vermelho - Piora
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'input-neighborhood' ? (
              <motion.div 
                key="input-neighborhood"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <form onSubmit={(e) => { e.preventDefault(); setActiveTab('weekly'); }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Inserir Dados Bairros</h3>
                    <button 
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                    >
                      Salvar Dados
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-4 py-3 font-semibold whitespace-nowrap">Bairro</th>
                          <th className="px-4 py-3 font-semibold text-right">Total de Demandas</th>
                          <th className="px-4 py-3 font-semibold text-right">Demandas Resolvidas</th>
                          <th className="px-4 py-3 font-semibold text-right">% Semana Anterior</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {neighborhoodData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{item.name}</td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number" 
                                defaultValue={item.total}
                                className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-sm text-right"
                                onChange={(e) => {
                                  const newData = [...neighborhoodData];
                                  newData[idx].total = Number(e.target.value);
                                  setNeighborhoodData(newData);
                                }}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number" 
                                defaultValue={item.resolved}
                                className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-sm text-right"
                                onChange={(e) => {
                                  const newData = [...neighborhoodData];
                                  newData[idx].resolved = Number(e.target.value);
                                  setNeighborhoodData(newData);
                                }}
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <input 
                                type="number" 
                                defaultValue={item.previous}
                                className="w-24 px-2 py-1 rounded-lg border border-slate-200 text-sm text-right"
                                onChange={(e) => {
                                  const newData = [...neighborhoodData];
                                  newData[idx].previous = Number(e.target.value);
                                  setNeighborhoodData(newData);
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto space-y-4"
              >
                <div>
                  {/* Title moved to header */}
                </div>

                <form onSubmit={handleUpdateData} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Data de Referência</label>
                      <input 
                        name="referenceDate"
                        type="date" 
                        defaultValue={referenceDate}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Total de Demandas</label>
                      <input 
                        name="totalDemands"
                        type="number" 
                        defaultValue={totalDemands}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Demandas Recebidas Hoje</label>
                      <input 
                        name="receivedToday"
                        type="number" 
                        defaultValue={receivedToday}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detalhamento por Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {summaryData.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">{item.label}</label>
                          <input 
                            name={item.label}
                            type="number" 
                            defaultValue={item.value}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                  >
                    <Save size={20} />
                    Salvar e Atualizar Dashboard
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
