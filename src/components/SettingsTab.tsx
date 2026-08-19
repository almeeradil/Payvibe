import React, { useState } from 'react';
import { 
  Settings, 
  Building, 
  Download, 
  Save, 
  CheckCircle2, 
  Shield, 
  Globe, 
  Percent, 
  Smartphone 
} from 'lucide-react';
import { SystemSettings } from '../types';
import { exportBackupJson } from '../services/storage';

interface SettingsTabProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setNotice('Enterprise configuration updated successfully!');
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            <span>System Configuration &amp; Enterprise Settings</span>
          </h3>
          <p className="text-xs text-slate-500">
            Set company identifiers, tax registration, default tax rates, and cloud backup parameters.
          </p>
        </div>

        <button
          onClick={exportBackupJson}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Database Backup</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Company Legal &amp; Commercial Profile</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Company Trade Name *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">National Tax Number (NTN / GSTIN) *</label>
              <input
                type="text"
                value={formData.ntn}
                onChange={(e) => setFormData({ ...formData, ntn: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Drug License / Registration #</label>
              <input
                type="text"
                value={formData.dlNo}
                onChange={(e) => setFormData({ ...formData, dlNo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Corporate Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">HQ Commercial Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Statutory & Tax Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Taxation &amp; Statutory Parameters</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Default GST Rate %</label>
              <input
                type="number"
                value={formData.taxPercent}
                onChange={(e) => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) || 18 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">TCS Standard Rate %</label>
              <input
                type="number"
                step="0.1"
                value={formData.tcsRate}
                onChange={(e) => setFormData({ ...formData, tcsRate: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">E-Way Bill Minimum Threshold</label>
              <input
                type="number"
                value={formData.eWayBillThreshold}
                onChange={(e) => setFormData({ ...formData, eWayBillThreshold: parseFloat(e.target.value) || 50000 })}
                className="w-full px-3 py-2 border rounded-lg font-bold"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Reminders Settings */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Automated Messaging &amp; Loyalty Configuration</span>
          </h4>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoSendWhatsapp}
                onChange={(e) => setFormData({ ...formData, autoSendWhatsapp: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-slate-700">Auto-trigger WhatsApp payment reminders when invoice is overdue</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableLoyaltyProgram}
                onChange={(e) => setFormData({ ...formData, enableLoyaltyProgram: e.target.checked })}
                className="rounded text-emerald-600"
              />
              <span className="font-semibold text-slate-700">Enable Customer Loyalty Program &amp; Digital Cashback Wallet</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
