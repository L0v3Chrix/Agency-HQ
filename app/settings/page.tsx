"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function SettingsPage() {
  const agency = useQuery(api.functions.getAgency);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-gray-400">Agency configuration and preferences</p>
      </div>

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
              defaultValue={agency?.name || "Raize The Vibe"}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Owner Name</label>
            <input
              type="text"
              defaultValue={agency?.ownerName || "Chrix"}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Timezone</label>
            <select
              defaultValue={agency?.timezone || "America/Chicago"}
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
              defaultValue={agency?.settings?.defaultHeartbeatInterval || 15}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-gray-500 text-xs mt-1">How often agents check in by default</p>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Capacity Alert Threshold (%)</label>
            <input
              type="number"
              defaultValue={agency?.settings?.capacityAlertThreshold || 85}
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
              defaultValue={agency?.settings?.budgetAlertThreshold || 80}
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
                <span className="text-white font-bold">🤖</span>
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
                <span className="text-white">📱</span>
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
          className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors font-medium"
        >
          {saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
