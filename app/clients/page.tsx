"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";

export default function ClientsPage() {
  const clients = useQuery(api.functions.getClients, {}) || [];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      at_risk: "bg-red-500/20 text-red-400",
      onboarding: "bg-blue-500/20 text-blue-400",
      lead: "bg-gray-500/20 text-gray-400",
    };
    return colors[status] || colors.lead;
  };

  return (
    <>
    <PageHeader />
    <div className="max-w-7xl mx-auto px-6 pb-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Clients</h2>
          <p className="text-gray-400">Manage your client portfolio</p>
        </div>
        <Link 
          href="/clients/new"
          className="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg font-medium"
        >
          + Onboard Client
        </Link>
      </div>

      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Client</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">MRR</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Health</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {clients.map((client) => (
              <tr key={client._id} className="hover:bg-gray-800/30">
                <td className="px-6 py-4">
                  <Link href={`/clients/${client.slug}`} className="font-medium hover:text-primary-400">
                    {client.name}
                  </Link>
                  {client.industry && (
                    <div className="text-sm text-gray-500">{client.industry}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(client.status)}`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  ${client.revenue.mrr.toLocaleString()}
                  <span className="text-gray-500 text-sm">/{client.revenue.billingCycle}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${client.health.score >= 80 ? 'bg-green-500' : client.health.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${client.health.score}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400">{client.health.score}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 text-sm">
                  {client.contacts.find(c => c.primary)?.name || "—"}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No clients yet. Use Phase 4 to onboard your first client.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
