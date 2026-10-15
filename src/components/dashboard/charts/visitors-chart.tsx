"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { useDashboardTheme } from "@/components/dashboard/theme";

export const visitorWeek = [
  { day: "Mon", visitors: 42 },
  { day: "Tue", visitors: 58 },
  { day: "Wed", visitors: 49 },
  { day: "Thu", visitors: 72 },
  { day: "Fri", visitors: 66 },
  { day: "Sat", visitors: 84 },
  { day: "Sun", visitors: 71 },
];

export const visitorWeekTotal = visitorWeek.reduce((sum, item) => sum + item.visitors, 0);

export const visitorPeak = visitorWeek.reduce((best, item) => (item.visitors > best.visitors ? item : best));

const summary = visitorWeek.map((item) => `${item.day} ${item.visitors}`).join(", ");

export function VisitorsChart() {
  const { theme } = useDashboardTheme();
  const dark = theme === "dark";
  const brand = dark ? "#2dd4bf" : "#0d9488";
  const grid = dark ? "#243044" : "#e6eaef";
  const tick = dark ? "#8b9ab0" : "#64748b";

  return (
    <div className="mt-2 h-60" role="img" aria-label={`Sample visitors this week. ${summary}.`}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 240 }}>
        <AreaChart data={visitorWeek} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={brand} stopOpacity={0.34} />
              <stop offset="78%" stopColor={brand} stopOpacity={0.05} />
              <stop offset="100%" stopColor={brand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 6" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: tick, fontSize: 12, fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: tick, fontSize: 11 }}
            width={40}
            allowDecimals={false}
            domain={[0, "auto"]}
          />
          <Tooltip
            content={VisitorTooltip}
            cursor={{ stroke: brand, strokeWidth: 1, strokeDasharray: "4 4" }}
            wrapperStyle={{ outline: "none", zIndex: 20 }}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            stroke={brand}
            strokeWidth={2.5}
            fill="url(#visitorFill)"
            dot={false}
            activeDot={{ r: 5, fill: brand, stroke: dark ? "#111827" : "#ffffff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function VisitorTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-edge bg-surface px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold leading-none tabular-nums text-ink">
        {value}
        <span className="ml-1.5 text-xs font-medium text-body">visitors</span>
      </p>
    </div>
  );
}
