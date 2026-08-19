import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Store, 
  Boxes, 
  Truck, 
  CheckCircle2 
} from 'lucide-react';
import { Branch, InventoryItem, StockTransfer } from '../types';

interface StockTransferModalProps {
  branches: Branch[];
  inventory: InventoryItem[];
  onClose: () => void;
  onDispatchTransfer: (transfer: StockTransfer) => void;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  branches,
  inventory,
  onClose,
  onDispatchTransfer,
}) => {
  const [fromBranchId, setFromBranchId] = useState(branches[0]?.id || 'b-hq');
  const [toBranchId, setToBranchId] = useState(branches[1]?.id || 'b-lhr');
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || '');
  const [transferQty, setTransferQty] = useState('20');
  const [transportDriver, setTransportDriver] = useState('Ahmed Khan (LES-8841)');
  const [notes, setNotes] = useState('Urgent branch stock replenishment');

  const selectedItem = inventory.find(i => i.id === selectedItemId) || inventory[0];
  const fromBranch = branches.find(b => b.id === fromBranchId) || branches[0];
  const toBranch = branches.find(b => b.id === toBranchId) || branches[1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranchId === toBranchId) {
      alert('Source and destination branch cannot be the same!');
      return;
    }

    const qty = parseInt(transferQty) || 1;
    if (qty > (selectedItem?.stock || 0)) {
      if (!confirm(`Selected transfer qty (${qty}) exceeds currently available stock (${selectedItem?.stock}). Continue anyway?`)) {
        return;
      }
    }

    const newTransfer: StockTransfer = {
      id: 'st-' + Math.random().toString(36).substr(2, 9),
      transferNo: 'TRF-' + Math.floor(1000 + Math.random() * 9000),
      fromBranchId,
      fromBranchName: fromBranch.name,
      toBranchId,
      toBranchName: toBranch.name,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      batch: selectedItem.batch,
      qty,
      date: new Date().toISOString().split('T')[0],
      status: 'In-Transit',
      notes: `${notes} | Driver: ${transportDriver}`,
      initiatedBy: 'Store Supervisor',
    };

    onDispatchTransfer(newTransfer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            <span>Inter-Store Stock Transfer Channel</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">From Branch (Source)</label>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-800"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">To Branch (Destination)</label>
              <select
                value={toBranchId}
                onChange={(e) => setToBranchId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-800"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Medicine / SKU Item *</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white font-semibold"
            >
              {inventory.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} (Batch: {i.batch} | Available Stock: {i.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Transfer Quantity (Units) *</label>
              <input
                type="number"
                min="1"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg font-black text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Transport Vehicle / Driver</label>
              <input
                type="text"
                value={transportDriver}
                onChange={(e) => setTransportDriver(e.target.value)}
                placeholder="Driver name and van number"
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dispatch Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow"
            >
              Dispatch Stock Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
