import React from 'react';
import { 
  Building2, 
  Shield, 
  Plus, 
  Barcode, 
  UserCircle2, 
  RefreshCw, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Search,
  Moon,
  Sun
} from 'lucide-react';
import { Branch, UserRole } from '../types';
import { useTheme } from '../App';

interface HeaderProps {
  currentTabTitle: string;
  branches: Branch[];
  currentBranchId: string;
  onBranchChange: (branchId: string) => void;
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewInvoice: () => void;
  onOpenBarcode: () => void;
  onOpenClientPortal: () => void;
  onQuickRefresh: () => void;
  searchTerm: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabTitle,
  branches,
  currentBranchId,
  onBranchChange,
  currentUserRole,
  onRoleChange,
  onOpenNewInvoice,
  onOpenBarcode,
  onOpenClientPortal,
  onQuickRefresh,
  searchTerm,
  onSearchChange,
}) => {
  const currentBranch = branches.find(b => b.id === currentBranchId);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 flex items-center justify-between px-6 shadow-xs z-10 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            {currentTabTitle}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              <Building2 className="w-3 h-3" />
              {currentBranchId === 'ALL_HQ' ? 'Central HQ (Consolidated All Branches)' : currentBranch?.name}
            </span>
            <span>•</span>
            <span className="text-slate-400">Live Synchronized</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Universal Quick Search */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Quick search records..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white dark:bg-slate-900 transition"
          />
        </div>

        {/* Multi-Store HQ Branch Selector */}
        <div className="relative">
          <select
            value={currentBranchId}
            onChange={(e) => onBranchChange(e.target.value)}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-300 rounded-lg px-3 py-1.5 pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none transition"
          >
            <option value="ALL_HQ">🏢 Central HQ (All Stores)</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                📍 {b.name} ({b.city})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Role Switcher Pill */}
        <div className="relative">
          <select
            value={currentUserRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg px-3 py-1.5 pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none transition"
            title="Role-Based Access Control Switcher"
          >
            <option value="Admin">👑 Role: Super Admin</option>
            <option value="Staff Manager">👔 Role: Staff Manager</option>
            <option value="Accountant">📊 Role: Accountant & Tax</option>
            <option value="Cashier">💳 Role: POS Cashier</option>
            <option value="Store Manager">📦 Role: Store Manager</option>
          </select>
          <Shield className="w-3 h-3 text-amber-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Client Portal Button */}
        <button
          onClick={onOpenClientPortal}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg font-bold text-xs shadow-xs transition"
          title="Open Customer Self-Service Client Portal"
        >
          <UserCircle2 className="w-3.5 h-3.5 text-cyan-600" />
          <span>Client Portal</span>
        </button>

        {/* Barcode Scanner Shortcut */}
        <button
          onClick={onOpenBarcode}
          className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
          title="Open Quick Barcode Scanner"
        >
          <Barcode className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Scanner</span>
        </button>

        {/* New Invoice Button */}
        <button
          onClick={onOpenNewInvoice}
          className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onQuickRefresh}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 transition"
          title="Refresh All Metrics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-400 hover:text-orange-500 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
