"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import PageHeader from "@/app/components/PageHeader";

// ============================================
// MAIN CLIENT SETTINGS PAGE
// ============================================

export default function ClientSettingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const client = useQuery(api.functions.getClient, { slug });
  const updateClient = useMutation(api.functions.updateClient);
  const addOnetimeRevenue = useMutation(api.functions.addOnetimeRevenue);

  // Client Info
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("active");

  // Revenue
  const [mrr, setMrr] = useState(0);
  const [billingCycle, setBillingCycle] = useState("monthly");

  // One-time Revenue
  const [onetimeEntries, setOnetimeEntries] = useState<any[]>([]);
  const [showAddOnetime, setShowAddOnetime] = useState(false);
  const [newOnetimeDesc, setNewOnetimeDesc] = useState("");
  const [newOnetimeAmount, setNewOnetimeAmount] = useState("");
  const [newOnetimeDate, setNewOnetimeDate] = useState(new Date().toISOString().split("T")[0]);
  const [newOnetimeStatus, setNewOnetimeStatus] = useState("paid");

  // Contacts
  const [contacts, setContacts] = useState<any[]>([]);

  // UI State
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  // Populate form when client loads
  useEffect(() => {
    if (client) {
      setName(client.name);
      setIndustry(client.industry || "");
      setStatus(client.status);
      setMrr(client.revenue.mrr);
      setBillingCycle(client.revenue.billingCycle);
      setContacts(client.contacts.map((c: any) => ({ ...c })));
      setOnetimeEntries((client as any).onetimeRevenue || []);
    }
  }, [client]);

  if (!client) {
    return (
      <>
        <PageHeader />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-400">Loading client settings...</p>
        </div>
      </>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await updateClient({
        clientId: client._id,
        name: name.trim(),
        industry: industry.trim() || undefined,
        status: status as any,
        revenue: {
          mrr,
          currency: "USD",
          billingCycle: billingCycle as any,
        },
        contacts: contacts.map(c => ({
          name: c.name,
          role: c.role,
          email: c.email || undefined,
          phone: c.phone || undefined,
          primary: c.primary || false,
        })),
        onetimeRevenue: onetimeEntries,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddOnetime = async () => {
    if (!newOnetimeDesc.trim() || !newOnetimeAmount) return;
    const entry = {
      description: newOnetimeDesc.trim(),
      amount: parseFloat(newOnetimeAmount),
      date: new Date(newOnetimeDate).getTime(),
      status: newOnetimeStatus as "pending" | "paid" | "cancelled",
    };
    setOnetimeEntries([...onetimeEntries, entry]);
    setNewOnetimeDesc("");
    setNewOnetimeAmount("");
    setNewOnetimeDate(new Date().toISOString().split("T")[0]);
    setNewOnetimeStatus("paid");
    setShowAddOnetime(false);
  };

  const handleRemoveOnetime = (index: number) => {
    setOnetimeEntries(onetimeEntries.filter((_, i) => i !== index));
  };

  const handleOnetimeStatusChange = (index: number, newStatus: string) => {
    const updated = [...onetimeEntries];
    updated[index] = { ...updated[index], status: newStatus };
    setOnetimeEntries(updated);
  };

  const addContact = () => {
    setContacts([...contacts, { name: "", role: "", email: "", phone: "", primary: false }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: any) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    // If setting primary, unset all others
    if (field === "primary" && value) {
      updated.forEach((c, i) => {
        if (i !== index) c.primary = false;
      });
    }
    setContacts(updated);
  };

  // Revenue summary
  const totalPaid = onetimeEntries
    .filter(e => e.status === "paid")
    .reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalPending = onetimeEntries
    .filter(e => e.status === "pending")
    .reduce((sum: number, e: any) => sum + e.amount, 0);

  const statusOptions = [
    { value: "lead", label: "Lead", color: "text-gray-400" },
    { value: "onboarding", label: "Onboarding", color: "text-blue-400" },
    { value: "active", label: "Active", color: "text-green-400" },
    { value: "at_risk", label: "At Risk", color: "text-yellow-400" },
    { value: "offboarding", label: "Offboarding", color: "text-orange-400" },
    { value: "alumni", label: "Alumni", color: "text-gray-500" },
  ];

  return (
    <>
      <PageHeader />
      <div className="max-w-4xl mx-auto px-6 pb-8">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/clients/${slug}`} className="text-gray-400 hover:text-gray-300">
            &larr; {client.name}
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-8">Client Settings</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: Client Information */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Client Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  disabled
                  className="w-full bg-gray-800/50 text-gray-500 rounded-lg px-3 py-2 border border-gray-700 cursor-not-allowed"
                />
                <p className="text-gray-600 text-xs mt-1">Read-only — used in URLs and file paths</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. HVAC, Finance, Education"
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Recurring Revenue */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4">Recurring Revenue</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">MRR ($)</label>
                <input
                  type="number"
                  value={mrr}
                  onChange={(e) => setMrr(parseFloat(e.target.value) || 0)}
                  step="100"
                  min="0"
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Billing Cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 3: One-Time / Project Revenue */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">One-Time / Project Revenue</h2>
              <button
                onClick={() => setShowAddOnetime(true)}
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                + Add Entry
              </button>
            </div>

            {/* Summary */}
            {(totalPaid > 0 || totalPending > 0) && (
              <div className="flex gap-6 mb-4 p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <span className="text-gray-400 text-sm">Paid: </span>
                  <span className="text-green-400 font-medium">${totalPaid.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Pending: </span>
                  <span className="text-yellow-400 font-medium">${totalPending.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">12mo LTV: </span>
                  <span className="text-amber-400 font-medium">
                    ${(mrr * 12 + totalPaid).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Entries Table */}
            {onetimeEntries.length > 0 ? (
              <div className="space-y-2">
                {onetimeEntries.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex-1">
                      <span className="text-white text-sm">{entry.description}</span>
                    </div>
                    <span className="text-green-400 font-medium text-sm">
                      ${entry.amount.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <select
                      value={entry.status}
                      onChange={(e) => handleOnetimeStatusChange(index, e.target.value)}
                      className={`bg-gray-800 rounded px-2 py-1 text-xs border border-gray-700 ${
                        entry.status === "paid" ? "text-green-400" :
                        entry.status === "pending" ? "text-yellow-400" : "text-red-400"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => handleRemoveOnetime(index)}
                      className="text-gray-500 hover:text-red-400 text-sm"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : !showAddOnetime ? (
              <p className="text-gray-500 text-sm">No one-time revenue recorded. Click &quot;+ Add Entry&quot; to add project work or one-time payments.</p>
            ) : null}

            {/* Add One-Time Entry Form */}
            {showAddOnetime && (
              <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-gray-400 text-xs mb-1">Description</label>
                    <input
                      type="text"
                      value={newOnetimeDesc}
                      onChange={(e) => setNewOnetimeDesc(e.target.value)}
                      placeholder="e.g. Quiz Funnel Build"
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Amount ($)</label>
                    <input
                      type="number"
                      value={newOnetimeAmount}
                      onChange={(e) => setNewOnetimeAmount(e.target.value)}
                      placeholder="1000"
                      step="100"
                      min="0"
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Date</label>
                    <input
                      type="date"
                      value={newOnetimeDate}
                      onChange={(e) => setNewOnetimeDate(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Status</label>
                    <select
                      value={newOnetimeStatus}
                      onChange={(e) => setNewOnetimeStatus(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddOnetime(false)}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddOnetime}
                    disabled={!newOnetimeDesc.trim() || !newOnetimeAmount}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    Add Entry
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Section 4: Contacts */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Contacts</h2>
              <button
                onClick={addContact}
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
              >
                + Add Contact
              </button>
            </div>

            {contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={contact.primary || false}
                            onChange={(e) => updateContact(index, "primary", e.target.checked)}
                            className="rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                          />
                          <span className={contact.primary ? "text-amber-400 font-medium" : "text-gray-400"}>
                            Primary Contact
                          </span>
                        </label>
                      </div>
                      <button
                        onClick={() => removeContact(index)}
                        className="text-gray-500 hover:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Name</label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(index, "name", e.target.value)}
                          placeholder="Brad Sims"
                          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Role</label>
                        <input
                          type="text"
                          value={contact.role}
                          onChange={(e) => updateContact(index, "role", e.target.value)}
                          placeholder="Owner"
                          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Email</label>
                        <input
                          type="email"
                          value={contact.email || ""}
                          onChange={(e) => updateContact(index, "email", e.target.value)}
                          placeholder="brad@simsco.com"
                          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Phone</label>
                        <input
                          type="tel"
                          value={contact.phone || ""}
                          onChange={(e) => updateContact(index, "phone", e.target.value)}
                          placeholder="(555) 123-4567"
                          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No contacts. Click &quot;+ Add Contact&quot; to add one.</p>
            )}
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/clients/${slug}`}
              className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                saveStatus === "saved"
                  ? "bg-green-600 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              } disabled:opacity-60`}
            >
              {saving ? "Saving..." : saveStatus === "saved" ? "✓ Saved" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
