"use client";

import React from "react";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      name: "Total Users",
      value: "1,234",
      icon: Users,
      trend: "+12.5%",
      color: "from-[#B88E2F] to-[#967223]",
      bgColor: "bg-[#B88E2F]/10",
      textColor: "text-[#B88E2F]",
    },
    {
      name: "Total Products",
      value: "567",
      icon: Package,
      trend: "+8.2%",
      color: "from-emerald-600 to-emerald-700",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      name: "Total Orders",
      value: "890",
      icon: ShoppingCart,
      trend: "+23.1%",
      color: "from-purple-600 to-purple-700",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      name: "Revenue",
      value: "$45,234",
      icon: DollarSign,
      trend: "+15.3%",
      color: "from-amber-600 to-amber-700",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] font-poppins">
            Welcome back, Admin! 👋
          </h1>
          <p className="mt-1 text-gray-600 font-poppins">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
              <span className="text-sm font-semibold text-emerald-600 font-poppins">
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 font-poppins">
                {stat.name}
              </p>
              <p className="mt-1 text-3xl font-bold text-[#1A1A1A] font-poppins">
                {stat.value}
              </p>
            </div>
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-linear-to-br ${stat.color} opacity-0 blur-2xl transition-opacity group-hover:opacity-10`}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-[#B88E2F]/10 p-2">
              <Activity className="h-5 w-5 text-[#B88E2F]" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] font-poppins">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-[#FAF9F6] p-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <p className="text-sm text-gray-700 font-poppins">
                New order #1234 placed
              </p>
              <span className="ml-auto text-xs text-gray-500">2m ago</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-[#FAF9F6] p-3">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-gray-700 font-poppins">
                Product &quot;Oak Chair&quot; updated
              </p>
              <span className="ml-auto text-xs text-gray-500">15m ago</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-[#FAF9F6] p-3">
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <p className="text-sm text-gray-700 font-poppins">
                New user registered
              </p>
              <span className="ml-auto text-xs text-gray-500">1h ago</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-purple-50 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] font-poppins">
              Quick Stats
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-poppins">Sales Target</span>
                <span className="font-semibold text-[#1A1A1A] font-poppins">
                  75%
                </span>
              </div>
              <div className="h-2 bg-[#FAF9F6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#B88E2F] to-[#967223] rounded-full transition-all duration-500"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-poppins">
                  Customer Satisfaction
                </span>
                <span className="font-semibold text-[#1A1A1A] font-poppins">
                  92%
                </span>
              </div>
              <div className="h-2 bg-[#FAF9F6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: "92%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-poppins">
                  Inventory Status
                </span>
                <span className="font-semibold text-[#1A1A1A] font-poppins">
                  68%
                </span>
              </div>
              <div className="h-2 bg-[#FAF9F6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
