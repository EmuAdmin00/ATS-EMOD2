
import React, { useState } from 'react';
import { BranchOffice, TACData, Position, Employee, Item, MasterSubView } from '../types';

interface MasterDataProps {
  offices: BranchOffice[];
  tacs: TACData[];
  positions: Position[];
  employees: Employee[];
  items: Item[];
  onAddData: (category: MasterSubView, data: any) => void;
  onUpdateData: (category: MasterSubView, data: any) => void;
  onDeleteData: (category: MasterSubView, id: string) => void;
}

export const MasterData: React.FC<MasterDataProps> = ({ offices, tacs, positions, employees, items, onAddData, onDeleteData }) => {
  const [activeTab, setActiveTab] = useState<MasterSubView>('Office');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const menuItems: { id: MasterSubView; label: string; icon: React.ReactNode }[] = [
    { id: 'Office', label: 'Branches', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg> },
    { id: 'TAC', label: 'TAC Area', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    { id: 'Jabatan', label: 'Positions', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
    { id: 'Pegawai', label: 'Employees', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg> },
    { id: 'Bahan Baku', label: 'Materials', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddData(activeTab, formData);
    setIsAdding(false);
    setFormData({});
  };

  const currentData = () => {
    switch(activeTab) {
      case 'Office': return offices.map(o => ({ id: o.id, main: o.officeName, sub: o.city }));
      case 'TAC': return tacs.map(t => ({ id: t.id, main: t.name, sub: t.address }));
      case 'Jabatan': return positions.map(p => ({ id: p.id, main: p.name, sub: 'ID: ' + p.id }));
      case 'Pegawai': return employees.map(e => ({ id: e.nik, main: e.name, sub: e.nik + ' • ' + e.status }));
      case 'Bahan Baku': return items.filter(i => i.category === 'Raw Material' || i.category === 'Additive').map(i => ({ id: i.id, main: i.name, sub: i.stock + ' ' + i.unit }));
      default: return [];
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <aside className="w-full lg:w-72">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-5 sticky top-36">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-6 py-4">Data Repository</p>
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsAdding(false); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1">
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[650px]">
          <div className="px-12 py-10 bg-slate-50/40 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">{activeTab} List</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">Manage master records for operations</p>
            </div>
            {!isAdding && (
              <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-xl shadow-indigo-100 flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                Create New
              </button>
            )}
          </div>

          <div className="flex-1 overflow-x-auto scrollbar-hide">
             {isAdding ? (
               <form onSubmit={handleSubmit} className="p-12 space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">Record Name / Title</label>
                        <input required className="w-full bg-white border border-slate-200 rounded-2xl px-7 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formData.name || formData.officeName || ''} onChange={e => setFormData({...formData, [activeTab === 'Office' ? 'officeName' : 'name']: e.target.value})} placeholder="Type name here..." />
                    </div>
                  </div>
                  <div className="flex gap-4">
                     <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Save Changes</button>
                     <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-10 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">Cancel</button>
                  </div>
               </form>
             ) : (
               <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-12 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identification</th>
                    <th className="px-12 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-12 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentData().map(item => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-12 py-8">
                        <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.main}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest">ID: {item.id}</p>
                      </td>
                      <td className="px-12 py-8">
                        <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest">
                          {item.sub}
                        </span>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <button 
                          onClick={() => {
                            if(window.confirm('Hapus data ini secara permanen dari Spreadsheet?')) {
                              onDeleteData(activeTab, item.id);
                            }
                          }} 
                          className="text-[10px] font-black text-rose-500 hover:text-white hover:bg-rose-500 px-6 py-3 rounded-xl transition-all border border-rose-100 hover:border-rose-500 uppercase tracking-widest"
                        >
                          Delete Permanent
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentData().length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-12 py-20 text-center text-slate-300 font-bold italic text-sm">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
