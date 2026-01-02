
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
  const [activeView, setActiveView] = useState<View>('Dashboard');
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [offices, setOffices] = useState<BranchOffice[]>(INITIAL_OFFICES);
  const [tacs, setTacs] = useState<TACData[]>(INITIAL_TAC);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem('ats_sheet_url') || DEFAULT_SCRIPT_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('all');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    } catch (err) { console.error('Sync failed', err); }
    finally { if (!silent) setIsSyncing(false); }
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
        setTimeout(() => handleSync(true), 2000);
      } catch (err) { console.error("Cloud error", err); }
    }
  };

  const handleDeleteMasterData = async (category: MasterSubView, id: string) => {
    // 1. Optimistic UI update (Hapus di layar dulu biar cepat)
    if (category === 'Office') setOffices(offices.filter(o => o.id !== id));
    if (category === 'TAC') setTacs(tacs.filter(t => t.id !== id));
    if (category === 'Jabatan') setPositions(positions.filter(p => p.id !== id));
    if (category === 'Pegawai') setEmployees(employees.filter(e => e.nik !== id));
    if (category === 'Bahan Baku' || category === 'Produk') setItems(items.filter(i => i.id !== id));

    if (sheetUrl) {
      try {
        // 2. Kirim perintah hapus ke cloud
        await googleSheetsService.postData(sheetUrl, 'deleteMasterData', { category, id });
        
        // 3. JEDA 3.5 DETIK sebelum tarik data baru.
        // Google Sheets butuh waktu memproses penghapusan baris agar tidak terbaca lagi.
        setTimeout(() => handleSync(true), 3500);
      } catch (err) { 
        console.error("Delete failed", err);
        handleSync(true); // Re-sync jika gagal
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setActiveView(user.allowedViews[0] || 'Dashboard');
      setSelectedOfficeId(user.officeId);
    } else setLoginError('Invalid login.');
  };

  const NavItem: React.FC<{ view: View; icon: React.ReactNode }> = ({ view, icon }) => {
    if (!currentUser?.allowedViews.includes(view)) return null;
    return (
      <button 
        onClick={() => setActiveView(view)} 
        className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
          activeView === view 
            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/30' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        <span className={`${activeView === view ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`}>{icon}</span>
        <span className="font-bold text-sm tracking-tight">{view}</span>
      </button>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/10">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-12 text-center text-white">
            <h1 className="text-5xl font-black tracking-tighter mb-2">ATS<span className="text-indigo-300">.</span>EMOD</h1>
            <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80">Asphalt Trade Portal</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {loginError && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 text-center">{loginError}</div>}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Username</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} placeholder="Admin" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
              <input type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black shadow-2xl shadow-indigo-200 transition-all active:scale-[0.97] uppercase tracking-widest text-xs">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-['Inter']">
      {/* Fixed Sidebar */}
      <aside className="w-72 bg-slate-900 flex flex-col fixed inset-y-0 z-50">
        <div className="p-10">
          <h1 className="text-3xl font-black text-white tracking-tighter">ATS<span className="text-indigo-500">.</span>EMOD</h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Live Cloud Data</span>
          </div>
        </div>
        
        <nav className="flex-1 px-5 space-y-2 overflow-y-auto scrollbar-hide">
          <NavItem view="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"/></svg>} />
          <NavItem view="Inventory" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>} />
          <NavItem view="Production" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3"/></svg>} />
          <div className="h-px bg-slate-800 my-6 mx-4 opacity-50"></div>
          <NavItem view="Master Data" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2"/></svg>} />
          <NavItem view="User Management" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/></svg>} />
          <NavItem view="System" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066"/></svg>} />
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 ml-72 min-h-screen flex flex-col">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-24 px-12 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-10">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">{activeView}</h2>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-4 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Area Kerja:</span>
               <select 
                value={selectedOfficeId} 
                onChange={(e) => setSelectedOfficeId(e.target.value)}
                className="bg-white border-none rounded-xl px-5 py-2.5 text-xs font-black text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
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
             <button 
                onClick={() => handleSync(false)}
                disabled={isSyncing}
                className={`p-3.5 rounded-2xl transition-all ${
                  isSyncing ? 'bg-slate-50 text-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl'
                }`}
              >
                <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-4 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{currentUser.fullName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{currentUser.role}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-indigo-200 group-active:scale-95 transition-all">
                  {currentUser.username.substring(0,2).toUpperCase()}
                </div>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-4 w-60 bg-white border border-slate-200 rounded-[2rem] shadow-2xl py-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="px-7 py-3 border-b border-slate-50 mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Access</p>
                  </div>
                  <button onClick={() => setCurrentUser(null)} className="w-full text-left px-7 py-4 text-sm text-rose-600 hover:bg-rose-50 font-black flex items-center gap-3 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
                    Logout System
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-12 flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            {activeView === 'Dashboard' && <Dashboard items={items.filter(i => selectedOfficeId === 'all' || i.officeId === selectedOfficeId)} transactions={[]} />}
            {activeView === 'Inventory' && <Inventory items={items} offices={offices} initialOfficeId={selectedOfficeId} />}
            {activeView === 'Production' && <Production items={items.filter(i => selectedOfficeId === 'all' || i.officeId === selectedOfficeId)} batches={productionBatches} onAddBatch={() => {}} />}
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
