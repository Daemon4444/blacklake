import { useMemo } from "react";

export function Sparkline({ data, color = "var(--mint)", height = 40, width = 120 }: { data: number[]; color?: string; height?: number; width?: number }) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    return data.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  }, [data, height, width]);

  return (
    <svg width={width} height={height} className="sparkline" aria-hidden>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DonutChart({ value, max = 100, size = 72, strokeWidth = 8, color = "var(--mint)", label }: { value: number; max?: number; size?: number; strokeWidth?: number; color?: string; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className="donut-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="donut-value">{Math.round(value)}{label || "%"}</span>
    </div>
  );
}

export function BarChart({ data, height = 120, barColor = "var(--mint)" }: { data: { label: string; value: number }[]; height?: number; barColor?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d) => (
        <div className="bar-col" key={d.label}>
          <div className="bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: barColor, transition: "height 0.4s ease" }} />
          <span className="bar-label">{d.label}</span>
          <span className="bar-value">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export function GaugeChart({ value, max = 100, size = 90, color = "var(--mint)", label }: { value: number; max?: number; size?: number; color?: string; label?: string }) {
  const progress = Math.min(value / max, 1);
  const angle = progress * 180;
  const radius = (size - 12) / 2;
  const x1 = size / 2 + radius * Math.cos(Math.PI);
  const y1 = size / 2 + radius * Math.sin(Math.PI);
  const x2 = size / 2 + radius * Math.cos(Math.PI + (angle * Math.PI) / 180);
  const y2 = size / 2 + radius * Math.sin(Math.PI + (angle * Math.PI) / 180);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="gauge-chart">
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path
          d={`M ${size / 2 - radius} ${size / 2} A ${radius} ${radius} 0 0 1 ${size / 2 + radius} ${size / 2}`}
          fill="none" stroke="var(--line)" strokeWidth={8} strokeLinecap="round"
        />
        {progress > 0 && (
          <path
            d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
            style={{ transition: "d 0.5s ease" }}
          />
        )}
      </svg>
      <div className="gauge-label">
        <strong>{Math.round(value)}</strong>
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}
