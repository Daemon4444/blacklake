import { useState } from "react";

export function Tabs({ tabs, defaultTab }: { tabs: { key: string; label: string; content: React.ReactNode }[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.key || "");

  return (
    <div className="tabs-container">
      <div className="tabs-nav" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            className={active === tab.key ? "active" : ""}
            type="button"
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-panel" role="tabpanel">
        {tabs.find(t => t.key === active)?.content}
      </div>
    </div>
  );
}
