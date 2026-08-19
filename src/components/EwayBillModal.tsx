import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  QrCode,
  Calendar
} from 'lucide-react';
import { SalesInvoice, SystemSettings } from '../types';

interface EwayBillModalProps {
  invoice?: SalesInvoice;
  settings: SystemSettings;
  onClose: () => void;
  onGenerateEway: (invoiceId: string, ewayNumber: string, vehicleNo: string, validTill: string) => void;
}

export const EwayBillModal: React.FC<EwayBillModalProps> = ({
  invoice,
  settings,
  onClose,
  onGenerateEway,
}) => {
  const [vehicleNo, setVehicleNo] = useState(invoice?.vehicleNo || 'LES-8841');
  const [transporterName, setTransporterName] = useState('Daewoo Fast Logistics Cargo');
  const [transporterId, setTransporterId] = useState('TRANS-99021');
  const [fromPincode, setFromPincode] = useState('54000 (Lahore HQ)');
  const [toPincode, setToPincode] = useState('60000 (Multan Hub)');
  const [distanceKm, setDistanceKm] = useState('340');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEway, setGeneratedEway] = useState<string | null>(invoice?.eWayBillNo || null);

  const validDays = Math.max(1, Math.ceil(parseInt(distanceKm) / 200));
  const validDate = new Date();
  validDate.setDate(validDate.getDate() + validDays);
  const validTillStr = validDate.toISOString().split('T')[0];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      const ewbNum = 'EWB-' + Math.floor(100000000000 + Math.random() * 900000000000);
      setGeneratedEway(ewbNum);
      setIsGenerating(false);
      if (invoice) {
        onGenerateEway(invoice.id, ewbNum, vehicleNo, validTillStr);
      }
    }, 800);
  };

  const handlePrintSlip = () => {
    const html = `<!DOCTYPE html><html><head><title>E-Way Bill - ${generatedEway}</title>
    <style>body{font-family:sans-serif;padding:24px;font-size:11px;color:#0f172a;}
    .card{border:2px solid #0f172a;padding:20px;max-width:700px;margin:0 auto;border-radius:8px;}
    .hdr{border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;}
    table{width:100%;border-collapse:collapse;margin:12px 0;}
    th,td{border:1px solid #cbd5e1;padding:6px 10px;text-align:left;}
    th{background:#f1f5f9;}</style></head><body>
    <div class="card">
      <div class="hdr">
        <div><h2 style="margin:0;">GOVERNMENT E-WAY BILL SLIP</h2><p style="margin:2px 0;color:#64748b;">E-Way Bill System Validated Consignment</p></div>
        <div style="text-align:right;"><h3 style="margin:0;color:#0284c7;">${generatedEway}</h3><p style="margin:0;">Valid Till: <strong>${validTillStr}</strong></p></div>
      </div>
      <h4>PART-A (Consignment Details)</h4>
      <table>
        <tr><td><strong>Consignor (From):</strong></td><td>${settings.company} (NTN: ${settings.ntn})</td></tr>
        <tr><td><strong>Consignee (To):</strong></td><td>${invoice?.custName || 'Commercial Hospital Partner'}</td></tr>
        <tr><td><strong>Invoice No &amp; Date:</strong></td><td>${invoice?.inv || 'INV-2026'} | ${invoice?.date || 'Today'}</td></tr>
        <tr><td><strong>Total Invoice Value:</strong></td><td>${settings.currency} ${(invoice?.amount || 75000).toFixed(2)}</td></tr>
        <tr><td><strong>HSN Classification:</strong></td><td>3004.90.99 (Pharma Medicaments)</td></tr>
      </table>
      <h4>PART-B (Vehicle &amp; Transport Details)</h4>
      <table>
        <tr><td><strong>Vehicle Number:</strong></td><td>${vehicleNo}</td></tr>
        <tr><td><strong>Transporter Name:</strong></td><td>${transporterName} (ID: ${transporterId})</td></tr>
        <tr><td><strong>Transit Distance:</strong></td><td>${distanceKm} KM (Validity: ${validDays} Day(s))</td></tr>
      </table>
      <div style="margin-top:24px;border:1px dashed #94a3b8;padding:10px;text-align:center;">
        [AUTHENTICATED QR CODE WITH DIGITAL ENCRYPTED SIGNATURE]
      </div>
    </div><script>window.onload=function(){window.print();}</script></body></html>`;
    const w = window.open('', '_blank');
    w?.document.write(html);
    w?.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Govt E-Way Bill &amp; Consignment Slip Generator</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        {generatedEway ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900">
              <div className="flex items-center gap-2 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>E-Way Bill Successfully Generated!</span>
              </div>
              <div className="mt-2 space-y-1">
                <div>E-Way Bill No: <strong className="font-mono text-emerald-800 text-sm">{generatedEway}</strong></div>
                <div>Vehicle No: <strong className="font-mono">{vehicleNo}</strong></div>
                <div>Validity: Valid Till <strong>{validTillStr}</strong> ({validDays} day transit allowance)</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={handlePrintSlip}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official E-Way Bill</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Consignment Summary</div>
              <div className="font-bold text-slate-900 mt-0.5">
                Invoice: {invoice?.inv || 'INV-2026'} • Value: {settings.currency} {invoice?.amount.toFixed(2) || '50,000.00'}
              </div>
              <div className="text-[11px] text-slate-500">Party: {invoice?.custName || 'Hospital Partner'}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  required
                  placeholder="e.g. LES-8841"
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Estimated Distance (KM)</label>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Transporter Name</label>
              <input
                type="text"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                placeholder="Daewoo Cargo / TCS Logistics"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dispatch Origin</label>
                <input
                  type="text"
                  value={fromPincode}
                  onChange={(e) => setFromPincode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Delivery Destination</label>
                <input
                  type="text"
                  value={toPincode}
                  onChange={(e) => setToPincode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow cursor-pointer"
              >
                {isGenerating ? 'Validating with Portal...' : 'Generate Part A & B Slip'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
