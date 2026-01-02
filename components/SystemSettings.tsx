
import React from 'react';

interface SystemSettingsProps {
  data: any;
  scriptUrl: string;
  spreadsheetUrl: string;
  lastSync: string | null;
  onSetup: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ data, scriptUrl, spreadsheetUrl, lastSync, onSetup }) => {
  const downloadBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      appVersion: "1.2.0",
      content: data
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS-EMOD-Backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Backup */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Database Checkpoint</h3>
              <p className="text-sm text-slate-500">Ekspor seluruh data master saat ini ke file JSON.</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Gunakan fitur ini secara berkala sebelum melakukan perubahan besar pada struktur data.
          </p>
          <button 
            onClick={downloadBackup}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            Download Data Snapshot (.json)
          </button>
        </div>

        {/* Card Cloud Status */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Cloud Integration</h3>
              <p className="text-sm text-slate-500">Detail koneksi Google Apps Script.</p>
            </div>
          </div>
          <div className="space-y-4">
            <button 
              onClick={onSetup}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-100 flex items-center justify-center gap-2 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066"/></svg>
              Sinkronkan Struktur Spreadsheet
            </button>
            
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Web App URL</label>
              <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[10px] font-mono break-all text-slate-500">
                {scriptUrl}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600 font-medium">Last Cloud Sync</span>
              <span className="text-sm font-bold text-emerald-600">{lastSync || 'Never'}</span>
            </div>
            <a 
              href={spreadsheetUrl} 
              target="_blank" 
              className="block w-full text-center py-3 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
            >
              Open Connected Spreadsheet →
            </a>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-8 rounded-2xl border border-amber-100">
        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Penting: Cara Melakukan Setup Awal
        </h3>
        <p className="text-sm text-amber-800 mb-4">
          Jika Master Data terlihat kosong setelah menghubungkan URL baru, klik tombol <b>"Sinkronkan Struktur Spreadsheet"</b> di atas. Tombol ini akan membuat tabel-tabel yang diperlukan di Google Sheet Anda secara otomatis.
        </p>
      </div>
    </div>
  );
};
