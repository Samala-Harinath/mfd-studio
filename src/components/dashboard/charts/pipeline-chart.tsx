"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from "recharts";
import { useDashboardTheme } from "@/components/dashboard/theme";

export type PipelineSlice = {
  name: string;
  value: number;
  color: string;
};

export function PipelineChart({ slices }: { slices: PipelineSlice[] }) {
  const { theme } = useDashboardTheme();
  const dark = theme === "dark";
  const filled = slices.filter((slice) => slice.value > 0);
  const data = filled.length > 0 ? filled : [{ name: "None", value: 1, color: dark ? "#1f2a3a" : "#e8edf2" }];
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="relative mx-auto h-40 w-40 shrink-0" role="img" aria-label={`Enquiry pipeline, ${total} total.`}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 160, height: 160 }}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="94%"
            paddingAngle={filled.length > 1 ? 3 : 0}
            cornerRadius={filled.length > 0 ? 7 : 0}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={filled.length > 0}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          {filled.length > 0 ? (
            <Tooltip content={PipelineTooltip} wrapperStyle={{ outline: "none", zIndex: 20 }} />
          ) : null}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[28px] font-semibold leading-none tabular-nums text-ink">{total}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Total</span>
      </div>
    </div>
  );
}

function PipelineTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-xl border border-edge bg-surface px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{item?.name}</p>
      <p className="mt-1 font-display text-lg font-semibold leading-none tabular-nums text-ink">{item?.value ?? 0}</p>
    </div>
  );
}
