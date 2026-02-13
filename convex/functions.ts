import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// AGENCY QUERIES
// ============================================

export const getAgency = query({
  handler: async (ctx) => {
    return await ctx.db.query("agency").first();
  },
});

export const getAgencyAgents = query({
  handler: async (ctx) => {
    return await ctx.db.query("agencyAgents").collect();
  },
});

export const getAgencyTasks = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query("agencyTasks")
        .filter((q) => q.eq(q.field("status"), args.status))
        .collect();
    }
    return await ctx.db.query("agencyTasks").collect();
  },
});

// ============================================
// CLIENT QUERIES
// ============================================

export const getClients = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db.query("clients")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .collect();
    }
    return await ctx.db.query("clients").collect();
  },
});

export const getClient = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("clients")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getClientTasks = query({
  args: { clientId: v.id("clients"), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let tasksQuery = ctx.db.query("clientTasks")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId));
    
    const tasks = await tasksQuery.collect();
    
    if (args.status) {
      return tasks.filter(t => t.status === args.status);
    }
    return tasks;
  },
});

export const getClientDomains = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.query("clientDomains")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

export const getClientAgent = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.query("clientAgents")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .first();
  },
});

export const getClientAgents = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.query("clientAgents")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

// ============================================
// ACTIVITY QUERIES
// ============================================

export const getActivities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db.query("activities")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
  },
});

export const getClientActivities = query({
  args: { clientId: v.id("clients"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    return await ctx.db.query("activities")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .take(limit);
  },
});

// ============================================
// DASHBOARD AGGREGATES
// ============================================

export const getDashboardStats = query({
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    const activeClients = clients.filter(c => c.status === "active");
    const totalMrr = activeClients.reduce((sum, c) => sum + c.revenue.mrr, 0);
    
    const agents = await ctx.db.query("agencyAgents").collect();
    const activeAgents = agents.filter(a => a.status === "active").length;
    
    const allTasks = await ctx.db.query("clientTasks").collect();
    const agencyTasks = await ctx.db.query("agencyTasks").collect();
    const activeTasks = allTasks.filter(t => 
      t.status === "in_progress" || t.status === "assigned"
    ).length;
    const activeAgencyTasks = agencyTasks.filter(t =>
      t.status === "in_progress" || t.status === "assigned"
    ).length;
    
    const avgHealth = activeClients.length > 0 
      ? activeClients.reduce((sum, c) => sum + c.health.score, 0) / activeClients.length
      : 0;
    
    // Capacity calculation: tasks per agent (lower is better capacity)
    // Base capacity: 5 tasks per agent is 100% utilization
    const totalActiveTasks = activeTasks + activeAgencyTasks;
    const capacityPerAgent = 5;
    const maxCapacity = agents.length * capacityPerAgent;
    const capacityUtilization = maxCapacity > 0 
      ? Math.min(Math.round((totalActiveTasks / maxCapacity) * 100), 100)
      : 0;
    
    return {
      totalClients: clients.length,
      activeClients: activeClients.length,
      totalMrr,
      activeAgents,
      totalAgents: agents.length,
      activeTasks: totalActiveTasks,
      avgHealth: Math.round(avgHealth),
      capacityUtilization,
      capacityAvailable: 100 - capacityUtilization,
    };
  },
});

// Client health summary for dashboard
export const getClientHealthSummary = query({
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    
    return clients
      .filter(c => c.status === "active" || c.status === "at_risk")
      .map(c => ({
        _id: c._id,
        slug: c.slug,
        name: c.name,
        healthScore: c.health.score,
        healthStatus: c.health.score >= 80 ? "healthy" : c.health.score >= 60 ? "warning" : "critical",
        status: c.status,
        mrr: c.revenue.mrr,
      }))
      .sort((a, b) => a.healthScore - b.healthScore); // Show lowest health first
  },
});

// Client tasks by status (for Kanban board)
export const getClientTasksByStatus = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("clientTasks")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    
    const clientAgents = await ctx.db.query("clientAgents")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
    
    const agentMap = new Map(clientAgents.map(a => [a._id, a]));
    
    const enrichedTasks = tasks.map(task => ({
      ...task,
      assignee: task.assigneeId ? agentMap.get(task.assigneeId) : null,
    }));
    
    return {
      inbox: enrichedTasks.filter(t => t.status === "inbox"),
      assigned: enrichedTasks.filter(t => t.status === "assigned"),
      in_progress: enrichedTasks.filter(t => t.status === "in_progress"),
      review: enrichedTasks.filter(t => t.status === "review"),
      done: enrichedTasks.filter(t => t.status === "done"),
      blocked: enrichedTasks.filter(t => t.status === "blocked"),
    };
  },
});

// ============================================
// MUTATIONS
// ============================================

export const initializeAgency = mutation({
  args: {
    name: v.string(),
    ownerName: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("agency").first();
    if (existing) return existing._id;
    
    return await ctx.db.insert("agency", {
      name: args.name,
      ownerName: args.ownerName,
      timezone: args.timezone,
      createdAt: Date.now(),
      settings: {
        defaultHeartbeatInterval: 15,
        budgetAlertThreshold: 80,
        capacityAlertThreshold: 85,
      },
    });
  },
});

export const createAgencyAgent = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    sessionKey: v.string(),
    soulPath: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agencyAgents", {
      ...args,
      status: "idle",
      metrics: {
        tasksCompleted: 0,
        avgTaskDuration: 0,
        errorRate: 0,
      },
    });
  },
});

export const createClient = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    industry: v.optional(v.string()),
    mrr: v.number(),
    billingCycle: v.union(
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("annual")
    ),
    primaryContact: v.object({
      name: v.string(),
      role: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
    }),
    profilePath: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("clients", {
      slug: args.slug,
      name: args.name,
      industry: args.industry,
      status: "active",
      lifecycleStage: {
        current: "active",
        since: now,
        history: [{ stage: "active", from: now }],
      },
      revenue: {
        mrr: args.mrr,
        currency: "USD",
        billingCycle: args.billingCycle,
      },
      health: {
        score: 100,
        indicators: [],
        lastUpdated: now,
      },
      contacts: [{
        ...args.primaryContact,
        primary: true,
      }],
      profilePath: args.profilePath,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createClientDomain = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    displayName: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("setup")
    ),
    priority: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    configPath: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clientDomains", {
      ...args,
      metrics: {
        progress: 0,
        tasksCompleted: 0,
        tasksPending: 0,
      },
    });
  },
});

export const deleteClient = mutation({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.clientId);
  },
});

export const createClientAgent = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    role: v.string(),
    sessionKey: v.string(),
    soulPath: v.string(),
    level: v.optional(v.union(
      v.literal("L1"),
      v.literal("L2"),
      v.literal("L3"),
      v.literal("L4")
    )),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clientAgents", {
      clientId: args.clientId,
      name: args.name,
      sessionKey: args.sessionKey,
      status: "idle",
      soulPath: args.soulPath,
      metrics: {
        tasksCompleted: 0,
        avgTaskDuration: 0,
        errorRate: 0,
      },
    });
  },
});

export const createClientTask = mutation({
  args: {
    clientId: v.id("clients"),
    domainId: v.optional(v.id("clientDomains")),
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("clientTasks", {
      ...args,
      status: "inbox",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("clientTasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: any = {
      status: args.status,
      updatedAt: now,
    };
    if (args.status === "done") {
      updates.completedAt = now;
    }
    await ctx.db.patch(args.taskId, updates);
  },
});

export const logActivity = mutation({
  args: {
    type: v.union(
      v.literal("task_created"),
      v.literal("task_completed"),
      v.literal("task_blocked"),
      v.literal("client_onboarded"),
      v.literal("client_status_changed"),
      v.literal("agent_error"),
      v.literal("milestone_reached"),
      v.literal("insight_generated"),
      v.literal("escalation")
    ),
    message: v.string(),
    severity: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error")
    ),
    agentId: v.optional(v.string()),
    agentName: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
    clientName: v.optional(v.string()),
    taskId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateAgentStatus = mutation({
  args: {
    agentId: v.id("agencyAgents"),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
      v.literal("offline")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      status: args.status,
      lastHeartbeat: Date.now(),
    });
  },
});

export const updateAgentLevel = mutation({
  args: {
    agentId: v.id("agencyAgents"),
    level: v.union(
      v.literal("L1"),
      v.literal("L2"),
      v.literal("L3"),
      v.literal("L4")
    ),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const patch: any = { level: args.level };
    if (args.skills) {
      patch.skills = args.skills;
    }
    await ctx.db.patch(args.agentId, patch);
  },
});

// ============================================
// AGENCY TASK MUTATIONS
// ============================================

export const createAgencyTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assigneeId: v.optional(v.id("agencyAgents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("agencyTasks", {
      ...args,
      status: args.assigneeId ? "assigned" : "inbox",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAgencyTaskStatus = mutation({
  args: {
    taskId: v.id("agencyTasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    assigneeId: v.optional(v.id("agencyAgents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const updates: any = {
      status: args.status,
      updatedAt: now,
    };
    if (args.status === "done") {
      updates.completedAt = now;
    }
    if (args.assigneeId !== undefined) {
      updates.assigneeId = args.assigneeId;
    }
    await ctx.db.patch(args.taskId, updates);
  },
});

export const getAgencyTasksByStatus = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("agencyTasks").collect();
    const agents = await ctx.db.query("agencyAgents").collect();
    
    const agentMap = new Map(agents.map(a => [a._id, a]));
    
    const enrichedTasks = tasks.map(task => ({
      ...task,
      assignee: task.assigneeId ? agentMap.get(task.assigneeId) : null,
    }));
    
    return {
      inbox: enrichedTasks.filter(t => t.status === "inbox"),
      assigned: enrichedTasks.filter(t => t.status === "assigned"),
      in_progress: enrichedTasks.filter(t => t.status === "in_progress"),
      review: enrichedTasks.filter(t => t.status === "review"),
      done: enrichedTasks.filter(t => t.status === "done"),
      blocked: enrichedTasks.filter(t => t.status === "blocked"),
    };
  },
});

// Alias for CLI compatibility
export const getTaskBoard = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("agencyTasks").collect();
    const agents = await ctx.db.query("agencyAgents").collect();
    
    const agentMap = new Map(agents.map(a => [a._id, a]));
    
    const enrichedTasks = tasks.map(task => ({
      ...task,
      assignee: task.assigneeId ? agentMap.get(task.assigneeId) : null,
    }));
    
    return {
      inbox: enrichedTasks.filter(t => t.status === "inbox"),
      assigned: enrichedTasks.filter(t => t.status === "assigned"),
      in_progress: enrichedTasks.filter(t => t.status === "in_progress"),
      review: enrichedTasks.filter(t => t.status === "review"),
      done: enrichedTasks.filter(t => t.status === "done"),
      blocked: enrichedTasks.filter(t => t.status === "blocked"),
    };
  },
});

// ============================================
// AGENT HEARTBEAT & MESSAGING
// ============================================

export const recordHeartbeat = mutation({
  args: {
    sessionKey: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked")
    ),
    currentTaskId: v.optional(v.id("agencyTasks")),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.query("agencyAgents")
      .filter((q) => q.eq(q.field("sessionKey"), args.sessionKey))
      .first();
    
    if (agent) {
      await ctx.db.patch(agent._id, {
        status: args.status,
        lastHeartbeat: Date.now(),
        currentTaskId: args.currentTaskId,
      });
    }
  },
});

export const postAgentMessage = mutation({
  args: {
    fromSessionKey: v.string(),
    fromAgentName: v.string(),
    messageType: v.union(
      v.literal("update"),
      v.literal("handoff"),
      v.literal("question"),
      v.literal("decision"),
      v.literal("blocked"),
      v.literal("comment")
    ),
    content: v.string(),
    taskId: v.optional(v.string()),
    taskType: v.optional(v.union(v.literal("client"), v.literal("agency"))),
  },
  handler: async (ctx, args) => {
    // Log as activity
    await ctx.db.insert("activities", {
      type: args.messageType === "blocked" ? "task_blocked" : 
            args.messageType === "handoff" ? "task_completed" : "insight_generated",
      message: `[${args.messageType.toUpperCase()}] ${args.fromAgentName}: ${args.content}`,
      severity: args.messageType === "blocked" ? "warning" : "info",
      agentName: args.fromAgentName,
      createdAt: Date.now(),
    });
    
    // Also log as task message if task specified
    if (args.taskId && args.taskType) {
      await ctx.db.insert("taskMessages", {
        taskId: args.taskId,
        taskType: args.taskType,
        fromAgentName: args.fromAgentName,
        messageType: args.messageType,
        content: args.content,
        createdAt: Date.now(),
      });
    }
    
    return { ok: true };
  },
});

export const getTaskMessages = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("taskMessages")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();
  },
});

// ============================================
// BACKUP & DATA PROTECTION
// ============================================

// Export a single table for backup
export const exportTable = query({
  args: { table: v.string() },
  handler: async (ctx, args) => {
    const validTables = [
      "agency", "agencyAgents", "agencyTasks",
      "clients", "clientAgents", "clientDomains", "clientTasks",
      "activities", "taskMessages", "notifications", "auditLog", "metricsSnapshots"
    ];
    
    if (!validTables.includes(args.table)) {
      return [];
    }
    
    return await ctx.db.query(args.table as any).collect();
  },
});

// Export all data for full backup
export const exportAllData = query({
  handler: async (ctx) => {
    return {
      timestamp: Date.now(),
      data: {
        agency: await ctx.db.query("agency").collect(),
        agencyAgents: await ctx.db.query("agencyAgents").collect(),
        agencyTasks: await ctx.db.query("agencyTasks").collect(),
        clients: await ctx.db.query("clients").collect(),
        clientAgents: await ctx.db.query("clientAgents").collect(),
        clientDomains: await ctx.db.query("clientDomains").collect(),
        clientTasks: await ctx.db.query("clientTasks").collect(),
        activities: await ctx.db.query("activities").collect(),
        taskMessages: await ctx.db.query("taskMessages").collect(),
      },
    };
  },
});

// Create pre-operation backup snapshot (returns backup ID)
export const createBackupSnapshot = mutation({
  args: { 
    reason: v.string(),
    operationType: v.string(),
  },
  handler: async (ctx, args) => {
    const snapshot = {
      timestamp: Date.now(),
      reason: args.reason,
      operationType: args.operationType,
      data: {
        agency: await ctx.db.query("agency").collect(),
        agencyAgents: await ctx.db.query("agencyAgents").collect(),
        agencyTasks: await ctx.db.query("agencyTasks").collect(),
        clients: await ctx.db.query("clients").collect(),
        clientAgents: await ctx.db.query("clientAgents").collect(),
        clientDomains: await ctx.db.query("clientDomains").collect(),
        clientTasks: await ctx.db.query("clientTasks").collect(),
        activities: await ctx.db.query("activities").collect(),
      },
    };
    
    // Log the backup creation
    await ctx.db.insert("auditLog", {
      timestamp: Date.now(),
      actorType: "system",
      actorId: "backup",
      actorName: "Backup System",
      action: "backup.created",
      resourceType: "database",
      resourceId: "full",
      details: JSON.stringify({ reason: args.reason, operationType: args.operationType }),
    });
    
    return { backupId: `backup_${Date.now()}`, snapshot };
  },
});

// ============================================
// SAFEGUARDED DESTRUCTIVE OPERATIONS
// ============================================

// Soft delete for tasks (marks as deleted, doesn't remove)
export const softDeleteAgencyTask = mutation({
  args: { 
    taskId: v.id("agencyTasks"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      return { error: "Task not found" };
    }
    
    // Log the deletion
    await ctx.db.insert("auditLog", {
      timestamp: Date.now(),
      actorType: "agent",
      actorId: "unknown",
      actorName: "Agent",
      action: "task.soft_deleted",
      resourceType: "agencyTask",
      resourceId: args.taskId,
      details: JSON.stringify({ reason: args.reason, taskTitle: task.title }),
    });
    
    // Update task with deletedAt instead of removing
    await ctx.db.patch(args.taskId, {
      status: "deleted" as any,
      updatedAt: Date.now(),
    });
    
    return { ok: true, deletedAt: Date.now() };
  },
});

// DANGEROUS: Clear all data - requires confirmation
// This should NEVER be called without explicit user approval
export const dangerousClearAllData = mutation({
  args: { 
    confirmation: v.string(), // Must be "I CONFIRM DELETION"
    reason: v.string(),
    backupCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Require exact confirmation string
    if (args.confirmation !== "I CONFIRM DELETION") {
      return { 
        error: "Confirmation failed. Must pass confirmation: 'I CONFIRM DELETION'",
        aborted: true,
      };
    }
    
    // Require backup confirmation
    if (!args.backupCompleted) {
      return {
        error: "Must confirm backup was completed before clearing data",
        aborted: true,
      };
    }
    
    // Log the destructive operation BEFORE executing
    await ctx.db.insert("auditLog", {
      timestamp: Date.now(),
      actorType: "agent",
      actorId: "unknown",
      actorName: "Agent",
      action: "database.DANGEROUS_CLEAR",
      resourceType: "database",
      resourceId: "all",
      details: JSON.stringify({ reason: args.reason, backupCompleted: args.backupCompleted }),
    });
    
    const tables = [
      "agency", "agencyAgents", "agencyTasks",
      "clients", "clientAgents", "clientDomains", "clientTasks",
      "activities", "taskMessages", "notifications", "metricsSnapshots"
      // Note: auditLog is NOT cleared - always preserved
    ];
    
    let deleted = 0;
    for (const table of tables) {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
        deleted++;
      }
    }
    
    return {
      status: "cleared",
      documentsDeleted: deleted,
      auditLogPreserved: true,
      timestamp: Date.now(),
    };
  },
});

// ============================================
// AGENT LOOKUP & TASK MANAGEMENT (Sprint 1.2)
// ============================================

// Get agent by session key
export const getAgentBySessionKey = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("agencyAgents")
      .filter((q) => q.eq(q.field("sessionKey"), args.sessionKey))
      .first();
  },
});

// Get tasks assigned to agent by session key
export const getMyTasks = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db.query("agencyAgents")
      .filter((q) => q.eq(q.field("sessionKey"), args.sessionKey))
      .first();
    if (!agent) return [];

    const agencyTasks = await ctx.db.query("agencyTasks")
      .filter((q) => q.eq(q.field("assigneeId"), agent._id))
      .collect();

    return agencyTasks.filter(t =>
      t.status !== "done" && t.status !== "blocked"
    );
  },
});

// Get messages/activities for a specific agent (by name mention)
export const getMessagesForAgent = query({
  args: { agentName: v.string(), since: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const since = args.since || Date.now() - 3600000; // default: last hour
    const activities = await ctx.db.query("activities")
      .withIndex("by_created")
      .order("desc")
      .collect();

    return activities.filter(a =>
      a.createdAt >= since && (
        a.message.includes(`→ ${args.agentName}`) ||
        a.message.includes(`@${args.agentName}`)
      )
    );
  },
});

// Atomic claim task — sets assignee + status in one operation
export const claimTask = mutation({
  args: {
    taskId: v.id("agencyTasks"),
    sessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.query("agencyAgents")
      .filter((q) => q.eq(q.field("sessionKey"), args.sessionKey))
      .first();
    if (!agent) return { error: "Agent not found for session key: " + args.sessionKey };

    const task = await ctx.db.get(args.taskId);
    if (!task) return { error: "Task not found" };
    if (task.status !== "assigned" && task.status !== "inbox") {
      return { error: `Cannot claim task in ${task.status} status` };
    }

    const now = Date.now();
    await ctx.db.patch(args.taskId, {
      status: "in_progress",
      assigneeId: agent._id,
      updatedAt: now,
    });

    await ctx.db.patch(agent._id, {
      status: "active",
      currentTaskId: args.taskId,
      lastHeartbeat: now,
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      message: `[UPDATE] ${agent.name} claimed task: ${task.title}`,
      severity: "info",
      agentName: agent.name,
      taskId: args.taskId as string,
      createdAt: now,
    });

    return { ok: true, taskTitle: task.title };
  },
});

// Atomic complete task — marks done + logs audit
export const completeTask = mutation({
  args: {
    taskId: v.id("agencyTasks"),
    sessionKey: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.query("agencyAgents")
      .filter((q) => q.eq(q.field("sessionKey"), args.sessionKey))
      .first();
    if (!agent) return { error: "Agent not found for session key: " + args.sessionKey };

    const task = await ctx.db.get(args.taskId);
    if (!task) return { error: "Task not found" };

    const now = Date.now();

    // L2 agents go to review, L3+ go to done
    const newStatus = (agent.level === "L3" || agent.level === "L4") ? "done" : "review";

    await ctx.db.patch(args.taskId, {
      status: newStatus as any,
      updatedAt: now,
      completedAt: now,
    });

    // Clear agent's current task
    await ctx.db.patch(agent._id, {
      status: "idle",
      currentTaskId: undefined,
      lastHeartbeat: now,
    });

    await ctx.db.insert("activities", {
      type: "task_completed",
      message: `[COMPLETE] ${agent.name}: ${args.summary}`,
      severity: "success",
      agentName: agent.name,
      taskId: args.taskId as string,
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("auditLog", {
      timestamp: now,
      actorType: "agent",
      actorId: agent._id,
      actorName: agent.name,
      action: "task.completed",
      resourceType: "agencyTask",
      resourceId: args.taskId,
      details: JSON.stringify({ summary: args.summary, status: newStatus }),
    });

    return { ok: true, status: newStatus };
  },
});

// Explicit audit log entry
export const logAuditEntry = mutation({
  args: {
    actorType: v.union(v.literal("agent"), v.literal("human"), v.literal("system")),
    actorId: v.string(),
    actorName: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    details: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLog", {
      timestamp: Date.now(),
      ...args,
    });
  },
});

// Assign task to a specific agent (Foreman dispatch)
export const assignTask = mutation({
  args: {
    taskId: v.id("agencyTasks"),
    assigneeSessionKey: v.string(),
    dispatcherSessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    const dispatcher = await ctx.db.query("agencyAgents")
      .filter((q) => q.eq(q.field("sessionKey"), args.dispatcherSessionKey))
      .first();
    if (!dispatcher) return { error: "Dispatcher not found" };

    const assignee = await ctx.db.query("agencyAgents")
      .filter((q) => q.eq(q.field("sessionKey"), args.assigneeSessionKey))
      .first();
    if (!assignee) return { error: "Assignee not found for key: " + args.assigneeSessionKey };

    const task = await ctx.db.get(args.taskId);
    if (!task) return { error: "Task not found" };
    if (task.status !== "inbox") {
      return { error: `Cannot assign task in ${task.status} status (must be inbox)` };
    }

    const now = Date.now();
    await ctx.db.patch(args.taskId, {
      status: "assigned",
      assigneeId: assignee._id,
      updatedAt: now,
    });

    await ctx.db.insert("activities", {
      type: "task_created",
      message: `[DISPATCH] ${dispatcher.name} assigned "${task.title}" to ${assignee.name}`,
      severity: "info",
      agentName: dispatcher.name,
      taskId: args.taskId as string,
      createdAt: now,
    });

    return { ok: true, assignedTo: assignee.name, taskTitle: task.title };
  },
});

// ============================================
// WAKE AGENT (On-demand board check request)
// ============================================

export const wakeAgent = mutation({
  args: {
    agentName: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const agentName = args.agentName;
    const reason = args.reason || `Owner requested ${agentName} check the board`;

    // Post a high-visibility activity the target agent will see
    await ctx.db.insert("activities", {
      type: "escalation",
      message: `[WAKE] ${agentName}: ${reason}`,
      severity: "warning",
      agentName: "Chrix",
      createdAt: now,
    });

    // Log as audit
    await ctx.db.insert("auditLog", {
      timestamp: now,
      actorType: "human",
      actorId: "chrix",
      actorName: "Chrix",
      action: `${agentName.toLowerCase()}.wake_requested`,
      resourceType: "system",
      resourceId: agentName.toLowerCase(),
      details: JSON.stringify({ agentName, reason }),
    });

    return { ok: true, message: `Wake signal sent to ${agentName}. They'll check on their next heartbeat.` };
  },
});

// Backward-compatible alias — dashboard button still calls this
export const wakeForeman = mutation({
  args: {
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const reason = args.reason || "Owner requested board check";

    await ctx.db.insert("activities", {
      type: "escalation",
      message: `[WAKE] Foreman: ${reason}`,
      severity: "warning",
      agentName: "Chrix",
      createdAt: now,
    });

    await ctx.db.insert("auditLog", {
      timestamp: now,
      actorType: "human",
      actorId: "chrix",
      actorName: "Chrix",
      action: "foreman.wake_requested",
      resourceType: "system",
      resourceId: "foreman",
      details: JSON.stringify({ reason }),
    });

    return { ok: true, message: "Wake signal sent. Foreman will check on his next heartbeat." };
  },
});

// ============================================
// ONE-TIME: Fix session keys to match SOUL format
// ============================================

export const fixAgentSessionKeys = mutation({
  handler: async (ctx) => {
    const keyMap: Record<string, string> = {
      "main": "agent:main:main",
      "agent:foreman": "agent:foreman:main",
      "agent:pm": "agent:pm:main",
      "agent:growth": "agent:growth:main",
      "agent:creative": "agent:creative:main",
      "agent:builder": "agent:builder:main",
      "agent:research": "agent:research:main",
    };

    const agents = await ctx.db.query("agencyAgents").collect();
    const results: string[] = [];

    for (const agent of agents) {
      const newKey = keyMap[agent.sessionKey];
      if (newKey && newKey !== agent.sessionKey) {
        await ctx.db.patch(agent._id, { sessionKey: newKey });
        results.push(`${agent.name}: ${agent.sessionKey} → ${newKey}`);
      } else if (!newKey) {
        results.push(`${agent.name}: already correct (${agent.sessionKey})`);
      }
    }

    return { fixed: results };
  },
});

// ============================================
// AGENCY SETTINGS
// ============================================

export const updateAgency = mutation({
  args: {
    name: v.string(),
    ownerName: v.string(),
    timezone: v.string(),
    settings: v.object({
      defaultHeartbeatInterval: v.number(),
      capacityAlertThreshold: v.number(),
      budgetAlertThreshold: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const agencies = await ctx.db.query("agency").collect();
    if (agencies.length === 0) {
      throw new Error("No agency record found");
    }
    const agency = agencies[0];
    await ctx.db.patch(agency._id, {
      name: args.name,
      ownerName: args.ownerName,
      timezone: args.timezone,
      settings: args.settings,
    });
    await ctx.db.insert("auditLog", {
      timestamp: Date.now(),
      actorType: "human",
      actorId: "chrix",
      actorName: "Chrix",
      action: "agency.settings_updated",
      resourceType: "agency",
      resourceId: agency._id,
      details: JSON.stringify({ name: args.name, timezone: args.timezone }),
    });
    return { ok: true };
  },
});

// ============================================
// TASK COMMENTS (UI-friendly)
// ============================================

export const addTaskComment = mutation({
  args: {
    taskId: v.string(),
    taskType: v.union(v.literal("client"), v.literal("agency")),
    content: v.string(),
    fromName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("taskMessages", {
      taskId: args.taskId,
      taskType: args.taskType,
      fromAgentName: args.fromName || "Chrix",
      messageType: "comment",
      content: args.content,
      createdAt: now,
    });
    return { ok: true };
  },
});
