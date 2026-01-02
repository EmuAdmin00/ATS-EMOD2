
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
    filtered.forEach(item => groups[item.category].push(item));
    return groups;
  }, [items, initialOfficeId]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">Inventory Ledger</p>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Posisi Persediaan</h3>
        </div>
      </div>

      <div className="space-y-14">
        {(Object.keys(groupedData) as Category[]).map(category => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className={`w-2 h-8 rounded-full ${
                category === 'Finished Good' ? 'bg-indigo-600' :
                category === 'Raw Material' ? 'bg-amber-500' : 'bg-slate-400'
              }`}></div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{category}s</h3>
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full uppercase tracking-widest">
                {groupedData[category].length} SKU
              </span>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-slate-50/40">
                  <tr className="border-b border-slate-100">
                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Material Info</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Stock</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {groupedData[category].length > 0 ? groupedData[category].map((item) => {
                    const isLow = item.stock <= item.minStock;
                    const office = offices.find(o => o.id === item.officeId);
                    return (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-7">
                          <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-all">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{item.id}</p>
                        </td>
                        <td className="px-10 py-7">
                           <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-xl uppercase tracking-widest">{office?.city || 'HQ'}</span>
                        </td>
                        <td className={`px-10 py-7 text-sm font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {item.stock.toLocaleString()} <span className="text-[10px] text-slate-400 ml-1 uppercase">{item.unit}</span>
                        </td>
                        <td className="px-10 py-7 text-right">
                           <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-[10px] font-black border ${isLow ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                              {isLow ? 'CRITICAL REPLENISH' : 'OPTIMAL STOCK'}
                           </div>
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan={4} className="px-10 py-16 text-center text-slate-300 font-bold italic">No data in this category</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
