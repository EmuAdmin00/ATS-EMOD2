
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Item, Transaction } from '../types';

interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ items, transactions }) => {
  const stockLevels = useMemo(() => {
    return items.filter(i => i.category === 'Finished Good').slice(0, 6).map(item => ({
      name: item.name,
      stock: item.stock
    }));
  }, [items]);

  const totalValue = items.reduce((acc, curr) => acc + (curr.stock * curr.pricePerUnit), 0);
  const criticalCount = items.filter(i => i.stock <= i.minStock).length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 flex flex-col justify-between h-56">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Total Asset Value</p>
          <p className="text-3xl font-black tracking-tighter">Rp {totalValue.toLocaleString()}</p>
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between h-56">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Master Item</p>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">{items.length}</p>
          <span className="text-[10px] text-slate-400 font-bold uppercase">SKU Terdaftar</span>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between h-56">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Production</p>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">0</p>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Ongoing Today</span>
        </div>

        <div className={`p-10 rounded-[2.5rem] shadow-sm border flex flex-col justify-between h-56 transition-all ${criticalCount > 0 ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-200'}`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${criticalCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>Critical Stock</p>
          <p className={`text-4xl font-black tracking-tighter ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{criticalCount}</p>
          <span className={`text-[10px] font-bold uppercase ${criticalCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>Items Need Restock</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Stock Level Finished Goods (MT)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockLevels}>
                <CartesianGrid strokeDasharray="8 8" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', padding: '15px'}}
                />
                <Bar dataKey="stock" fill="#4f46e5" radius={[12, 12, 12, 12]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
           </div>
           <h3 className="text-xl font-black text-slate-800 mb-2">Smart Inventory Analysis</h3>
           <p className="text-sm text-slate-400 font-medium max-w-sm">Gunakan fitur 'Insights' untuk mendapatkan analisis otomatis berbasis AI (Gemini) untuk perencanaan produksi Anda.</p>
        </div>
      </div>
    </div>
  );
};
