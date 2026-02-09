import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  
  // ============================================
  // AGENCY LEVEL
  // ============================================
  
  agency: defineTable({
    name: v.string(),
    ownerName: v.string(),
    timezone: v.string(),
    createdAt: v.number(),
    settings: v.object({
      defaultHeartbeatInterval: v.number(),
      budgetAlertThreshold: v.number(),
      capacityAlertThreshold: v.number(),
    }),
  }),

  agencyAgents: defineTable({
    name: v.string(),
    role: v.string(),
    sessionKey: v.string(),
    level: v.optional(v.union(
      v.literal("L1"),
      v.literal("L2"),
      v.literal("L3"),
      v.literal("L4")
    )),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
      v.literal("offline")
    ),
    lastHeartbeat: v.optional(v.number()),
    currentTaskId: v.optional(v.id("agencyTasks")),
    soulPath: v.string(),
    skills: v.optional(v.array(v.string())),
    metrics: v.optional(v.object({
      tasksCompleted: v.number(),
      avgTaskDuration: v.number(),
      errorRate: v.number(),
    })),
  }),

  agencyTasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assigneeId: v.optional(v.id("agencyAgents")),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  }),

  // ============================================
  // CLIENT LEVEL
  // ============================================

  clients: defineTable({
    slug: v.string(),
    name: v.string(),
    industry: v.optional(v.string()),
    status: v.union(
      v.literal("lead"),
      v.literal("onboarding"),
      v.literal("active"),
      v.literal("at_risk"),
      v.literal("offboarding"),
      v.literal("alumni")
    ),
    lifecycleStage: v.object({
      current: v.string(),
      since: v.number(),
      history: v.array(v.object({
        stage: v.string(),
        from: v.number(),
        to: v.optional(v.number()),
      })),
    }),
    revenue: v.object({
      mrr: v.number(),
      currency: v.string(),
      billingCycle: v.union(
        v.literal("weekly"),
        v.literal("monthly"),
        v.literal("quarterly"),
        v.literal("annual")
      ),
    }),
    health: v.object({
      score: v.number(),
      indicators: v.array(v.object({
        name: v.string(),
        status: v.union(
          v.literal("healthy"),
          v.literal("warning"),
          v.literal("critical")
        ),
      })),
      lastUpdated: v.number(),
    }),
    contacts: v.array(v.object({
      name: v.string(),
      role: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      primary: v.boolean(),
    })),
    profilePath: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_slug", ["slug"]),

  clientAgents: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    role: v.optional(v.string()),
    sessionKey: v.string(),
    level: v.optional(v.union(
      v.literal("L1"),
      v.literal("L2"),
      v.literal("L3"),
      v.literal("L4")
    )),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
      v.literal("offline")
    ),
    lastHeartbeat: v.optional(v.number()),
    currentTaskId: v.optional(v.id("clientTasks")),
    soulPath: v.string(),
    skills: v.optional(v.array(v.string())),
    metrics: v.optional(v.object({
      tasksCompleted: v.number(),
      avgTaskDuration: v.number(),
      errorRate: v.number(),
    })),
  }).index("by_client", ["clientId"]),

  clientDomains: defineTable({
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
    metrics: v.optional(v.object({
      progress: v.number(),
      tasksCompleted: v.number(),
      tasksPending: v.number(),
    })),
  }).index("by_client", ["clientId"]),

  clientTasks: defineTable({
    clientId: v.id("clients"),
    domainId: v.optional(v.id("clientDomains")),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assigneeId: v.optional(v.id("clientAgents")),
    dueDate: v.optional(v.number()),
    estimatedMinutes: v.optional(v.number()),
    actualMinutes: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_client", ["clientId"])
    .index("by_domain", ["domainId"])
    .index("by_status", ["status"]),

  taskMessages: defineTable({
    taskId: v.string(),
    taskType: v.union(
      v.literal("client"),
      v.literal("agency")
    ),
    fromAgentId: v.optional(v.string()),
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
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),

  // ============================================
  // CROSS-CUTTING
  // ============================================

  activities: defineTable({
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
    agentId: v.optional(v.string()),
    agentName: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
    clientName: v.optional(v.string()),
    taskId: v.optional(v.string()),
    message: v.string(),
    severity: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error")
    ),
    createdAt: v.number(),
  }).index("by_client", ["clientId"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  notifications: defineTable({
    targetType: v.union(
      v.literal("agent"),
      v.literal("human")
    ),
    targetId: v.string(),
    fromAgentId: v.optional(v.string()),
    fromAgentName: v.string(),
    notificationType: v.union(
      v.literal("mention"),
      v.literal("assignment"),
      v.literal("escalation"),
      v.literal("alert")
    ),
    content: v.string(),
    clientId: v.optional(v.id("clients")),
    taskId: v.optional(v.string()),
    delivered: v.boolean(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_target", ["targetType", "targetId"])
    .index("by_delivered", ["delivered"]),

  auditLog: defineTable({
    timestamp: v.number(),
    actorType: v.union(v.literal("agent"), v.literal("human"), v.literal("system")),
    actorId: v.string(),
    actorName: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.string(),
    details: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
  }).index("by_timestamp", ["timestamp"])
    .index("by_client", ["clientId"]),

});
