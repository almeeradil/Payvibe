import { AppStateData, AuditLog, UserRole } from '../types';
import { getInitialData } from '../data/initialData';

const STORAGE_KEY = 'payvibes_enterprise_erp_data_v2';
const ACTIVE_ROLE_KEY = 'payvibes_active_user_role';

export const getStoredData = (): AppStateData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const defaults = getInitialData();
    return {
      ...defaults,
      ...parsed,
      branches: parsed.branches || defaults.branches,
      customers: parsed.customers || defaults.customers,
      suppliers: parsed.suppliers || defaults.suppliers,
      inventory: parsed.inventory || defaults.inventory,
      orders: parsed.orders || defaults.orders,
      purchaseinvoices: parsed.purchaseinvoices || defaults.purchaseinvoices,
      purchases: parsed.purchases || defaults.purchases,
      quotations: parsed.quotations || defaults.quotations,
      debitnotes: parsed.debitnotes || defaults.debitnotes,
      expenses: parsed.expenses || defaults.expenses,
      cashbank: parsed.cashbank || defaults.cashbank,
      otherincome: parsed.otherincome || defaults.otherincome,
      stockTransfers: parsed.stockTransfers || defaults.stockTransfers,
      tdsEntries: parsed.tdsEntries || defaults.tdsEntries,
      tcsEntries: parsed.tcsEntries || defaults.tcsEntries,
      bankStatements: parsed.bankStatements || defaults.bankStatements,
      gstFilings: parsed.gstFilings || defaults.gstFilings,
      walletTransactions: parsed.walletTransactions || defaults.walletTransactions,
      loyaltyCampaigns: parsed.loyaltyCampaigns || defaults.loyaltyCampaigns,
      employees: parsed.employees || defaults.employees,
      attendance: parsed.attendance || defaults.attendance,
      payrolls: parsed.payrolls || defaults.payrolls,
      communicationLogs: parsed.communicationLogs || defaults.communicationLogs,
      auditLogs: parsed.auditLogs || defaults.auditLogs,
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      counters: { ...defaults.counters, ...(parsed.counters || {}) },
    };
  } catch (err) {
    console.error('Error loading data from localStorage, falling back to defaults:', err);
    return getInitialData();
  }
};

export const saveStoredData = (data: AppStateData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const createAuditEntry = (
  action: AuditLog['action'],
  module: AuditLog['module'],
  details: string,
  userName = 'Current User',
  userRole = 'Admin',
  changesDiff?: string
): AuditLog => {
  return {
    id: 'aud-' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleString('en-GB'),
    userName,
    userRole,
    action,
    module,
    details,
    ipAddress: '192.168.1.' + Math.floor(10 + Math.random() * 80),
    device: navigator.userAgent.includes('Mac') ? 'macOS Desktop' : navigator.userAgent.includes('Windows') ? 'Windows Desktop' : 'Mobile Web Client',
    changesDiff,
  };
};

export const exportBackupJSON = (data?: AppStateData) => {
  const currentData = data || getStoredData();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("download", `payvibes_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const exportBackupJson = exportBackupJSON;

export const restoreBackupFromJSON = (jsonString: string, userName = 'Current User', userRole = 'Admin'): AppStateData => {
  try {
    const parsed = JSON.parse(jsonString);
    const validatedData: AppStateData = {
      ...getInitialData(),
      ...parsed,
    };
    const restoreLog = createAuditEntry('RESTORE_BACKUP', 'Security', `Restored database backup containing ${validatedData.orders?.length || 0} invoices and ${validatedData.inventory?.length || 0} inventory items.`, userName, userRole);
    validatedData.auditLogs = [restoreLog, ...(validatedData.auditLogs || [])];
    saveStoredData(validatedData);
    return validatedData;
  } catch (err: any) {
    throw new Error(err.message || 'Failed to parse JSON file');
  }
};

export const restoreBackupFromJson = restoreBackupFromJSON;

export const getStoredRole = (): UserRole => {
  const role = sessionStorage.getItem(ACTIVE_ROLE_KEY) as UserRole;
  return role || 'Admin';
};

export const setStoredRole = (role: UserRole) => {
  sessionStorage.setItem(ACTIVE_ROLE_KEY, role);
};

export const clearSession = () => {
  sessionStorage.removeItem(ACTIVE_ROLE_KEY);
};
