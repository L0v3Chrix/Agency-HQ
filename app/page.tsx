"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "../convex/_generated/dataModel";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ============================================
// STYLES & CONSTANTS
// ============================================

const statusDot: Record<string, string> = {
  idle: "bg-gray-400",
  active: "bg-green-500 animate-pulse",
  blocked: "bg-red-500",
  offline: "bg-gray-600",
};

const priorityBadge: Record<string, string> = {
  low: "bg-blue-600",
  medium: "bg-amber-600",
  high: "bg-orange-600",
  urgent: "bg-red-600",
};

const priorityText: Record<string, string> = {
  low: "LOW",
  medium: "MEDIUM", 
  high: "HIGH",
  urgent: "URGENT",
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatTime(timestamp: number | undefined) {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// ============================================
// AGENT CARD COMPONENT
// ============================================

// Agent avatar mapping
const agentAvatars: Record<string, string> = {
  "Daniel": "/images/agents/daniel.png",
  "Foreman": "/images/agents/foreman.png",
  "Growth": "/images/agents/growth.png",
  "Creative": "/images/agents/creative.png",
  "Builder": "/images/agents/builder.png",
  "Research": "/images/agents/research.png",
};

function AgentCard({ agent }: { agent: any }) {
  const schedules: Record<string, string> = {
    "Daniel": "Continuous",
    "Foreman": ":00 hourly",
    "PM": ":10 hourly",
    "Growth": ":20 hourly",
    "Creative": ":30 hourly",
    "Builder": ":40 hourly",
    "Research": ":50 hourly",
  };

  const avatarSrc = agentAvatars[agent.name];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-amber-500/30 transition-colors group">
      <div className="flex items-center gap-3 mb-2">
        {avatarSrc ? (
          <div className="relative">
            <img 
              src={avatarSrc} 
              alt={agent.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-amber-500/50 transition-colors"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${statusDot[agent.status]}`} />
          </div>
        ) : (
          <div className={`w-2.5 h-2.5 rounded-full ${statusDot[agent.status]}`} />
        )}
        <div>
          <h3 className="font-semibold text-amber-400">{agent.name}</h3>
          <p className="text-gray-400 text-xs">{agent.role}</p>
        </div>
      </div>
      <p className="text-gray-500 text-xs">
        Last seen: {formatTime(agent.lastHeartbeat)}
      </p>
      <p className="text-gray-600 text-xs">
        {schedules[agent.name] || "On demand"}
      </p>
    </div>
  );
}

// ============================================
// TASK CARD COMPONENT
// ============================================

function TaskCard({ task, onClick }: { task: any; onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-gray-800/80 rounded-lg p-3 border border-gray-700/50 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-gray-800 mb-2"
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="font-medium text-white text-sm leading-tight">{task.title}</h4>
      </div>
      {task.description && (
        <p className="text-gray-500 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded text-xs text-white ${priorityBadge[task.priority]}`}>
          {task.priority}
        </span>
        {task.assignee && (
          <span className="text-amber-400/70 text-xs">→ {task.assignee.name}</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// TASK COLUMN COMPONENT
// ============================================

function TaskColumn({ title, tasks, count, onTaskClick }: { 
  title: string; 
  tasks: any[]; 
  count: number;
  onTaskClick: (task: any) => void;
}) {
  return (
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <span className="bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-300">
          {count}
        </span>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-4">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// TASK DETAIL MODAL
// ============================================

function TaskDetailModal({ task, agents, onClose }: { 
  task: any; 
  agents: any[];
  onClose: () => void;
}) {
  const updateStatus = useMutation(api.functions.updateAgencyTaskStatus);
  const postComment = useMutation(api.functions.postAgentMessage);
  const messages = useQuery(api.functions.getTaskMessages, { taskId: task._id });
  const [comment, setComment] = useState("");
  
  const handleStatusChange = async (newStatus: string) => {
    await updateStatus({ taskId: task._id, status: newStatus as any });
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    await postComment({
      fromSessionKey: "human:chrix",
      fromAgentName: "Chrix",
      messageType: "comment",
      content: comment,
      taskId: task._id,
      taskType: "agency",
    });
    setComment("");
  };

  const statusButtons = ["Inbox", "Assigned", "In Progress", "Review", "Done"];
  const statusMap: Record<string, string> = {
    "Inbox": "inbox",
    "Assigned": "assigned", 
    "In Progress": "in_progress",
    "Review": "review",
    "Done": "done"
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${priorityBadge[task.priority]}`}>
              {priorityText[task.priority]}
            </span>
            <span className="text-gray-400 text-sm">{task.status.replace('_', ' ')}</span>
            {task.assignee && (
              <span className="text-amber-400 text-sm">→ {task.assignee.name}</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>

        {/* Title */}
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">{task.title}</h2>
        </div>

        {/* Description */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Description</span>
            <button className="text-amber-400 text-sm hover:text-amber-300">Edit</button>
          </div>
          <p className="text-gray-300 text-sm">
            {task.description || "No description yet. Click Edit to add one."}
          </p>
        </div>

        {/* Move To */}
        <div className="p-4 border-b border-gray-800">
          <span className="text-gray-400 text-sm block mb-3">Move to</span>
          <div className="flex gap-2 flex-wrap">
            {statusButtons.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(statusMap[status])}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  task.status === statusMap[status]
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Timestamps */}
        <div className="px-4 py-2 text-gray-500 text-xs border-b border-gray-800">
          Created: {formatTimestamp(task.createdAt)}
          {task.updatedAt !== task.createdAt && (
            <span className="ml-4">Updated: {formatTimestamp(task.updatedAt)}</span>
          )}
        </div>

        {/* Comments */}
        <div className="p-4">
          <h3 className="text-gray-400 text-sm mb-3">
            Comments ({messages?.length || 0})
          </h3>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
            {messages && messages.length > 0 ? (
              messages.map((msg: any) => (
                <div key={msg._id} className="border-l-2 border-gray-700 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 font-medium text-sm">{msg.fromAgentName}</span>
                    <span className="text-gray-500 text-xs">{formatTimestamp(msg.createdAt)}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{msg.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm italic">No comments yet</p>
            )}
          </div>

          {/* Add Comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={handleComment}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ADD TASK MODAL
// ============================================

function AddTaskModal({ onClose, agents }: { onClose: () => void; agents: any[] }) {
  const createTask = useMutation(api.functions.createAgencyTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask({
      title,
      description,
      priority: priority as any,
      assigneeId: assigneeId ? assigneeId as Id<"agencyAgents"> : undefined,
    });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-md border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Add Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 h-24 border border-gray-700 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Assign To</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="">Unassigned (Inbox)</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} - {agent.role}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors font-medium"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// ACTIVITY ITEM COMPONENT
// ============================================

function ActivityItem({ activity }: { activity: any }) {
  const icons: Record<string, string> = {
    task_created: "📋",
    task_completed: "✅",
    task_blocked: "🚫",
    milestone_reached: "🚀",
    insight_generated: "💡",
    escalation: "⚠️",
    agent_error: "❌",
  };

  return (
    <div className="flex gap-3 py-2">
      <span className="text-lg">{icons[activity.type] || "📌"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-gray-300 text-sm leading-tight">{activity.message}</p>
        <p className="text-gray-500 text-xs mt-0.5">{formatTime(activity.createdAt)}</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({ title, value, subtitle, color = "amber" }: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "amber" | "green" | "blue" | "red";
}) {
  const colorClasses = {
    amber: "text-amber-400",
    green: "text-green-400",
    blue: "text-blue-400",
    red: "text-red-400",
  };
  
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

// ============================================
// CAPACITY GAUGE COMPONENT
// ============================================

function CapacityGauge({ utilization }: { utilization: number }) {
  const getColor = (val: number) => {
    if (val < 60) return "bg-green-500";
    if (val < 85) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
      <p className="text-gray-400 text-sm mb-2">Capacity Utilization</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getColor(utilization)} transition-all duration-500`}
            style={{ width: `${utilization}%` }}
          />
        </div>
        <span className={`text-lg font-bold ${
          utilization < 60 ? 'text-green-400' : 
          utilization < 85 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {utilization}%
        </span>
      </div>
      <p className="text-gray-500 text-xs mt-2">
        {utilization < 60 ? "Good capacity available" :
         utilization < 85 ? "Moderate workload" : "Near capacity - consider scaling"}
      </p>
    </div>
  );
}

// ============================================
// CLIENT HEALTH LIST COMPONENT
// ============================================

function ClientHealthList({ clients }: { clients: any[] }) {
  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy": return "🟢";
      case "warning": return "🟡";
      case "critical": return "🔴";
      default: return "⚪";
    }
  };
  
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-400 text-sm">Client Health</p>
        <Link href="/clients" className="text-amber-400 text-xs hover:text-amber-300">View All →</Link>
      </div>
      {clients.length > 0 ? (
        <div className="space-y-2">
          {clients.slice(0, 5).map((client) => (
            <Link
              key={client._id}
              href={`/clients/${client.slug}`}
              className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{getHealthIcon(client.healthStatus)}</span>
                <span className="text-white text-sm">{client.name}</span>
              </div>
              <span className="text-gray-400 text-xs">{client.healthScore}%</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">No active clients</p>
      )}
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function Dashboard() {
  const stats = useQuery(api.functions.getDashboardStats);
  const agents = useQuery(api.functions.getAgencyAgents);
  const tasksByStatus = useQuery(api.functions.getAgencyTasksByStatus);
  const activities = useQuery(api.functions.getActivities, { limit: 30 });
  const clientHealth = useQuery(api.functions.getClientHealthSummary);
  
  const wakeAgent = useMutation(api.functions.wakeAgent);
  const pathname = usePathname();

  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [wakeStatus, setWakeStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [wakedAgent, setWakedAgent] = useState("");
  const [showWakeMenu, setShowWakeMenu] = useState(false);

  // Close wake menu on outside click
  const wakeMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wakeMenuRef.current && !wakeMenuRef.current.contains(event.target as Node)) {
        setShowWakeMenu(false);
      }
    }
    if (showWakeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWakeMenu]);
  
  // Debug logging
  console.log("[A.G.E HQ] Query results:", { 
    stats, 
    agentsCount: agents?.length,
    tasksLoaded: !!tasksByStatus,
    clientHealthCount: clientHealth?.length 
  });
  
  if (!stats || !agents || !tasksByStatus) {
    console.log("[A.G.E HQ] Still loading...", { stats: !!stats, agents: !!agents, tasksByStatus: !!tasksByStatus });
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-amber-400 text-xl">Loading A.G.E HQ...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 relative overflow-hidden">
        {/* Subtle hero banner background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/images/hero-banner.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="max-w-[1600px] mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <img 
              src="/images/age-hq-logo.png" 
              alt="A.G.E HQ" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-amber-400">A.G.E HQ</h1>
              <p className="text-gray-500 text-sm">Raize The Vibe Command Center</p>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            {[
              { href: "/", label: "Dashboard" },
              { href: "/clients", label: "Clients" },
              { href: "/agents", label: "Agents" },
              { href: "/settings", label: "Settings" },
            ].map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${isActive ? "text-amber-400 font-medium" : "text-gray-400 hover:text-white"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {/* Wake Agent Dropdown */}
            <div className="relative" ref={wakeMenuRef}>
              <button
                onClick={() => wakeStatus === "idle" && setShowWakeMenu(!showWakeMenu)}
                disabled={wakeStatus !== "idle"}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  wakeStatus === "sent"
                    ? "bg-green-700 text-green-200 cursor-default"
                    : wakeStatus === "sending"
                    ? "bg-gray-700 text-gray-400 cursor-wait"
                    : "bg-gray-700 hover:bg-amber-700 text-amber-400 hover:text-white border border-amber-600/50"
                }`}
              >
                {wakeStatus === "sent" ? `✓ ${wakedAgent} Alerted` : wakeStatus === "sending" ? "Waking..." : "⚡ Wake Agent"}
              </button>
              {showWakeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {["Foreman", "PM", "Builder", "Creative", "Growth", "Research", "Daniel"].map((name) => (
                    <button
                      key={name}
                      onClick={async () => {
                        setShowWakeMenu(false);
                        setWakeStatus("sending");
                        setWakedAgent(name);
                        try {
                          await wakeAgent({ agentName: name, reason: `Owner requested ${name} check the board from HQ` });
                          setWakeStatus("sent");
                          setTimeout(() => setWakeStatus("idle"), 3000);
                        } catch {
                          setWakeStatus("idle");
                        }
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-amber-600/20 hover:text-amber-400 transition-colors"
                    >
                      ⚡ {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Add Task
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Monthly Revenue" 
            value={`$${stats.totalMrr.toLocaleString()}`}
            subtitle="recurring"
            color="green"
          />
          <StatCard 
            title="Active Clients" 
            value={stats.activeClients}
            subtitle={`of ${stats.totalClients} total`}
            color="blue"
          />
          <StatCard 
            title="Active Tasks" 
            value={stats.activeTasks}
            subtitle="in progress"
            color="amber"
          />
          <CapacityGauge utilization={stats.capacityUtilization || 0} />
        </section>
        
        {/* Client Health + Agents Row */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Client Health */}
          <div className="lg:col-span-1">
            <ClientHealthList clients={clientHealth || []} />
          </div>
          
          {/* Agents */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-white mb-4">Agents</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {agents.map((agent) => (
                <AgentCard key={agent._id} agent={agent} />
              ))}
            </div>
          </div>
        </section>

        {/* Main Content: Tasks + Activity */}
        <div className="flex gap-6">
          {/* Tasks Section */}
          <section className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-4">Tasks</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              <TaskColumn 
                title="Inbox" 
                tasks={tasksByStatus.inbox || []} 
                count={tasksByStatus.inbox?.length || 0}
                onTaskClick={setSelectedTask}
              />
              <TaskColumn 
                title="Assigned" 
                tasks={tasksByStatus.assigned || []} 
                count={tasksByStatus.assigned?.length || 0}
                onTaskClick={setSelectedTask}
              />
              <TaskColumn 
                title="In Progress" 
                tasks={tasksByStatus.in_progress || []} 
                count={tasksByStatus.in_progress?.length || 0}
                onTaskClick={setSelectedTask}
              />
              <TaskColumn 
                title="Review" 
                tasks={tasksByStatus.review || []} 
                count={tasksByStatus.review?.length || 0}
                onTaskClick={setSelectedTask}
              />
              <TaskColumn 
                title="Done" 
                tasks={tasksByStatus.done || []} 
                count={tasksByStatus.done?.length || 0}
                onTaskClick={setSelectedTask}
              />
            </div>
          </section>

          {/* Activity Feed */}
          <aside className="w-80 flex-shrink-0">
            <h2 className="text-lg font-semibold text-white mb-4">Activity</h2>
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 max-h-[500px] overflow-y-auto">
              {activities && activities.length > 0 ? (
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <ActivityItem key={activity._id} activity={activity} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm text-center py-8">
                  No activity yet
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
      
      {/* Modals */}
      {showAddTask && (
        <AddTaskModal onClose={() => setShowAddTask(false)} agents={agents} />
      )}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          agents={agents}
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
}
