
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Item, Transaction } from '../types';

interface DashboardProps {
  items: Item[];
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ items, transactions }) => {
  const stockLevels = useMemo(() => {
    return items.filter(i => i.category === 'Finished Good').map(item => ({
      name: item.name,
      stock: item.stock,
      min: item.minStock
    }));
  }, [items]);

  const rawMaterialValue = useMemo(() => {
    return items
      .filter(i => i.category !== 'Finished Good')
      .map(item => ({
        name: item.name,
        value: item.stock * item.pricePerUnit
      }));
  }, [items]);

  const totalInventoryValue = items.reduce((acc, curr) => acc + (curr.stock * curr.pricePerUnit), 0);
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9'];

  return (
    <div className="space-y-8">
      {/* Bento Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Inventory Value</p>
          <p className="text-3xl font-black tracking-tighter">Rp {totalInventoryValue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
             <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">+12% vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total SKU</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{items.length}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 italic">Master Data Aktif</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Production</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{transactions.filter(t => t.type === 'Production').length}</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-2">▲ 3 Batch Hari Ini</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 border-l-4 border-rose-500">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">Critical Stok</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">
            {items.filter(i => i.stock <= i.minStock).length}
          </p>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Butuh Restock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Level Finished Goods</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Satuan: MT</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockLevels}>
                <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold'}}
                />
                <Bar dataKey="stock" fill="#4f46e5" radius={[10, 10, 10, 10]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Value Distribution</h3>
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rawMaterialValue}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {rawMaterialValue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
