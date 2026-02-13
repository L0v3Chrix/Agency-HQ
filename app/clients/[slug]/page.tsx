"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import PageHeader from "@/app/components/PageHeader";

// ============================================
// ADD CLIENT TASK MODAL
// ============================================

function AddClientTaskModal({
  clientId,
  domains,
  onClose,
}: {
  clientId: Id<"clients">;
  domains: any[];
  onClose: () => void;
}) {
  const createTask = useMutation(api.functions.createClientTask);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [domainId, setDomainId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createTask({
        clientId,
        title: title.trim(),
        description: description.trim(),
        priority,
        domainId: domainId ? (domainId as Id<"clientDomains">) : undefined,
      });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-4">Add Client Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as typeof priority)}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Domain</label>
              <select
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none"
              >
                <option value="">None</option>
                {domains.map((d: any) => (
                  <option key={d._id} value={d._id}>{d.displayName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className={`px-4 py-2 rounded-lg font-medium transition-colors ${saving ? "bg-gray-700 text-gray-400 cursor-wait" : "bg-amber-600 text-white hover:bg-amber-500"}`}>
              {saving ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// CLIENT TASK DETAIL MODAL (with comments)
// ============================================

function ClientTaskDetailModal({
  task,
  onClose,
}: {
  task: any;
  onClose: () => void;
}) {
  const messages = useQuery(api.functions.getTaskMessages, { taskId: task._id });
  const addComment = useMutation(api.functions.addTaskComment);
  const updateStatus = useMutation(api.functions.updateTaskStatus);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const priorityBadge: Record<string, string> = {
    low: "bg-blue-600",
    medium: "bg-amber-600",
    high: "bg-orange-600",
    urgent: "bg-red-600",
  };

  const statusColors: Record<string, string> = {
    inbox: "text-gray-400",
    assigned: "text-blue-400",
    in_progress: "text-amber-400",
    review: "text-purple-400",
    done: "text-green-400",
    blocked: "text-red-400",
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await addComment({
        taskId: task._id,
        taskType: "client",
        content: newComment.trim(),
      });
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({
        taskId: task._id,
        status: newStatus as any,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{task.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs text-white ${priorityBadge[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`text-sm font-medium ${statusColors[task.status] || "text-gray-400"}`}>
                {task.status.replace("_", " ")}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Description */}
        {task.description && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Status Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["inbox", "assigned", "in_progress", "review", "done", "blocked"].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={task.status === s}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                task.status === s
                  ? "bg-amber-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Comments */}
        <div className="border-t border-gray-800 pt-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Comments</h4>
          <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
            {messages && messages.length > 0 ? (
              [...messages].reverse().map((msg: any) => (
                <div key={msg._id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-400 text-sm font-medium">{msg.fromAgentName}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{msg.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">No comments yet</p>
            )}
          </div>

          {/* Add comment */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:border-amber-500 focus:outline-none text-sm"
            />
            <button
              onClick={handleAddComment}
              disabled={posting || !newComment.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                posting || !newComment.trim()
                  ? "bg-gray-700 text-gray-500"
                  : "bg-amber-600 text-white hover:bg-amber-500"
              }`}
            >
              {posting ? "..." : "Post"}
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-600">
          Created: {new Date(task.createdAt).toLocaleString()}
          {task.assignedTo && <span className="ml-4">Assigned to: {task.assignedTo}</span>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TASK CARD
// ============================================

function TaskCard({ task, onClick }: { task: any; onClick: () => void }) {
  const priorityBadge: Record<string, string> = {
    low: "bg-gray-600",
    medium: "bg-amber-600",
    high: "bg-orange-600",
    urgent: "bg-red-600",
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800/80 rounded-lg p-3 border border-gray-700/50 hover:border-amber-500/50 cursor-pointer transition-all hover:bg-gray-800 mb-2"
    >
      <h4 className="font-medium text-white text-sm leading-tight mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-gray-500 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded text-xs text-white ${priorityBadge[task.priority]}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
}

// ============================================
// KANBAN COLUMN
// ============================================

function TaskColumn({
  title,
  tasks,
  count,
  onTaskClick,
}: {
  title: string;
  tasks: any[];
  count: number;
  onTaskClick: (task: any) => void;
}) {
  return (
    <div className="flex-1 min-w-[180px]">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-semibold text-white text-sm">{title}</h4>
        <span className="bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-300">
          {count}
        </span>
      </div>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
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
// MAIN PAGE
// ============================================

export default function ClientDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const client = useQuery(api.functions.getClient, { slug });
  const domains = useQuery(api.functions.getClientDomains,
    client ? { clientId: client._id } : "skip"
  );
  const agents = useQuery(api.functions.getClientAgents,
    client ? { clientId: client._id } : "skip"
  );
  const tasksByStatus = useQuery(api.functions.getClientTasksByStatus,
    client ? { clientId: client._id } : "skip"
  );
  const activities = useQuery(api.functions.getClientActivities,
    client ? { clientId: client._id, limit: 20 } : "skip"
  );

  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  if (!client) {
    return (
      <>
        <PageHeader />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading client...</div>
        </div>
      </>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      setup: "bg-blue-500/20 text-blue-400",
      paused: "bg-yellow-500/20 text-yellow-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const totalTasks = tasksByStatus ?
    Object.values(tasksByStatus).flat().length : 0;

  return (
    <>
      <PageHeader />
      <div className="max-w-7xl mx-auto px-6 pb-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/clients" className="text-gray-400 hover:text-gray-300">
                &larr; Clients
              </Link>
            </div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-gray-400">{client.industry}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              ${client.revenue.mrr.toLocaleString()}/mo
            </div>
            <div className="text-sm text-gray-400">
              {client.revenue.billingCycle} billing
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
            <p className="text-gray-400 text-sm">Health Score</p>
            <p className={`text-2xl font-bold ${
              client.health.score >= 80 ? 'text-green-400' :
              client.health.score >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {client.health.score}%
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-2xl font-bold text-white capitalize">{client.status}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
            <p className="text-gray-400 text-sm">Domains</p>
            <p className="text-2xl font-bold text-blue-400">{domains?.length || 0}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
            <p className="text-gray-400 text-sm">Team Size</p>
            <p className="text-2xl font-bold text-purple-400">{agents?.length || 0}</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Domains + Team */}
          <div className="space-y-6">
            {/* Domains */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-medium mb-4">Domains</h3>
              {domains && domains.length > 0 ? (
                <div className="space-y-3">
                  {domains.map((domain: any) => (
                    <div
                      key={domain._id}
                      className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{domain.displayName}</span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(domain.status)}`}>
                          {domain.status}
                        </span>
                      </div>
                      {domain.metrics && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${domain.metrics.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{domain.metrics.progress || 0}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No domains configured</p>
              )}
            </div>

            {/* Client Team */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-medium mb-4">Client Team</h3>
              {agents && agents.length > 0 ? (
                <div className="space-y-3">
                  {agents.map((agent: any) => (
                    <div
                      key={agent._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50"
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === 'active' ? 'bg-green-500 animate-pulse' :
                        agent.status === 'blocked' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium text-amber-400">{agent.name}</span>
                        {agent.level && (
                          <span className="ml-2 px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">
                            {agent.level}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No agents assigned</p>
              )}
            </div>

            {/* Contacts */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-medium mb-4">Contacts</h3>
              <div className="space-y-3">
                {client.contacts.map((contact: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      {contact.name[0]}
                    </div>
                    <div>
                      <div className="font-medium">
                        {contact.name}
                        {contact.primary && (
                          <span className="ml-2 text-xs text-amber-400">Primary</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{contact.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Task Board + Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Board (Kanban) */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Task Board</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{totalTasks} total</span>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    + Add Task
                  </button>
                </div>
              </div>
              {tasksByStatus ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
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
              ) : (
                <p className="text-gray-400">Loading tasks...</p>
              )}
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              {activities && activities.length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {activities.map((activity: any) => (
                    <div
                      key={activity._id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="text-gray-500 whitespace-nowrap text-xs">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </div>
                      <div className="text-gray-300">{activity.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddTask && client && (
        <AddClientTaskModal
          clientId={client._id}
          domains={domains || []}
          onClose={() => setShowAddTask(false)}
        />
      )}
      {selectedTask && (
        <ClientTaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}
