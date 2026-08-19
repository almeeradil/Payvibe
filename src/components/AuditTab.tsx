import React, { useState } from 'react';
import { 
  ShieldCheck, 
  History, 
  Users, 
  Download, 
  Upload, 
  Key, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Search
} from 'lucide-react';
import { AuditLog, UserRole, SystemSettings } from '../types';
import { exportBackupJson } from '../services/storage';

interface AuditTabProps {
  auditLogs: AuditLog[];
  userRole: UserRole;
  settings: SystemSettings;
  onRestoreBackupFile: (file: File) => void;
  onOpenClientPortal: () => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  auditLogs,
  userRole,
  settings,
  onRestoreBackupFile,
  onOpenClientPortal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'rbac' | 'backup'>('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestoreBackupFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Security, Audit Trail &amp; Role-Based Access Control
            </h3>
            <p className="text-xs text-slate-500">
              Comprehensive tamper-evident activity ledger, granular user role permissions, and disaster backup recovery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenClientPortal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Launch Client Portal</span>
          </button>
          <button
            onClick={exportBackupJson}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Cloud Backup</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            activeSubTab === 'audit' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Complete Audit Trail ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('rbac')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            activeSubTab === 'rbac' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Role-Based Access Control (RBAC) Matrix</span>
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            activeSubTab === 'backup' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Disaster Recovery &amp; Backup Vault</span>
        </button>
      </div>

      {/* Audit Log View */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search audit trail by user, module, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Action:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 text-slate-700"
              >
                <option value="All">All Actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="CREATE_INVOICE">CREATE_INVOICE</option>
                <option value="GST_FILING">GST_FILING</option>
                <option value="STOCK_TRANSFER">STOCK_TRANSFER</option>
                <option value="DISASTER_RESTORE">DISASTER_RESTORE</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User &amp; Role</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Details &amp; Audit Log Record</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{log.user}</div>
                      <span className="text-[10px] text-slate-500 font-semibold">{log.role}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        log.action === 'LOGIN' ? 'bg-indigo-100 text-indigo-800' :
                        log.action.includes('RESTORE') ? 'bg-amber-100 text-amber-800' :
                        log.action.includes('GST') ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{log.module}</td>
                    <td className="p-3 text-slate-800 font-medium">{log.details}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{log.ipAddress || '192.168.1.10'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RBAC Matrix */}
      {activeSubTab === 'rbac' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Role-Based Access Control (RBAC) Matrix</h4>
            <p className="text-xs text-slate-500">
              Granular permission mapping across all Payvibes ERP enterprise modules.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">ERP Functional Module</th>
                  <th className="p-3 text-center">Super Admin</th>
                  <th className="p-3 text-center">Branch Manager</th>
                  <th className="p-3 text-center">Accountant</th>
                  <th className="p-3 text-center">Sales Executive</th>
                  <th className="p-3 text-center">Cashier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Sales Invoicing & POS Billing', sa: true, bm: true, acc: true, se: true, ca: true },
                  { name: 'Customer & Supplier Lists Dropdown', sa: true, bm: true, acc: true, se: true, ca: false },
                  { name: '1-Click GST Compliance Filing (GSTR-1/3B)', sa: true, bm: false, acc: true, se: false, ca: false },
                  { name: 'E-Way Bill & E-Invoicing (IRN) Generation', sa: true, bm: true, acc: true, se: true, ca: false },
                  { name: 'TDS & TCS Deductions Register', sa: true, bm: false, acc: true, se: false, ca: false },
                  { name: 'Automated Bank Reconciliation', sa: true, bm: false, acc: true, se: false, ca: false },
                  { name: 'HR Biometric Attendance & Payroll Sync', sa: true, bm: true, acc: true, se: false, ca: false },
                  { name: 'Central HQ Stock Transfer Channel', sa: true, bm: true, acc: false, se: false, ca: false },
                  { name: 'Loyalty Program & Digital Wallet Bonus', sa: true, bm: true, acc: false, se: true, ca: true },
                  { name: 'WhatsApp & SMS Overdue Reminders', sa: true, bm: true, acc: true, se: true, ca: false },
                  { name: 'Disaster Backup Restore & Audit Trail', sa: true, bm: false, acc: false, se: false, ca: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{row.name}</td>
                    <td className="p-3 text-center">{row.sa ? <span className="text-emerald-600 font-bold">✓ Full</span> : <span className="text-slate-300">✗</span>}</td>
                    <td className="p-3 text-center">{row.bm ? <span className="text-emerald-600 font-bold">✓ Full</span> : <span className="text-slate-300">✗</span>}</td>
                    <td className="p-3 text-center">{row.acc ? <span className="text-emerald-600 font-bold">✓ Full</span> : <span className="text-slate-300">✗</span>}</td>
                    <td className="p-3 text-center">{row.se ? <span className="text-cyan-600 font-bold">✓ Access</span> : <span className="text-slate-300">✗</span>}</td>
                    <td className="p-3 text-center">{row.ca ? <span className="text-cyan-600 font-bold">✓ Basic</span> : <span className="text-slate-300">✗</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Backup & Disaster Recovery */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Full Cloud Database Backup</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export an encrypted, high-fidelity JSON snapshot containing all sales invoices, GST returns, TDS registers, stock transfers, employees, and customer ledgers.
            </p>
            <button
              onClick={exportBackupJson}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Live Backup (.JSON)</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-600" />
              <span>Emergency Data Restoration Vault</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              If the local browser crashes or software resets, upload your saved backup JSON to instantly restore all historical invoices, customer records, and tax filings.
            </p>
            <label className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Select &amp; Restore Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
