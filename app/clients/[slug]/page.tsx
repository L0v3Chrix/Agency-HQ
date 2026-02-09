"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

// Task Card Component for Kanban
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

// Kanban Column Component
function TaskColumn({ title, tasks, count }: { 
  title: string; 
  tasks: any[]; 
  count: number;
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
            <TaskCard key={task._id} task={task} onClick={() => {}} />
          ))
        )}
      </div>
    </div>
  );
}

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

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading client...</div>
      </div>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/clients" className="text-gray-400 hover:text-gray-300">
              ← Clients
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
                {domains.map((domain) => (
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
                {agents.map((agent) => (
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
              {client.contacts.map((contact, i) => (
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
              <span className="text-sm text-gray-400">{totalTasks} total</span>
            </div>
            {tasksByStatus ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                <TaskColumn 
                  title="Inbox" 
                  tasks={tasksByStatus.inbox || []} 
                  count={tasksByStatus.inbox?.length || 0}
                />
                <TaskColumn 
                  title="Assigned" 
                  tasks={tasksByStatus.assigned || []} 
                  count={tasksByStatus.assigned?.length || 0}
                />
                <TaskColumn 
                  title="In Progress" 
                  tasks={tasksByStatus.in_progress || []} 
                  count={tasksByStatus.in_progress?.length || 0}
                />
                <TaskColumn 
                  title="Review" 
                  tasks={tasksByStatus.review || []} 
                  count={tasksByStatus.review?.length || 0}
                />
                <TaskColumn 
                  title="Done" 
                  tasks={tasksByStatus.done || []} 
                  count={tasksByStatus.done?.length || 0}
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
                {activities.map((activity) => (
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
  );
}
