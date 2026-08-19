import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Wallet, 
  Award, 
  Gift, 
  Send, 
  Sparkles, 
  Plus, 
  Users, 
  CheckCircle2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Customer, WalletTransaction, LoyaltyCampaign, SystemSettings } from '../types';

interface LoyaltyProgramTabProps {
  customers: Customer[];
  walletTransactions: WalletTransaction[];
  loyaltyCampaigns: LoyaltyCampaign[];
  settings: SystemSettings;
  onAddWalletBonus: (customerId: string, points: number, walletAmt: number, note: string) => void;
  onSendCampaignMessage: (campaign: LoyaltyCampaign, customer: Customer) => void;
}

export const LoyaltyProgramTab: React.FC<LoyaltyProgramTabProps> = ({
  customers,
  walletTransactions,
  loyaltyCampaigns,
  settings,
  onAddWalletBonus,
  onSendCampaignMessage,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'members' | 'ledger' | 'campaigns'>('members');
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [bonusPoints, setBonusPoints] = useState('100');
  const [bonusCash, setBonusCash] = useState('200');
  const [bonusNote, setBonusNote] = useState('Festive VIP customer loyalty bonus');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const totalPointsCirculation = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);
  const totalWalletHoldings = customers.reduce((s, c) => s + (c.walletBalance || 0), 0);

  const handleApplyBonus = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWalletBonus(
      selectedCustomerId,
      parseInt(bonusPoints) || 0,
      parseFloat(bonusCash) || 0,
      bonusNote
    );
    setShowBonusModal(false);
  };

  const handleTriggerCampaign = (campaign: LoyaltyCampaign, customer: Customer) => {
    onSendCampaignMessage(campaign, customer);
    setSentNotice(`Automated ${campaign.type} SMS & WhatsApp discount sent to ${customer.name} (${customer.contact})!`);
    setTimeout(() => setSentNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Reward Points Issued</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {totalPointsCirculation.toLocaleString()} pts
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">1 Point = {settings.currency} 1.00 Value</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Customer Wallet Balance</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {settings.currency} {totalWalletHoldings.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Stored Digital Cash &amp; Cashbacks</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Active VIP Members</div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {customers.filter(c => c.tier === 'Platinum' || c.tier === 'Diamond').length} VIPs
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Platinum &amp; Diamond Tiers</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="text-[10px] font-bold uppercase text-slate-400">Loyalty Actions</div>
          <button
            onClick={() => setShowBonusModal(true)}
            className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Points / Cashback</span>
          </button>
        </div>
      </div>

      {sentNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('members')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            activeSubTab === 'members' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Membership &amp; Wallet Profiles ({customers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            activeSubTab === 'campaigns' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Automated Birthday &amp; Anniversary Offers</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            activeSubTab === 'ledger' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Digital Wallet &amp; Points Transaction Log</span>
        </button>
      </div>

      {/* Members Directory */}
      {activeSubTab === 'members' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
              <tr>
                <th className="p-3">Customer / Shop Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-center">Membership Tier</th>
                <th className="p-3 text-right">Reward Points</th>
                <th className="p-3 text-right">Digital Wallet Cashback</th>
                <th className="p-3">Birth / Anniversary Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.category} • {c.address}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">{c.contact}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      c.tier === 'Diamond' ? 'bg-cyan-100 text-cyan-800' :
                      c.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                      c.tier === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      ⭐ {c.tier || 'Silver'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-black text-amber-600">
                    {c.loyaltyPoints || 0} pts
                  </td>
                  <td className="p-3 text-right font-black text-emerald-600">
                    {settings.currency} {(c.walletBalance || 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-[11px] text-slate-600">
                    <div>🎂 {c.birthDate || 'Not specified'}</div>
                    <div className="text-slate-400">💍 {c.anniversaryDate || 'Not specified'}</div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setShowBonusModal(true);
                      }}
                      className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded font-bold text-[10px] transition"
                    >
                      + Credit Bonus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaigns View */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loyaltyCampaigns.map(camp => (
              <div key={camp.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-pink-300 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                    {camp.type}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {camp.active ? 'Active Engine' : 'Paused'}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{camp.title}</h4>
                <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                  "{camp.messageTemplate}"
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-pink-600">{camp.discountPct}% Discount Code</span>
                  <span className="text-[10px] text-slate-400">SMS / WhatsApp Ready</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-600" />
              <span>Trigger Birthday / Anniversary Offer Blast to Customer</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customers.slice(0, 4).map(cust => (
                <div key={cust.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{cust.name}</div>
                    <div className="text-[10px] text-slate-500">Ph: {cust.contact} • B-Day: {cust.birthDate || 'Upcoming'}</div>
                  </div>
                  <button
                    onClick={() => handleTriggerCampaign(loyaltyCampaigns[0], cust)}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Offer</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ledger Log */}
      {activeSubTab === 'ledger' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Activity Type</th>
                <th className="p-3 text-right">Points Change</th>
                <th className="p-3 text-right">Wallet Change ({settings.currency})</th>
                <th className="p-3">Note / Invoice Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {walletTransactions.map(wt => (
                <tr key={wt.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-600">{wt.date}</td>
                  <td className="p-3 font-bold text-slate-900">{wt.customerName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      wt.pointsChange > 0 || wt.walletAmountChange > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {wt.type}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-bold ${wt.pointsChange >= 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                    {wt.pointsChange > 0 ? `+${wt.pointsChange}` : wt.pointsChange} pts
                  </td>
                  <td className={`p-3 text-right font-black ${wt.walletAmountChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {wt.walletAmountChange > 0 ? `+${settings.currency} ${wt.walletAmountChange.toFixed(2)}` : `${settings.currency} ${wt.walletAmountChange.toFixed(2)}`}
                  </td>
                  <td className="p-3 text-slate-600">{wt.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bonus Credit Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Credit Points / Wallet Bonus</h3>
              <button onClick={() => setShowBonusModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleApplyBonus} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Bonus Reward Points</label>
                  <input
                    type="number"
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Digital Wallet Cash ({settings.currency})</label>
                  <input
                    type="number"
                    value={bonusCash}
                    onChange={(e) => setBonusCash(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={bonusNote}
                  onChange={(e) => setBonusNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBonusModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-xs shadow"
                >
                  Credit to Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
