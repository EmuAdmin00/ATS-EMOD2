
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

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyqx_mmbWFKJ1kzUo8tBLx3l2jBHAg-HCqidlkk9vFKehoznB4W3027Ahixadk6ICOq/exec';
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
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  
  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem('ats_sheet_url') || DEFAULT_SCRIPT_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const [selectedOfficeId, setSelectedOfficeId] = useState<string>('all');
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setActiveView(user.allowedViews[0] || 'Dashboard');
      setSelectedOfficeId(user.officeId);
    } else {
      setLoginError('Kredensial salah.');
    }
  };

  const handleSync = async (silent = false) => {
    if (!sheetUrl) return;
    if (!silent) setIsSyncing(true);
    try {
      const data = await googleSheetsService.fetchAllData(sheetUrl);
      if (data) {
        // Hanya update jika data dari cloud memiliki isi (tidak kosong)
        // Jika cloud kosong, kita pertahankan data INITIAL_ agar aplikasi tidak blank
        if (data.offices && data.offices.length > 0) setOffices(data.offices);
        if (data.tacs && data.tacs.length > 0) setTacs(data.tacs);
        if (data.positions && data.positions.length > 0) setPositions(data.positions);
        if (data.employees && data.employees.length > 0) setEmployees(data.employees);
        if (data.items && data.items.length > 0) setItems(data.items);
        if (data.users && data.users.length > 0) setUsers(data.users); 
        if (data.batches && data.batches.length > 0) setProductionBatches(data.batches);
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
      const interval = setInterval(() => handleSync(true), 120000); 
      return () => clearInterval(interval);
    }
  }, [sheetUrl, currentUser]);

  const handleInitializeCloud = async () => {
    setIsSyncing(true);
    try {
      await googleSheetsService.postData(sheetUrl, 'setup', {});
      alert("Spreadsheet berhasil diinisialisasi! Header tabel telah dibuat.");
      handleSync();
    } catch (err) {
      alert("Gagal inisialisasi: " + err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddMasterData = async (category: MasterSubView, data: any) => {
    const entry = { ...data, id: data.id || `${category.substring(0,3).toUpperCase()}-${Date.now()}` };
    if (category === 'Office') setOffices([...offices, entry]);
    if (category === 'TAC') setTacs([...tacs, entry]);
    if (category === 'Jabatan') setPositions([...positions, entry]);
    if (category === 'Pegawai') setEmployees([...employees, entry]);
    if (category === 'Bahan Baku' || category === 'Produk') setItems([...items, entry]);

    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addMasterData', { category, entry });
        setTimeout(() => handleSync(true), 2000);
      } catch (err) { handleSync(true); }
    }
  };

  const handleUpdateMasterData = async (category: MasterSubView, data: any) => {
    if (category === 'Office') setOffices(offices.map(o => o.id === data.id ? data : o));
    if (category === 'TAC') setTacs(tacs.map(t => t.id === data.id ? data : t));
    if (category === 'Jabatan') setPositions(positions.map(p => p.id === data.id ? data : p));
    if (category === 'Pegawai') setEmployees(employees.map(e => e.nik === data.nik ? data : e));
    if (category === 'Bahan Baku' || category === 'Produk') setItems(items.map(i => i.id === data.id ? data : i));

    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'editMasterData', { category, entry: data });
        setTimeout(() => handleSync(true), 3000);
      } catch (err) { handleSync(true); }
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
        setTimeout(() => handleSync(true), 4000);
      } catch (err) { handleSync(true); }
    }
  };

  const handleAddUser = async (user: User) => {
    setUsers([...users, user]);
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addUser', user);
        setTimeout(() => handleSync(true), 3000);
      } catch (err) { handleSync(true); }
    }
  };

  const handleUpdateUser = async (user: User) => {
    setUsers(users.map(u => u.id === user.id ? user : u));
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'editUser', user);
        setTimeout(() => handleSync(true), 3000);
      } catch (err) { handleSync(true); }
    }
  };

  const handleDeleteUser = async (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'deleteUser', { id });
        setTimeout(() => handleSync(true), 4000);
      } catch (err) { handleSync(true); }
    }
  };

  const handleAddProduction = async (batch: ProductionBatch) => {
    setProductionBatches([...productionBatches, batch]);
    if (sheetUrl) {
      try {
        await googleSheetsService.postData(sheetUrl, 'addProduction', batch);
        setTimeout(() => handleSync(true), 3000);
      } catch (err) { handleSync(true); }
    }
  };

  const NavItem: React.FC<{ view: View; icon: React.ReactNode }> = ({ view, icon }) => {
    if (!currentUser?.allowedViews.includes(view)) return null;
    return (
      <button 
        onClick={() => setActiveView(view)} 
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
          activeView === view ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {icon} <span className="font-bold">{view}</span>
      </button>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="bg-blue-600 p-8 text-center text-white">
            <h1 className="text-4xl font-black tracking-tighter mb-2">ATS-EMOD</h1>
            <p className="text-blue-100 font-bold text-xs uppercase tracking-widest">Login System</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {loginError && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold border border-rose-100 text-center">{loginError}</div>}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input type="password" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black shadow-xl shadow-blue-100 transition-all active:scale-95">MASUK</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter">ATS-EMOD</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Asphalt Trade System</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem view="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>} />
          <NavItem view="Master Data" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2"/></svg>} />
          <NavItem view="Inventory" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>} />
          <NavItem view="Production" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3"/></svg>} />
          <NavItem view="User Management" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z"/></svg>} />
          <NavItem view="System" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066"/></svg>} />
        </nav>
      </aside>

      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">{activeView}</h2>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <select 
              value={selectedOfficeId} 
              onChange={(e) => setSelectedOfficeId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">Semua Cabang</option>
              {offices.map(o => <option key={o.id} value={o.id}>{o.city}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleSync(false)}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black transition-all ${
                isSyncing ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {isSyncing ? 'SYNC...' : 'REFRESH'}
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{currentUser.role}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {currentUser.username.substring(0,2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {activeView === 'Dashboard' && <Dashboard items={items.filter(i => selectedOfficeId === 'all' || i.officeId === selectedOfficeId)} transactions={[]} />}
          {activeView === 'Master Data' && (
            <MasterData 
              offices={offices} tacs={tacs} positions={positions} employees={employees} items={items} 
              onAddData={handleAddMasterData} onUpdateData={handleUpdateMasterData} onDeleteData={handleDeleteMasterData} 
            />
          )}
          {activeView === 'Inventory' && <Inventory items={items} offices={offices} initialOfficeId={selectedOfficeId} />}
          {activeView === 'Production' && <Production items={items.filter(i => selectedOfficeId === 'all' || i.officeId === selectedOfficeId)} batches={productionBatches} onAddBatch={handleAddProduction} />}
          {activeView === 'User Management' && <UserManagement users={users} offices={offices} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />}
          {activeView === 'System' && <SystemSettings data={{ items, offices }} scriptUrl={sheetUrl} spreadsheetUrl={SPREADSHEET_LINK} lastSync={lastSync} onSetup={handleInitializeCloud} />}
        </div>
      </div>
    </div>
  );
};

export default App;
