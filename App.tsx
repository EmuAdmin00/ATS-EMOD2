
import React, { useState, useEffect, useRef } from 'react';
import { View, Item, Transaction, ProductionBatch, BranchOffice, TACData, Position, Employee, MasterSubView, User } from './types';
import { INITIAL_ITEMS, INITIAL_OFFICES, INITIAL_TAC, INITIAL_POSITIONS, INITIAL_EMPLOYEES, INITIAL_USERS } from './constants';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Production } from './components/Production';
import { MasterData } from './components/MasterData';
import { SystemSettings } from './components/SystemSettings';
import { UserManagement } from './components/UserManagement';
import { getProductionInsights } from './services/geminiService';
import { googleSheetsService } from './services/googleSheetsService';

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTCJgJPXBnYVaAdRjIBo6sgLMItcye1bx0qXF8Q6O0PJnLPsIuh__gAGGf5Dm472fu/exec';
const SPREADSHEET_LINK = 'https://docs.google.com/spreadsheets/d/1NWJ8BY5U1fzuBsuIjWQ_mtZpK0KRIaJdW6axDpy6FR4/edit';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // App States
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

  // Global UI States
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('all');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const pollInterval = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setActiveView(user.allowedViews[0] || 'Dashboard');
      setSelectedOfficeId(user.officeId);
      setLoginError('');
    } else {
      setLoginError('Username atau Password salah.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
  };

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
        if (data.users) setUsers(data.users); 
        if (data.batches) setProductionBatches(data.batches);
        setLastSync(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Auto-sync failed', err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (sheetUrl && autoSyncEnabled && currentUser) {
      handleSync();
      pollInterval.current = window.setInterval(() => handleSync(true), 30000); 
    }
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [sheetUrl, autoSyncEnabled, currentUser]);

  const handleAddMasterData = async (category: MasterSubView, data: any) => {
    const newId = `${category.substring(0,3).toUpperCase()}-${Date.now()}`;
    const entry = { ...data, id: data.id || newId };
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addMasterData', { category, entry });
        setTimeout(() => handleSync(true), 1500);
      } catch (err) { console.error("Cloud error", err); }
    }
  };

  const handleUpdateMasterData = async (category: MasterSubView, data: any) => {
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'editMasterData', { category, entry: data });
        setTimeout(() => handleSync(true), 1500);
      } catch (err) { console.error("Update error", err); }
    }
  };

  const handleDeleteMasterData = async (category: MasterSubView, id: string) => {
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'deleteMasterData', { category, id });
        // Optimistic UI update
        if (category === 'Office') setOffices(offices.filter(o => o.id !== id));
        if (category === 'TAC') setTacs(tacs.filter(t => t.id !== id));
        if (category === 'Jabatan') setPositions(positions.filter(p => p.id !== id));
        if (category === 'Pegawai') setEmployees(employees.filter(e => e.nik !== id));
        if (category === 'Bahan Baku' || category === 'Produk') setItems(items.filter(i => i.id !== id));
        
        setTimeout(() => handleSync(true), 1500);
      } catch (err) { console.error("Delete error", err); }
    }
  };

  const handleAddUser = async (user: User) => {
    setUsers([...users, user]);
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addUser', user);
        setTimeout(() => handleSync(true), 1500);
      } catch (err) { console.error("Add user failed", err); }
    }
  };

  const handleUpdateUser = async (user: User) => {
    setUsers(users.map(u => u.id === user.id ? user : u));
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'editUser', user);
        setTimeout(() => handleSync(true), 1500);
      } catch (err) { console.error("Update user failed", err); }
    }
  };

  const handleDeleteUser = async (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'deleteUser', { id });
        setTimeout(() => handleSync(true), 1500);
      } catch (err) { console.error("Delete user failed", err); }
    }
  };

  const handleAddProduction = async (batch: ProductionBatch) => {
    setProductionBatches([batch, ...productionBatches]);
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addProduction', batch);
        setTimeout(() => handleSync(true), 2000);
      } catch (err) { console.error("Production save failed", err); }
    }
  };

  const filteredItems = selectedOfficeId === 'all' 
    ? items 
    : items.filter(i => i.officeId === selectedOfficeId);

  const permittedViews = currentUser?.allowedViews || [];

  const NavItem: React.FC<{ view: View; icon: React.ReactNode }> = ({ view, icon }) => {
    if (!permittedViews.includes(view)) return null;
    return (
      <button onClick={() => setActiveView(view)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeView === view ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
        {icon} <span className="font-medium">{view}</span>
      </button>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-blue-600 p-8 text-center text-white">
            <h1 className="text-4xl font-black tracking-tighter mb-2">ATS-EMOD</h1>
            <p className="text-blue-100 font-bold text-xs uppercase tracking-widest">Asphalt Trade System Login</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {loginError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-sm font-bold text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input 
                type="text" required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                placeholder="Masukkan username..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" required 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95">
              MASUK KE SISTEM
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tight">Admin Default: Admin / kerjaibadah</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter">ATS-EMOD</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Asphalt Trade System</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem view="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} />
          <NavItem view="Master Data" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>} />
          <NavItem view="Inventory" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>} />
          <NavItem view="Production" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} />
          <NavItem view="User Management" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} />
          <NavItem view="Insights" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>} />
          <NavItem view="System" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-800">{activeView}</h2>
            {(currentUser.officeId === 'all' || currentUser.role === 'Super Admin') && (
               <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Area Kerja:</label>
                  <select 
                    value={selectedOfficeId} 
                    onChange={(e) => setSelectedOfficeId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Seluruh Indonesia</option>
                    {offices.map(o => <option key={o.id} value={o.id}>{o.city}</option>)}
                  </select>
               </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Fitur Refresh Manual */}
            <div className="flex flex-col items-end mr-2">
               <button 
                onClick={() => handleSync(false)}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all shadow-sm ${
                  isSyncing 
                  ? 'bg-slate-50 text-slate-400 border-slate-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:shadow-md active:scale-95'
                }`}
              >
                <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isSyncing ? 'SYNCING...' : 'REFRESH'}
              </button>
              {lastSync && (
                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Last update: {lastSync}</span>
              )}
            </div>

            <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{currentUser.role}</p>
              </div>
              
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold border-2 border-transparent hover:border-blue-200 transition-all overflow-hidden"
                >
                  <span className="text-sm">{currentUser.username.substring(0, 2).toUpperCase()}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-2 animate-in fade-in zoom-in duration-150">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">Profil</button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">Ubah Password</button>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          {activeView === 'Dashboard' && <Dashboard items={filteredItems} transactions={transactions} />}
          {activeView === 'Master Data' && (
            <MasterData 
              offices={offices} 
              tacs={tacs} 
              positions={positions} 
              employees={employees} 
              items={items} 
              onAddData={handleAddMasterData} 
              onUpdateData={handleUpdateMasterData} 
              onDeleteData={handleDeleteMasterData}
            />
          )}
          {activeView === 'Inventory' && <Inventory items={items} offices={offices} initialOfficeId={selectedOfficeId} />}
          {activeView === 'Production' && <Production items={filteredItems} batches={productionBatches} onAddBatch={handleAddProduction} />}
          {activeView === 'User Management' && <UserManagement users={users} offices={offices} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />}
          {activeView === 'Insights' && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
               <h2 className="text-2xl font-bold mb-4">Gemini Smart Insights</h2>
               <div className="prose prose-slate max-w-none min-h-[300px]">{aiInsight ? <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} /> : <p className="text-slate-400">Pilih Cabang dan klik Refresh di tab System untuk data baru.</p>}</div>
            </div>
          )}
          {activeView === 'System' && <SystemSettings data={{ items, offices, users, batches: productionBatches }} scriptUrl={sheetUrl} spreadsheetUrl={SPREADSHEET_LINK} lastSync={lastSync} />}
        </div>
      </main>
    </div>
  );
};

export default App;
