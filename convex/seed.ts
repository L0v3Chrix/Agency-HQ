import { mutation } from "./_generated/server";

export const seedAgency = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existingAgency = await ctx.db.query("agency").first();
    if (existingAgency) {
      return { status: "already_seeded", agencyId: existingAgency._id };
    }

    const now = Date.now();

    // ============================================
    // 1. AGENCY
    // ============================================
    const agencyId = await ctx.db.insert("agency", {
      name: "Raize The Vibe",
      ownerName: "Chrix",
      timezone: "America/Chicago",
      createdAt: now,
      settings: {
        defaultHeartbeatInterval: 15,
        budgetAlertThreshold: 80,
        capacityAlertThreshold: 85,
      },
    });

    // ============================================
    // 2. AGENCY AGENTS
    // ============================================
    const agents = [
      {
        name: "Daniel",
        role: "Agency Lead",
        sessionKey: "main",
        level: "L4" as const,
        status: "active" as const,
        lastHeartbeat: now,
        soulPath: "SOUL.md",
        skills: ["coordination", "strategy", "client-relations", "planning"],
        metrics: { tasksCompleted: 47, avgTaskDuration: 25, errorRate: 2.1 },
      },
      {
        name: "Foreman",
        role: "Operations Manager",
        sessionKey: "agent:foreman",
        level: "L3" as const,
        status: "idle" as const,
        lastHeartbeat: now - 1800000,
        soulPath: "agents/foreman/SOUL.md",
        skills: ["task-dispatch", "quality-control", "scheduling"],
        metrics: { tasksCompleted: 23, avgTaskDuration: 15, errorRate: 1.5 },
      },
      {
        name: "PM",
        role: "Project Manager",
        sessionKey: "agent:pm",
        level: "L3" as const,
        status: "active" as const,
        lastHeartbeat: now - 600000,
        soulPath: "agents/pm/SOUL.md",
        skills: ["planning", "breakdown", "tracking", "documentation"],
        metrics: { tasksCompleted: 31, avgTaskDuration: 20, errorRate: 1.8 },
      },
      {
        name: "Growth",
        role: "Business Development",
        sessionKey: "agent:growth",
        level: "L2" as const,
        status: "idle" as const,
        lastHeartbeat: now - 3600000,
        soulPath: "agents/growth/SOUL.md",
        skills: ["outreach", "pipeline", "proposals", "research"],
        metrics: { tasksCompleted: 8, avgTaskDuration: 45, errorRate: 5.0 },
      },
      {
        name: "Creative",
        role: "Creative Director",
        sessionKey: "agent:creative",
        level: "L2" as const,
        status: "idle" as const,
        lastHeartbeat: now - 7200000,
        soulPath: "agents/creative/SOUL.md",
        skills: ["content", "design", "branding", "copywriting"],
        metrics: { tasksCompleted: 12, avgTaskDuration: 35, errorRate: 3.2 },
      },
      {
        name: "Builder",
        role: "Technical Lead",
        sessionKey: "agent:builder",
        level: "L3" as const,
        status: "idle" as const,
        lastHeartbeat: now - 1200000,
        soulPath: "agents/builder/SOUL.md",
        skills: ["development", "infrastructure", "debugging", "architecture"],
        metrics: { tasksCompleted: 19, avgTaskDuration: 40, errorRate: 2.5 },
      },
      {
        name: "Research",
        role: "Intelligence Analyst",
        sessionKey: "agent:research",
        level: "L2" as const,
        status: "offline" as const,
        lastHeartbeat: now - 86400000,
        soulPath: "agents/research/SOUL.md",
        skills: ["market-research", "competitive-analysis", "data-gathering"],
        metrics: { tasksCompleted: 6, avgTaskDuration: 60, errorRate: 4.0 },
      },
    ];

    const agentIds: Record<string, any> = {};
    for (const agent of agents) {
      agentIds[agent.name] = await ctx.db.insert("agencyAgents", agent);
    }

    // ============================================
    // 3. CLIENTS
    // ============================================
    
    // SimsCo
    const simscoId = await ctx.db.insert("clients", {
      slug: "simsco",
      name: "SimsCo Unlimited",
      industry: "Disaster Restoration",
      status: "active",
      lifecycleStage: {
        current: "active",
        since: now - 2592000000, // 30 days ago
        history: [
          { stage: "lead", from: now - 3456000000, to: now - 3024000000 },
          { stage: "onboarding", from: now - 3024000000, to: now - 2592000000 },
          { stage: "active", from: now - 2592000000 },
        ],
      },
      revenue: {
        mrr: 1600,
        currency: "USD",
        billingCycle: "monthly" as const,
      },
      health: {
        score: 78,
        indicators: [
          { name: "Engagement", status: "healthy" as const },
          { name: "Deliverables", status: "warning" as const },
          { name: "Communication", status: "healthy" as const },
        ],
        lastUpdated: now,
      },
      contacts: [
        { name: "Justin Sims", role: "Owner", email: "justin@simsco.com", primary: true },
      ],
      profilePath: "clients/simsco/CLIENT-PROFILE.md",
      createdAt: now - 3456000000,
      updatedAt: now,
    });

    // 1322 Legacy Strategies
    const legacyId = await ctx.db.insert("clients", {
      slug: "1322",
      name: "1322 Legacy Strategies",
      industry: "Business Consulting",
      status: "active",
      lifecycleStage: {
        current: "active",
        since: now - 7776000000, // 90 days ago
        history: [
          { stage: "active", from: now - 7776000000 },
        ],
      },
      revenue: {
        mrr: 2000,
        currency: "USD",
        billingCycle: "monthly" as const,
      },
      health: {
        score: 92,
        indicators: [
          { name: "Engagement", status: "healthy" as const },
          { name: "Deliverables", status: "healthy" as const },
          { name: "Communication", status: "healthy" as const },
        ],
        lastUpdated: now,
      },
      contacts: [
        { name: "Brad", role: "Founder", primary: true },
      ],
      profilePath: "clients/1322/CLIENT-PROFILE.md",
      createdAt: now - 7776000000,
      updatedAt: now,
    });

    // ============================================
    // 4. CLIENT DOMAINS
    // ============================================
    
    // SimsCo domains
    const simscoSocialId = await ctx.db.insert("clientDomains", {
      clientId: simscoId,
      name: "social-media",
      displayName: "Social Media",
      status: "active",
      priority: "high",
      configPath: "clients/simsco/domains/social-media/DOMAIN-CONFIG.md",
      metrics: { progress: 65, tasksCompleted: 12, tasksPending: 5 },
    });

    const simscoGmbId = await ctx.db.insert("clientDomains", {
      clientId: simscoId,
      name: "gmb",
      displayName: "Google My Business",
      status: "setup",
      priority: "high",
      configPath: "clients/simsco/domains/gmb/DOMAIN-CONFIG.md",
      metrics: { progress: 20, tasksCompleted: 2, tasksPending: 8 },
    });

    const simscoLeadGenId = await ctx.db.insert("clientDomains", {
      clientId: simscoId,
      name: "lead-gen",
      displayName: "Lead Generation",
      status: "active",
      priority: "medium",
      configPath: "clients/simsco/domains/lead-gen/DOMAIN-CONFIG.md",
      metrics: { progress: 40, tasksCompleted: 6, tasksPending: 9 },
    });

    // 1322 domains
    await ctx.db.insert("clientDomains", {
      clientId: legacyId,
      name: "consulting",
      displayName: "AI Consulting",
      status: "active",
      priority: "high",
      configPath: "clients/1322/domains/consulting/DOMAIN-CONFIG.md",
      metrics: { progress: 85, tasksCompleted: 24, tasksPending: 3 },
    });

    // ============================================
    // 5. CLIENT AGENTS
    // ============================================
    
    const simscoAgentId = await ctx.db.insert("clientAgents", {
      clientId: simscoId,
      name: "SimsCo Lead",
      sessionKey: "agent:simsco:lead",
      level: "L2",
      status: "idle",
      lastHeartbeat: now - 3600000,
      soulPath: "clients/simsco/agents/lead/SOUL.md",
      metrics: { tasksCompleted: 15, avgTaskDuration: 30, errorRate: 3.5 },
    });

    const legacyAgentId = await ctx.db.insert("clientAgents", {
      clientId: legacyId,
      name: "Mabel",
      sessionKey: "agent:1322:mabel",
      level: "L3",
      status: "active",
      lastHeartbeat: now - 900000,
      soulPath: "clients/1322/agents/mabel/SOUL.md",
      metrics: { tasksCompleted: 42, avgTaskDuration: 22, errorRate: 1.2 },
    });

    // ============================================
    // 6. AGENCY TASKS
    // ============================================
    
    const agencyTasks = [
      {
        title: "Review Agent Performance Protocol",
        description: "Review and approve the agent performance review framework created by PM",
        status: "review" as const,
        priority: "high" as const,
        assigneeId: agentIds["Daniel"],
        createdAt: now - 86400000,
        updatedAt: now - 3600000,
      },
      {
        title: "Deploy Agency HQ to Production",
        description: "Deploy the finished HQ dashboard to Vercel for live access",
        status: "in_progress" as const,
        priority: "urgent" as const,
        assigneeId: agentIds["Builder"],
        createdAt: now - 172800000,
        updatedAt: now,
      },
      {
        title: "Create SimsCo Content Calendar",
        description: "Build out February content calendar for SimsCo social media",
        status: "assigned" as const,
        priority: "high" as const,
        assigneeId: agentIds["Creative"],
        createdAt: now - 259200000,
        updatedAt: now - 86400000,
      },
      {
        title: "Research RM Marketing Opportunity",
        description: "Research RM Marketing for potential partnership proposal",
        status: "inbox" as const,
        priority: "medium" as const,
        createdAt: now - 432000000,
        updatedAt: now - 432000000,
      },
      {
        title: "Weekly Agent Standup Summary",
        description: "Compile weekly summary of all agent activity and metrics",
        status: "done" as const,
        priority: "medium" as const,
        assigneeId: agentIds["Foreman"],
        createdAt: now - 604800000,
        updatedAt: now - 518400000,
        completedAt: now - 518400000,
      },
    ];

    for (const task of agencyTasks) {
      await ctx.db.insert("agencyTasks", task);
    }

    // ============================================
    // 7. CLIENT TASKS
    // ============================================
    
    const clientTasks = [
      {
        clientId: simscoId,
        domainId: simscoSocialId,
        title: "Create Instagram content batch",
        description: "Create 5 Instagram posts for week of Feb 10",
        status: "in_progress" as const,
        priority: "high" as const,
        assigneeId: simscoAgentId,
        createdAt: now - 172800000,
        updatedAt: now - 3600000,
      },
      {
        clientId: simscoId,
        domainId: simscoGmbId,
        title: "Optimize GMB listing",
        description: "Update business hours, add photos, respond to reviews",
        status: "assigned" as const,
        priority: "high" as const,
        assigneeId: simscoAgentId,
        createdAt: now - 259200000,
        updatedAt: now - 86400000,
      },
      {
        clientId: simscoId,
        domainId: simscoLeadGenId,
        title: "Set up lead capture form",
        description: "Create and integrate lead capture form on website",
        status: "inbox" as const,
        priority: "medium" as const,
        createdAt: now - 345600000,
        updatedAt: now - 345600000,
      },
      {
        clientId: legacyId,
        title: "Weekly sync with Brad",
        description: "Regular check-in on agent performance and priorities",
        status: "done" as const,
        priority: "medium" as const,
        assigneeId: legacyAgentId,
        createdAt: now - 604800000,
        updatedAt: now - 432000000,
        completedAt: now - 432000000,
      },
    ];

    for (const task of clientTasks) {
      await ctx.db.insert("clientTasks", task);
    }

    // ============================================
    // 8. ACTIVITIES
    // ============================================
    
    const activities = [
      {
        type: "task_completed" as const,
        agentName: "Foreman",
        message: "Completed weekly agent standup summary",
        severity: "success" as const,
        createdAt: now - 518400000,
      },
      {
        type: "task_completed" as const,
        agentName: "Mabel",
        clientId: legacyId,
        clientName: "1322 Legacy Strategies",
        message: "Completed weekly sync with Brad",
        severity: "success" as const,
        createdAt: now - 432000000,
      },
      {
        type: "milestone_reached" as const,
        agentName: "PM",
        message: "Agent Leveling Framework implementation complete - all agents have levels",
        severity: "success" as const,
        createdAt: now - 86400000,
      },
      {
        type: "task_created" as const,
        agentName: "Daniel",
        message: "Created task: Review Agent Performance Protocol",
        severity: "info" as const,
        createdAt: now - 86400000,
      },
      {
        type: "insight_generated" as const,
        agentName: "PM",
        message: "Performance Review Protocol ready for approval - comprehensive framework with promotion/demotion criteria",
        severity: "info" as const,
        createdAt: now - 43200000,
      },
      {
        type: "task_blocked" as const,
        agentName: "Builder",
        clientId: simscoId,
        clientName: "SimsCo Unlimited",
        message: "HQ Dashboard blocked - need to fix type errors before deployment",
        severity: "warning" as const,
        createdAt: now - 28800000,
      },
      {
        type: "task_completed" as const,
        agentName: "Builder",
        message: "Fixed HQ Dashboard type errors - build passing",
        severity: "success" as const,
        createdAt: now - 21600000,
      },
      {
        type: "escalation" as const,
        agentName: "Daniel",
        message: "HQ needs to be finished today - prioritizing completion over new features",
        severity: "warning" as const,
        createdAt: now - 3600000,
      },
    ];

    for (const activity of activities) {
      await ctx.db.insert("activities", activity);
    }

    return { 
      status: "seeded",
      agencyId,
      clients: [simscoId, legacyId],
      agentCount: Object.keys(agentIds).length,
    };
  },
});

// DEPRECATED: Old clear function - DO NOT USE
// Use dangerousClearAllData in functions.ts instead which requires confirmation
export const clearAndReseed = mutation({
  handler: async (ctx) => {
    // This function is disabled for safety
    // Use functions:dangerousClearAllData with proper confirmation instead
    return { 
      status: "blocked",
      error: "This function is disabled for safety. Use dangerousClearAllData with confirmation: 'I CONFIRM DELETION'",
      documentsDeleted: 0,
    };
  },
});
