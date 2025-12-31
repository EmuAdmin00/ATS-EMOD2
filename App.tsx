
import React, { useState, useEffect, useRef } from 'react';
import { View, Item, Transaction, ProductionBatch, BranchOffice, TACData, Position, Employee } from './types';
import { INITIAL_ITEMS, INITIAL_OFFICES, INITIAL_TAC, INITIAL_POSITIONS, INITIAL_EMPLOYEES } from './constants';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Production } from './components/Production';
import { MasterData } from './components/MasterData';
import { getProductionInsights } from './services/geminiService';
import { googleSheetsService } from './services/googleSheetsService';

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxZea2zG9PdqFM4VQ1j6XNMIsRcSW3ngxTIP0HOs5coEcTHI7d6x0PR-oUsaPDzZYC8/exec';
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
  
  // Google Sheets Integration State - Using provided URL as default
  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem('ats_sheet_url') || DEFAULT_SCRIPT_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  // Interval Ref to clear on unmount
  const pollInterval = useRef<number | null>(null);

  const handleSync = async (silent = false) => {
    if (!sheetUrl) return;
    if (!silent) setIsSyncing(true);
    
    try {
      const data = await googleSheetsService.fetchAllData(sheetUrl);
      if (data) {
        // Only update if there are changes to prevent unnecessary re-renders
        if (JSON.stringify(data.items) !== JSON.stringify(items)) setItems(data.items);
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

  // Logic for Auto Polling
  useEffect(() => {
    if (sheetUrl && autoSyncEnabled) {
      handleSync(); // Initial Sync
      
      pollInterval.current = window.setInterval(() => {
        handleSync(true); // silent background sync
      }, 30000); 
    }

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [sheetUrl, autoSyncEnabled]);

  const handleAddProduction = async (batch: ProductionBatch) => {
    // 1. Optimistic UI update
    setItems(prev => prev.map(item => {
      if (item.id === batch.productId) {
        return { ...item, stock: item.stock + batch.outputQuantity };
      }
      return item;
    }));
    setProductionBatches(prev => [batch, ...prev]);

    // 2. Push to Google Sheets
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addProduction', batch);
        setTimeout(() => handleSync(true), 2000);
      } catch (err) {
        console.error("Cloud push failed", err);
      }
    }
  };

  const saveSheetUrl = (url: string) => {
    setSheetUrl(url);
    localStorage.setItem('ats_sheet_url', url);
  };

  const fetchInsights = async () => {
    setIsLoadingInsight(true);
    const insight = await getProductionInsights(items, productionBatches);
    setAiInsight(insight || "No response from AI.");
    setIsLoadingInsight(false);
  };

  const NavItem: React.FC<{ view: View; icon: React.ReactNode }> = ({ view, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        activeView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium">{view}</span>
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
        </nav>

        <div className="p-4 bg-slate-100 m-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cloud Sync</span>
            <div className={`w-2 h-2 rounded-full ${sheetUrl ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-300'}`}></div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <input 
              type="checkbox" 
              id="autoSync" 
              checked={autoSyncEnabled} 
              onChange={(e) => setAutoSyncEnabled(e.target.checked)}
              className="rounded text-blue-600"
            />
            <label htmlFor="autoSync" className="text-[10px] font-medium text-slate-600 cursor-pointer">Auto-polling (30s)</label>
          </div>
          <button 
            onClick={() => handleSync()}
            disabled={isSyncing || !sheetUrl}
            className="w-full bg-white border border-slate-200 text-slate-700 text-xs py-2 rounded-lg font-bold shadow-sm hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          {lastSync && <p className="text-[10px] text-slate-400 text-center">Last updated: {lastSync}</p>}
        </div>

        <div className="p-4 bg-slate-900 m-4 rounded-xl">
          <p className="text-slate-400 text-xs mb-2 uppercase font-bold tracking-widest">Operator</p>
          <p className="text-white text-sm font-medium">Asphalt Head Plant</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">{activeView}</h2>
          <div className="flex items-center space-x-4">
             <div className="relative">
                <input type="text" placeholder="Search data..." className="bg-slate-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 w-64" />
             </div>
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
               AP
             </div>
          </div>
        </header>

        <div className="p-8">
          {activeView === 'Dashboard' && <Dashboard items={items} transactions={transactions} />}
          {activeView === 'Master Data' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cloud Connector Settings</h3>
                    <p className="text-xs text-slate-400 mt-1">Status: {sheetUrl ? 'Connected to ATS Cloud' : 'Disconnected'}</p>
                  </div>
                  <a 
                    href={SPREADSHEET_LINK} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2zM19 19H5V5h8v4h6v10zM7 8h5v2H7V8zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/></svg>
                    Open Spreadsheet
                  </a>
                </div>
                
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Masukkan Google Apps Script Web App URL..." 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                    value={sheetUrl}
                    onChange={(e) => saveSheetUrl(e.target.value)}
                  />
                  <button onClick={() => handleSync()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap">Test Connection</button>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                   <h4 className="text-xs font-bold text-blue-800 uppercase mb-1">Mekanisme Sinkronisasi</h4>
                   <p className="text-[11px] text-blue-700 leading-relaxed">Aplikasi ini secara otomatis terhubung ke Spreadsheet Anda. Polling aktif setiap 30 detik untuk memastikan data di semua perangkat tetap sama (Real-time). Jika Anda melakukan perubahan manual di Spreadsheet, perubahan tersebut akan muncul di sini secara otomatis.</p>
                </div>
              </div>
              <MasterData 
                offices={offices}
                tacs={tacs}
                positions={positions}
                employees={employees}
                items={items}
              />
            </div>
          )}
          {activeView === 'Inventory' && <Inventory items={items} />}
          {activeView === 'Production' && <Production items={items} batches={productionBatches} onAddBatch={handleAddProduction} />}
          {activeView === 'Insights' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold">Gemini Smart Insights</h2>
                 <button 
                  onClick={fetchInsights}
                  disabled={isLoadingInsight}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                 >
                   {isLoadingInsight ? 'Analyzing...' : 'Refresh AI Analysis'}
                 </button>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                {aiInsight ? (
                  <div className="prose prose-slate max-w-none">
                     <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                    <svg className="w-16 h-16 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    <p>Click the button above to generate AI-powered production and inventory insights.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {(activeView === 'Purchasing' || activeView === 'Sales') && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 text-lg">Modular component under construction.</p>
               <p className="text-slate-300 text-sm mt-2">Integrating external financial API hooks...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
