
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

  const lowStockItems = items.filter(i => i.stock <= i.minStock);

  const totalInventoryValue = items.reduce((acc, curr) => acc + (curr.stock * curr.pricePerUnit), 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Total Asset Value</p>
          <p className="text-2xl font-bold text-slate-900">Rp {totalInventoryValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Finished Goods Types</p>
          <p className="text-2xl font-bold text-slate-900">{items.filter(i => i.category === 'Finished Good').length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Stock Alerts</p>
          <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {lowStockItems.length} Critical
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500">Monthly Transactions</p>
          <p className="text-2xl font-bold text-slate-900">{transactions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Finished Goods Inventory (MT)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockLevels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">Raw Material Value Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rawMaterialValue}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
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

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Urgent Replenishment Needed</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.stock} {item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.minStock} {item.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800">Critical</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-slate-500 italic">All stocks healthy</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
