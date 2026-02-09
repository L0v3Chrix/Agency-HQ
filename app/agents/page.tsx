"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function AgentsPage() {
  const agencyAgents = useQuery(api.functions.getAgencyAgents) || [];
  const clients = useQuery(api.functions.getClients, {}) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 animate-pulse";
      case "idle": return "bg-gray-400";
      case "blocked": return "bg-red-500";
      case "offline": return "bg-gray-700";
      default: return "bg-gray-600";
    }
  };

  const getLevelBadge = (level?: string) => {
    const colors: Record<string, string> = {
      L1: "bg-gray-500/20 text-gray-400",
      L2: "bg-blue-500/20 text-blue-400",
      L3: "bg-purple-500/20 text-purple-400",
      L4: "bg-amber-500/20 text-amber-400",
    };
    return level ? colors[level] || colors.L1 : colors.L1;
  };

  const getLevelName = (level?: string) => {
    const names: Record<string, string> = {
      L1: "Observer",
      L2: "Advisor",
      L3: "Operator",
      L4: "Autonomous",
    };
    return level ? names[level] || "Unknown" : "Not Set";
  };

  const formatLastHeartbeat = (timestamp?: number) => {
    if (!timestamp) return "Never";
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const schedules: Record<string, string> = {
    "Daniel": "Continuous",
    "Foreman": ":00 hourly",
    "PM": ":10 hourly",
    "Growth": ":20 hourly",
    "Creative": ":30 hourly",
    "Builder": ":40 hourly",
    "Research": ":50 hourly",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Agents</h2>
          <p className="text-gray-400">Your AI agent team — agency and client agents</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-gray-400">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-400">Blocked</span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm">Total Agents</p>
          <p className="text-2xl font-bold text-white">{agencyAgents.length}</p>
          <p className="text-gray-500 text-xs">agency level</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm">Active Now</p>
          <p className="text-2xl font-bold text-green-400">
            {agencyAgents.filter(a => a.status === "active").length}
          </p>
          <p className="text-gray-500 text-xs">currently working</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm">Tasks Completed</p>
          <p className="text-2xl font-bold text-blue-400">
            {agencyAgents.reduce((sum, a) => sum + (a.metrics?.tasksCompleted || 0), 0)}
          </p>
          <p className="text-gray-500 text-xs">all time</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm">Avg Error Rate</p>
          <p className="text-2xl font-bold text-amber-400">
            {(agencyAgents.reduce((sum, a) => sum + (a.metrics?.errorRate || 0), 0) / Math.max(agencyAgents.length, 1)).toFixed(1)}%
          </p>
          <p className="text-gray-500 text-xs">lower is better</p>
        </div>
      </div>

      {/* Agency Agents */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Agency Agents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencyAgents.map((agent) => (
            <div 
              key={agent._id} 
              className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-amber-500/30 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                  <div>
                    <h4 className="font-semibold text-amber-400">{agent.name}</h4>
                    <p className="text-gray-400 text-sm">{agent.role}</p>
                  </div>
                </div>
                {agent.level && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadge(agent.level)}`}>
                    {agent.level} · {getLevelName(agent.level)}
                  </span>
                )}
              </div>
              
              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Session Key</span>
                  <code className="text-gray-500 text-xs">{agent.sessionKey}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Schedule</span>
                  <span className="text-gray-300">{schedules[agent.name] || "On demand"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Heartbeat</span>
                  <span className={agent.lastHeartbeat && Date.now() - agent.lastHeartbeat < 3600000 ? "text-green-400" : "text-gray-500"}>
                    {formatLastHeartbeat(agent.lastHeartbeat)}
                  </span>
                </div>
                {agent.metrics && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tasks Completed</span>
                      <span className="text-gray-300">{agent.metrics.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Error Rate</span>
                      <span className={agent.metrics.errorRate < 5 ? "text-green-400" : "text-red-400"}>
                        {agent.metrics.errorRate}%
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Skills */}
              {agent.skills && agent.skills.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-800">
                  <p className="text-gray-400 text-xs mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.skills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Client Agents by Client */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Client Agents</h3>
        {clients.length > 0 ? (
          <div className="space-y-4">
            {clients.map((client) => (
              <ClientAgentSection key={client._id} client={client} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
            <p className="text-gray-500">No clients onboarded yet.</p>
            <p className="text-gray-600 text-sm mt-2">
              Client agents are created during Phase 4 (Client Onboarding).
            </p>
          </div>
        )}
      </section>

      {/* Level Reference */}
      <section className="mt-12 pt-8 border-t border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Agent Levels Reference</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadge("L1")}`}>L1</span>
            <h4 className="font-medium mt-2">Observer</h4>
            <p className="text-gray-500 text-sm mt-1">Perform assigned tasks, cannot take independent action</p>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadge("L2")}`}>L2</span>
            <h4 className="font-medium mt-2">Advisor</h4>
            <p className="text-gray-500 text-sm mt-1">Recommend actions, execute on approval</p>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadge("L3")}`}>L3</span>
            <h4 className="font-medium mt-2">Operator</h4>
            <p className="text-gray-500 text-sm mt-1">Autonomous within guardrails, daily reports</p>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelBadge("L4")}`}>L4</span>
            <h4 className="font-medium mt-2">Autonomous</h4>
            <p className="text-gray-500 text-sm mt-1">Full authority over permissioned domains</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Client Agent Section Component
function ClientAgentSection({ client }: { client: any }) {
  const agents = useQuery(api.functions.getClientAgents, { clientId: client._id }) || [];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 animate-pulse";
      case "idle": return "bg-gray-400";
      case "blocked": return "bg-red-500";
      default: return "bg-gray-600";
    }
  };

  const getLevelBadge = (level?: string) => {
    const colors: Record<string, string> = {
      L1: "bg-gray-500/20 text-gray-400",
      L2: "bg-blue-500/20 text-blue-400",
      L3: "bg-purple-500/20 text-purple-400",
      L4: "bg-amber-500/20 text-amber-400",
    };
    return level ? colors[level] || colors.L1 : colors.L1;
  };
  
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 bg-gray-800/50 flex items-center justify-between">
        <Link href={`/clients/${client.slug}`} className="font-medium hover:text-amber-400">
          {client.name}
        </Link>
        <span className="text-gray-500 text-sm">{agents.length} agent{agents.length !== 1 ? 's' : ''}</span>
      </div>
      {agents.length > 0 ? (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((agent) => (
            <div key={agent._id} className="bg-gray-800/30 rounded-lg p-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{agent.name}</p>
                <p className="text-gray-500 text-xs truncate">{agent.sessionKey}</p>
              </div>
              {agent.level && (
                <span className={`px-2 py-0.5 rounded text-xs ${getLevelBadge(agent.level)}`}>
                  {agent.level}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 text-sm">
          No agents configured for this client yet
        </div>
      )}
    </div>
  );
}
