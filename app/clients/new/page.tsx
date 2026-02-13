"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";

export default function OnboardClientPage() {
  const createClient = useMutation(api.functions.createClient);
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [industry, setIndustry] = useState("");
  const [mrr, setMrr] = useState(0);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "weekly" | "quarterly" | "annual">("monthly");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManual) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .slice(0, 40)
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !contactName.trim() || !contactRole.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createClient({
        name: name.trim(),
        slug: slug.trim(),
        industry: industry.trim() || undefined,
        mrr,
        billingCycle,
        primaryContact: {
          name: contactName.trim(),
          role: contactRole.trim(),
          email: contactEmail.trim() || undefined,
          phone: contactPhone.trim() || undefined,
        },
        profilePath: `~/clawd/clients/${slug.trim()}/PROFILE.md`,
      });
      router.push(`/clients/${slug.trim()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader />
      <div className="max-w-2xl mx-auto px-6 pb-8">
        <div className="mb-6">
          <Link href="/clients" className="text-gray-400 hover:text-gray-300 text-sm">
            &larr; Back to Clients
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-2">Onboard New Client</h2>
        <p className="text-gray-400 mb-8">
          Create a new client record. This will add them to the HQ dashboard and task board.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Info */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
              <h3 className="font-semibold">Client Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Client Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. SimsCo Mechanical & Plumbing"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Slug <span className="text-red-400">*</span>
                  <button
                    type="button"
                    onClick={() => setSlugManual(!slugManual)}
                    className="ml-2 text-xs text-amber-400 hover:text-amber-300"
                  >
                    {slugManual ? "(auto-generate)" : "(edit manually)"}
                  </button>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  disabled={!slugManual}
                  placeholder="auto-generated-from-name"
                  className={`w-full rounded-lg px-4 py-2 border focus:outline-none font-mono text-sm ${
                    slugManual
                      ? "bg-gray-800 text-white border-gray-700 focus:border-amber-500"
                      : "bg-gray-800/50 text-gray-400 border-gray-700/50"
                  }`}
                  required
                />
                <p className="text-gray-600 text-xs mt-1">
                  Used in URLs and file paths: /clients/{slug || "..."}
                </p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Industry</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. HVAC, Finance, Education"
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Revenue */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
              <h3 className="font-semibold">Revenue</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">MRR ($)</label>
                  <input
                    type="number"
                    value={mrr}
                    onChange={(e) => setMrr(Number(e.target.value))}
                    min="0"
                    step="100"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as typeof billingCycle)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Primary Contact */}
          <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
              <h3 className="font-semibold">Primary Contact</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Brad Sims"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="e.g. Owner, Marketing Director"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="brad@simsco.com"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              href="/clients"
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                saving
                  ? "bg-gray-700 text-gray-400 cursor-wait"
                  : "bg-amber-600 text-white hover:bg-amber-500"
              }`}
            >
              {saving ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
