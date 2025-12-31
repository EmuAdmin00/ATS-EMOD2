
import React, { useState } from 'react';
import { BranchOffice, TACData, Position, Employee, Item, MasterSubView } from '../types';

interface MasterDataProps {
  offices: BranchOffice[];
  tacs: TACData[];
  positions: Position[];
  employees: Employee[];
  items: Item[];
}

export const MasterData: React.FC<MasterDataProps> = ({ offices, tacs, positions, employees, items }) => {
  const [activeTab, setActiveTab] = useState<MasterSubView>('Office');

  const TabButton = ({ view, label }: { view: MasterSubView; label: string }) => (
    <button
      onClick={() => setActiveTab(view)}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
        activeTab === view
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );

  const rawMaterials = items.filter(i => i.category !== 'Finished Good');
  const finishedProducts = items.filter(i => i.category === 'Finished Good');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200 px-4 space-x-2 overflow-x-auto scrollbar-hide">
          <TabButton view="Office" label="Branch Office" />
          <TabButton view="TAC" label="Data TAC" />
          <TabButton view="Jabatan" label="Data Jabatan" />
          <TabButton view="Pegawai" label="Data Pegawai" />
          <TabButton view="Bahan Baku" label="Data Bahan Baku" />
          <TabButton view="Produk" label="Data Produk" />
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Daftar {activeTab}</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Tambah Data
            </button>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'Office' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Office</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Office</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kota</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Telepon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {offices.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{o.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{o.officeName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{o.address}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{o.city}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{o.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{o.fax}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'TAC' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID TAC</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Office</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama TAC</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Telepon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fax</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tacs.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{t.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{t.officeId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{t.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{t.address}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{t.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{t.fax}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Jabatan' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Jabatan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Jabatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {positions.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{p.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{p.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Pegawai' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NIK</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Jabatan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Alamat</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Telepon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Office</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">TAC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {employees.map(e => (
                    <tr key={e.nik} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{e.nik}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{e.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{positions.find(p => p.id === e.positionId)?.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                           e.status === 'Permanent' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                         }`}>{e.status}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 truncate max-w-[150px]">{e.address}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{e.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{e.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{e.officeId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{e.tacId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Bahan Baku' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID RM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Material</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">UoM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rawMaterials.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{i.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{i.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{i.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-semibold">{i.stock}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{i.unit}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Produk' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID FP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Produk</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">UoM</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {finishedProducts.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-500">{i.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{i.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{i.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 font-semibold">{i.stock}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{i.unit}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
