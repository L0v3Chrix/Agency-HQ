"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import PageHeader from "@/app/components/PageHeader";

export default function SettingsPage() {
  const agency = useQuery(api.functions.getAgency);
  const updateAgency = useMutation(api.functions.updateAgency);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Controlled form state
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [defaultHeartbeatInterval, setDefaultHeartbeatInterval] = useState(15);
  const [capacityAlertThreshold, setCapacityAlertThreshold] = useState(85);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState(80);

  // Populate form when agency data loads
  useEffect(() => {
    if (agency) {
      setName(agency.name || "");
      setOwnerName(agency.ownerName || "");
      setTimezone(agency.timezone || "America/Chicago");
      setDefaultHeartbeatInterval(agency.settings?.defaultHeartbeatInterval || 15);
      setCapacityAlertThreshold(agency.settings?.capacityAlertThreshold || 85);
      setBudgetAlertThreshold(agency.settings?.budgetAlertThreshold || 80);
    }
  }, [agency]);

  const handleSave = async () => {
    if (!agency) return;
    setSaving(true);
    setError("");
    try {
      await updateAgency({
        name,
        ownerName,
        timezone,
        settings: {
          defaultHeartbeatInterval,
          capacityAlertThreshold,
          budgetAlertThreshold,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader />
      <div className="max-w-4xl mx-auto px-6 pb-8 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Settings</h2>
          <p className="text-gray-400">Agency configuration and preferences</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Agency Info */}
        <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
            <h3 className="font-semibold">Agency Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Agency Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              >
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/Denver">Mountain (MT)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </section>

        {/* Agent Settings */}
        <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
            <h3 className="font-semibold">Agent Configuration</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Default Heartbeat Interval (minutes)</label>
              <input
                type="number"
                value={defaultHeartbeatInterval}
                onChange={(e) => setDefaultHeartbeatInterval(Number(e.target.value))}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-gray-500 text-xs mt-1">How often agents check in by default</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Capacity Alert Threshold (%)</label>
              <input
                type="number"
                value={capacityAlertThreshold}
                onChange={(e) => setCapacityAlertThreshold(Number(e.target.value))}
                min="50"
                max="100"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-gray-500 text-xs mt-1">Alert when capacity utilization exceeds this</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Budget Alert Threshold (%)</label>
              <input
                type="number"
                value={budgetAlertThreshold}
                onChange={(e) => setBudgetAlertThreshold(Number(e.target.value))}
                min="50"
                max="100"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              />
              <p className="text-gray-500 text-xs mt-1">Alert when budget usage exceeds this</p>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Agent Errors</p>
                <p className="text-gray-500 text-sm">Get notified when an agent encounters an error</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Escalations</p>
                <p className="text-gray-500 text-sm">Get notified when agents escalate issues</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Client Health Alerts</p>
                <p className="text-gray-500 text-sm">Get notified when client health drops below 70%</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Standup Summary</p>
                <p className="text-gray-500 text-sm">Receive morning standup report</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <p className="text-gray-600 text-xs pt-2 border-t border-gray-800">
              Notification toggle persistence coming in a future update.
            </p>
          </div>
        </section>

        {/* Integrations */}
        <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
            <h3 className="font-semibold">Integrations</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <p className="font-medium">Convex</p>
                  <p className="text-gray-500 text-sm">Real-time database</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <div>
                  <p className="font-medium">Clawdbot</p>
                  <p className="text-gray-500 text-sm">Agent runtime</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">W</span>
                </div>
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-gray-500 text-sm">Communication channel</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Connected</span>
            </div>
          </div>
        </section>

        {/* System Info */}
        <section className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
            <h3 className="font-semibold">System Information</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Version</p>
                <p className="text-white">1.0.0</p>
              </div>
              <div>
                <p className="text-gray-400">Environment</p>
                <p className="text-white">Production</p>
              </div>
              <div>
                <p className="text-gray-400">Database</p>
                <p className="text-white">Convex</p>
              </div>
              <div>
                <p className="text-gray-400">Last Deployment</p>
                <p className="text-white">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              saved
                ? "bg-green-700 text-green-200"
                : saving
                ? "bg-gray-700 text-gray-400 cursor-wait"
                : "bg-amber-600 text-white hover:bg-amber-500"
            }`}
          >
            {saved ? "Saved" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
