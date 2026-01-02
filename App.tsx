
import React, { useState, useEffect, useRef } from 'react';
import { View, Item, Transaction, ProductionBatch, BranchOffice, TACData, Position, Employee, MasterSubView, User } from './types';
import { INITIAL_ITEMS, INITIAL_OFFICES, INITIAL_TAC, INITIAL_POSITIONS, INITIAL_EMPLOYEES, INITIAL_USERS } from './constants';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Production } from './components/Production';
import { MasterData } from './components/MasterData';
import { SystemSettings } from './components/SystemSettings';
import { UserManagement } from './components/UserManagement';
import { googleSheetsService } from './services/googleSheetsService';

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyTCJgJPXBnYVaAdRjIBo6sgLMItcye1bx0qXF8Q6O0PJnLPsIuh__gAGGf5Dm472fu/exec';
const SPREADSHEET_LINK = 'https://docs.google.com/spreadsheets/d/1NWJ8BY5U1fzuBsuIjWQ_mtZpK0KRIaJdW6axDpy6FR4/edit';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

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

  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('all');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
    } else {
      setLoginError('Username atau Password salah.');
    }
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
      console.error('Sync failed', err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (sheetUrl && currentUser) {
      handleSync();
      const interval = setInterval(() => handleSync(true), 60000);
      return () => clearInterval(interval);
    }
  }, [sheetUrl, currentUser]);

  const handleAddMasterData = async (category: MasterSubView, data: any) => {
    const entry = { ...data, id: data.id || `${category.substring(0,3).toUpperCase()}-${Date.now()}` };
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addMasterData', { category, entry });
        setTimeout(() => handleSync(true), 1500);
      } catch (err) { console.error("Cloud error", err); }
    }
  };

  const handleDeleteMasterData = async (category: MasterSubView, id: string) => {
    if (category === 'Office') setOffices(offices.filter(o => o.id !== id));
    if (category === 'TAC') setTacs(tacs.filter(t => t.id !== id));
    if (category === 'Jabatan') setPositions(positions.filter(p => p.id !== id));
    if (category === 'Pegawai') setEmployees(employees.filter(e => e.nik !== id));
    if (category === 'Bahan Baku' || category === 'Produk') setItems(items.filter(i => i.id !== id));

    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'deleteMasterData', { category, id });
        setTimeout(() => handleSync(true), 3500);
      } catch (err) { console.error("Delete error", err); }
    }
  };

  const filteredItems = selectedOfficeId === 'all' 
    ? items 
    : items.filter(i => i.officeId === selectedOfficeId);

  const NavItem: React.FC<{ view: View; icon: React.ReactNode }> = ({ view, icon }) => {
    const isPermitted = currentUser?.allowedViews.includes(view);
    if (!isPermitted) return null;

    return (
      <button 
        onClick={() => setActiveView(view)} 
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          activeView === view 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <span className={`${activeView === view ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>{icon}</span>
        <span className="font-semibold text-sm">{view}</span>
      </button>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 text-center text-white">
            <h1 className="text-5xl font-black tracking-tighter mb-2">ATS-EMOD</h1>
            <p className="text-indigo-100 font-bold text-xs uppercase tracking-[0.2em] opacity-80">Asphalt Trade System</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {loginError && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold text-center border border-rose-100">{loginError}</div>}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="Admin" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] text-sm uppercase tracking-widest">Login to Portal</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 flex flex-col fixed inset-y-0 z-50">
        <div className="p-8">
          <h1 className="text-3xl font-black text-white tracking-tighter">ATS<span className="text-indigo-500">.</span>EMOD</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Online</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Core Operations</div>
          <NavItem view="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} />
          <NavItem view="Inventory" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>} />
          <NavItem view="Production" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>} />
          
          <div className="px-4 py-2 mt-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Data & System</div>
          <NavItem view="Master Data" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>} />
          <NavItem view="User Management" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>} />
          <NavItem view="System" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>} />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 px-10 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{activeView}</h2>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Area:</span>
               <select 
                value={selectedOfficeId} 
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className="bg-slate-100 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              >
                <option value="all">🌏 Seluruh Indonesia</option>
                {offices.map(o => (
                  <option key={o.id} value={o.id} disabled={o.city.includes('Planned')}>
                    {o.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <button 
                onClick={() => handleSync(false)}
                disabled={isSyncing}
                className={`p-2.5 rounded-xl transition-all ${
                  isSyncing ? 'bg-slate-100 text-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-sm'
                }`}
              >
                <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
              {lastSync && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Updated: {lastSync}</span>}
            </div>

            <div className="relative group" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-800 leading-none">{currentUser.fullName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{currentUser.role}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">
                  {currentUser.username.substring(0,2).toUpperCase()}
                </div>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-3xl shadow-2xl py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-6 py-2 border-b border-slate-50 mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Settings</p>
                  </div>
                  <button className="w-full text-left px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium">Profile Details</button>
                  <button className="w-full text-left px-6 py-2.5 text-sm text-slate-600 hover:bg-slate-50 font-medium">Security</button>
                  <div className="h-px bg-slate-100 my-2"></div>
                  <button onClick={() => setCurrentUser(null)} className="w-full text-left px-6 py-3 text-sm text-rose-600 hover:bg-rose-50 font-black flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-10 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeView === 'Dashboard' && <Dashboard items={filteredItems} transactions={transactions} />}
            {activeView === 'Inventory' && <Inventory items={items} offices={offices} initialOfficeId={selectedOfficeId} />}
            {activeView === 'Production' && <Production items={filteredItems} batches={productionBatches} onAddBatch={(b) => setProductionBatches([b, ...productionBatches])} />}
            {activeView === 'Master Data' && (
              <MasterData 
                offices={offices} tacs={tacs} positions={positions} employees={employees} items={items} 
                onAddData={handleAddMasterData} onUpdateData={() => {}} onDeleteData={handleDeleteMasterData} 
              />
            )}
            {activeView === 'User Management' && <UserManagement users={users} offices={offices} onAddUser={() => {}} onUpdateUser={() => {}} onDeleteUser={() => {}} />}
            {activeView === 'System' && <SystemSettings data={{ items, offices }} scriptUrl={sheetUrl} spreadsheetUrl={SPREADSHEET_LINK} lastSync={lastSync} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
