import { SalesInvoice, PurchaseInvoice, GstFilingRecord } from '../types';

export interface ValidationIssue {
  type: 'Error' | 'Warning';
  field: string;
  invoiceNo?: string;
  message: string;
  recommendation: string;
}

export const validateGstPreSubmission = (
  invoices: SalesInvoice[],
  periodMonth: string,
  periodYear: number,
  returnType: 'GSTR-1' | 'GSTR-3B'
): { isValid: boolean; issues: ValidationIssue[]; summary: any } => {
  const issues: ValidationIssue[] = [];

  // Filter invoices for the requested period
  const periodInvoices = invoices.filter(inv => {
    if (!inv.date) return false;
    const d = new Date(inv.date);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[d.getMonth()] === periodMonth && d.getFullYear() === periodYear;
  });

  if (periodInvoices.length === 0) {
    issues.push({
      type: 'Warning',
      field: 'periodInvoices',
      message: `No sales invoices found for ${periodMonth} ${periodYear}.`,
      recommendation: 'Verify date filters or check if invoices were recorded under this period.'
    });
  }

  let totalTaxable = 0;
  let totalTax = 0;
  let missingNtnCount = 0;
  let missingHsnCount = 0;

  periodInvoices.forEach(inv => {
    totalTaxable += inv.subtotal || 0;
    totalTax += inv.taxAmount || 0;

    // Check NTN/CNIC or GSTIN
    if (!inv.custNtnCnic || inv.custNtnCnic.trim().length < 5) {
      missingNtnCount++;
      issues.push({
        type: 'Warning',
        field: 'custNtnCnic',
        invoiceNo: inv.inv,
        message: `Invoice ${inv.inv} for ${inv.custName} lacks valid NTN/CNIC/GSTIN.`,
        recommendation: 'B2B returns require valid 13-digit CNIC or 7-digit NTN/GSTIN. It will be treated as Unregistered B2C.'
      });
    }

    // Check HSN/SAC code
    const hasMissingHsn = (inv.items || []).some(item => !item.hsCode || item.hsCode.trim() === '');
    if (hasMissingHsn) {
      missingHsnCount++;
      issues.push({
        type: 'Error',
        field: 'hsCode',
        invoiceNo: inv.inv,
        message: `Invoice ${inv.inv} has items without mandatory 4-8 digit HS / Tariff Code.`,
        recommendation: 'Government portal requires HSN code (e.g. 3004.90 for Medicaments).'
      });
    }

    // Check mathematical calculation integrity
    const calculatedSub = (inv.items || []).reduce((s, it) => s + (it.qty * it.rate), 0);
    if (Math.abs(calculatedSub - inv.subtotal) > 2) {
      issues.push({
        type: 'Error',
        field: 'subtotal',
        invoiceNo: inv.inv,
        message: `Subtotal discrepancy in ${inv.inv}: items sum to Rs ${calculatedSub.toFixed(2)} vs recorded Rs ${inv.subtotal.toFixed(2)}.`,
        recommendation: 'Recalculate invoice lines to prevent rejection on portal.'
      });
    }
  });

  // Check E-Way threshold
  periodInvoices.forEach(inv => {
    if (inv.amount >= 50000 && !inv.eWayBillNo) {
      issues.push({
        type: 'Warning',
        field: 'eWayBillNo',
        invoiceNo: inv.inv,
        message: `Invoice ${inv.inv} value is Rs ${inv.amount.toFixed(2)} (>= 50,000) but has no E-Way Bill attached.`,
        recommendation: 'Generate E-Way Bill from the E-Way module for consignment movement above threshold.'
      });
    }
  });

  const hasErrors = issues.some(i => i.type === 'Error');

  return {
    isValid: !hasErrors,
    issues,
    summary: {
      totalInvoices: periodInvoices.length,
      totalTaxable,
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      igst: 0,
      totalTax,
      missingNtnCount,
      missingHsnCount
    }
  };
};

export const generateFilingPayload = (
  returnType: 'GSTR-1' | 'GSTR-3B' | 'GSTR-9',
  periodMonth: string,
  periodYear: number,
  invoices: SalesInvoice[],
  gstin: string,
  user: string
): GstFilingRecord => {
  const validation = validateGstPreSubmission(invoices, periodMonth, periodYear, returnType as any);
  const now = new Date();
  const randomArnCode = 'ARN-' + returnType.replace('-', '') + now.getFullYear().toString().slice(2) + ('0' + (now.getMonth() + 1)).slice(-2) + Math.floor(1000000 + Math.random() * 9000000);

  const payloadData = {
    gstin,
    period: `${periodMonth} ${periodYear}`,
    returnType,
    submissionTimestamp: now.toISOString(),
    submittedBy: user,
    b2bInvoicesCount: validation.summary.totalInvoices,
    totalTaxableValue: validation.summary.totalTaxable,
    totalTaxLiability: validation.summary.totalTax,
    b2bInvoices: invoices.map(i => ({
      inum: i.inv,
      idt: i.date,
      val: i.amount,
      pos: i.custProvince || 'Punjab',
      rchrg: 'N',
      inv_typ: 'R',
      irn: i.irn || null,
      items: i.items.map(it => ({
        hsn_sc: it.hsCode,
        txval: it.qty * it.rate,
        rt: it.taxPct,
        iamt: 0,
        camt: (it.qty * it.rate * it.taxPct) / 200,
        samt: (it.qty * it.rate * it.taxPct) / 200,
      }))
    }))
  };

  return {
    id: 'gst-' + Math.random().toString(36).substr(2, 9),
    returnType: returnType as any,
    periodMonth,
    periodYear,
    filingDate: now.toISOString().split('T')[0],
    arn: randomArnCode,
    status: 'Submitted',
    totalTaxable: validation.summary.totalTaxable,
    cgst: validation.summary.cgst,
    sgst: validation.summary.sgst,
    igst: validation.summary.igst,
    totalTax: validation.summary.totalTax,
    errorsDetected: validation.issues.filter(i => i.type === 'Error').map(i => i.message),
    submittedBy: user,
    jsonPayload: JSON.stringify(payloadData, null, 2),
  };
};
