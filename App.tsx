
import React, { useState, useEffect, useRef } from 'react';
import { View, Item, Transaction, ProductionBatch, BranchOffice, TACData, Position, Employee, MasterSubView } from './types';
import { INITIAL_ITEMS, INITIAL_OFFICES, INITIAL_TAC, INITIAL_POSITIONS, INITIAL_EMPLOYEES } from './constants';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Production } from './components/Production';
import { MasterData } from './components/MasterData';
import { SystemSettings } from './components/SystemSettings';
import { getProductionInsights } from './services/geminiService';
import { googleSheetsService } from './services/googleSheetsService';

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTCJgJPXBnYVaAdRjIBo6sgLMItcye1bx0qXF8Q6O0PJnLPsIuh__gAGGf5Dm472fu/exec';
const SPREADSHEET_LINK = 'https://docs.google.com/spreadsheets/d/1NWJ8BY5U1fzuBsuIjWQ_mtZpK0KRIaJdW6axDpy6FR4/edit';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [offices, setOffices] = useState<BranchOffice[]>(INITIAL_OFFICES);
  const [tacs, setTacs] = useState<TACData[]>(INITIAL_TAC);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  
  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem('ats_sheet_url') || DEFAULT_SCRIPT_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const pollInterval = useRef<number | null>(null);

  const handleSync = async (silent = false) => {
    if (!sheetUrl) return;
    if (!silent) setIsSyncing(true);
    
    try {
      const data = await googleSheetsService.fetchAllData(sheetUrl);
      if (data) {
        if (data.items) setItems(data.items);
        if (data.offices) setOffices(data.offices);
        if (data.tacs) setTacs(data.tacs);
        if (data.positions) setPositions(data.positions);
        if (data.employees) setEmployees(data.employees);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Auto-sync failed', err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (sheetUrl && autoSyncEnabled) {
      handleSync();
      pollInterval.current = window.setInterval(() => handleSync(true), 30000); 
    }
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [sheetUrl, autoSyncEnabled]);

  const handleAddMasterData = async (category: MasterSubView, data: any) => {
    const newId = `${category.substring(0,3).toUpperCase()}-${Date.now()}`;
    const entry = { ...data, id: data.id || newId };

    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addMasterData', { category, entry });
        setTimeout(() => handleSync(true), 3000);
      } catch (err) {
        console.error("Master data cloud push failed", err);
      }
    }
  };

  const handleUpdateMasterData = async (category: MasterSubView, data: any) => {
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'editMasterData', { category, entry: data });
        setTimeout(() => handleSync(true), 3000);
      } catch (err) {
        console.error("Master data update failed", err);
      }
    }
  };

  const handleAddProduction = async (batch: ProductionBatch) => {
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addProduction', batch);
        setTimeout(() => handleSync(true), 2000);
      } catch (err) { console.error("Cloud push failed", err); }
    }
  };

  const fetchInsights = async () => {
    setIsLoadingInsight(true);
    const insight = await getProductionInsights(items, productionBatches);
    setAiInsight(insight || "No response from AI.");
    setIsLoadingInsight(false);
  };

  const NavItem: React.FC<{ view: View; icon: React.ReactNode }> = ({ view, icon }) => (
    <button onClick={() => setActiveView(view)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeView === view ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
      {icon} <span className="font-medium">{view}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter">ATS-EMOD</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Asphalt Trade System</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem view="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} />
          <NavItem view="Master Data" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>} />
          <NavItem view="Inventory" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>} />
          <NavItem view="Production" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} />
          <NavItem view="Insights" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} />
          <NavItem view="System" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
        </nav>
        <div className="p-4 bg-slate-100 m-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cloud Sync</span><div className={`w-2 h-2 rounded-full ${sheetUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div></div>
          <button onClick={() => handleSync()} disabled={isSyncing || !sheetUrl} className="w-full bg-white border border-slate-200 text-slate-700 text-xs py-2 rounded-lg font-bold shadow-sm hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2">
            <svg className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          {lastSync && <p className="text-[10px] text-slate-400 text-center">Last: {lastSync}</p>}
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">{activeView}</h2>
        </header>
        <div className="p-8">
          {activeView === 'Dashboard' && <Dashboard items={items} transactions={transactions} />}
          {activeView === 'Master Data' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div><h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Cloud Integration</h3><p className="text-xs text-slate-400">Tersambung ke Spreadsheet melalui Apps Script.</p></div>
                <a href={SPREADSHEET_LINK} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/></svg>Buka Spreadsheet</a>
              </div>
              <MasterData offices={offices} tacs={tacs} positions={positions} employees={employees} items={items} onAddData={handleAddMasterData} onUpdateData={handleUpdateMasterData} />
            </div>
          )}
          {activeView === 'Inventory' && <Inventory items={items} offices={offices} />}
          {activeView === 'Production' && <Production items={items} batches={productionBatches} onAddBatch={handleAddProduction} />}
          {activeView === 'Insights' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Gemini Smart Insights</h2><button onClick={fetchInsights} disabled={isLoadingInsight} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">{isLoadingInsight ? 'Analyzing...' : 'Refresh AI Analysis'}</button></div>
              <div className="prose prose-slate max-w-none min-h-[300px]">{aiInsight ? <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} /> : <p className="text-slate-400 text-center py-20">Klik tombol Refresh untuk analisis AI.</p>}</div>
            </div>
          )}
          {activeView === 'System' && (
            <SystemSettings 
              data={{ items, offices, tacs, positions, employees }}
              scriptUrl={sheetUrl}
              spreadsheetUrl={SPREADSHEET_LINK}
              lastSync={lastSync}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
