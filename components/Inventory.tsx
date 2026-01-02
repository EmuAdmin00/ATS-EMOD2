
import React, { useMemo } from 'react';
import { Item, BranchOffice, Category } from '../types';

interface InventoryProps {
  items: Item[];
  offices: BranchOffice[];
  initialOfficeId?: string;
}

export const Inventory: React.FC<InventoryProps> = ({ items, offices, initialOfficeId = 'all' }) => {
  const groupedData = useMemo(() => {
    const filtered = initialOfficeId === 'all' 
      ? items 
      : items.filter(i => i.officeId === initialOfficeId);

    const groups: Record<Category, Item[]> = {
      'Raw Material': [],
      'Additive': [],
      'Finished Good': []
    };

    filtered.forEach(item => {
      groups[item.category].push(item);
    });

    return groups;
  }, [items, initialOfficeId]);

  const stats = useMemo(() => {
    const filtered = initialOfficeId === 'all' 
      ? items 
      : items.filter(i => i.officeId === initialOfficeId);
    
    return {
      count: filtered.length,
      low: filtered.filter(i => i.stock <= i.minStock).length,
      val: filtered.reduce((acc, curr) => acc + (curr.stock * curr.pricePerUnit), 0)
    };
  }, [items, initialOfficeId]);

  return (
    <div className="space-y-10">
      {/* Visual Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Inventory Management</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Overview Persediaan</h3>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Item</p>
                <p className="text-xl font-black text-slate-900">{stats.count}</p>
              </div>
           </div>
           <div className="bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alert Stok</p>
                <p className={`text-xl font-black ${stats.low > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{stats.low}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-12">
        {(Object.keys(groupedData) as Category[]).map(category => (
          <div key={category} className="space-y-5">
            <div className="flex items-center gap-4 px-2">
              <div className={`w-2 h-8 rounded-full ${
                category === 'Finished Good' ? 'bg-indigo-600' :
                category === 'Raw Material' ? 'bg-amber-500' : 'bg-slate-400'
              }`}></div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{category}</h3>
              <span className="text-[11px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                {groupedData[category].length} material
              </span>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Material Info</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Stock</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Safety Stock</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {groupedData[category].length > 0 ? groupedData[category].map((item) => {
                      const office = offices.find(o => o.id === item.officeId);
                      const isLow = item.stock <= item.minStock;
                      return (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.id}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                              {office?.city || 'Unassigned'}
                            </span>
                          </td>
                          <td className={`px-8 py-6 text-sm font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                            {item.stock.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase ml-1 font-bold">{item.unit}</span>
                          </td>
                          <td className="px-8 py-6 text-[11px] text-slate-500 font-bold">{item.minStock} {item.unit}</td>
                          <td className="px-8 py-6 text-right">
                             {isLow ? (
                               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-2xl border border-rose-100 animate-pulse">
                                 <div className="w-1.5 h-1.5 bg-rose-600 rounded-full"></div>
                                 REPLENISH
                               </div>
                             ) : (
                               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-2xl border border-emerald-100">
                                 <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                                 OPTIMAL
                               </div>
                             )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={5} className="px-8 py-16 text-center text-slate-300 font-bold italic text-sm">Belum ada material terdaftar.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
