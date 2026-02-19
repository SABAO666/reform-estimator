"use client";

export type TabId = "simple" | "roof" | "solar" | "financial" | "devmode";

type Tab = {
  id: TabId;
  label: string;
  description: string;
};

const TABS: Tab[] = [
  { id: "simple", label: "シンプル", description: "リフォーム概算見積" },
  { id: "roof", label: "屋根分析", description: "セグメント詳細・航空写真" },
  { id: "solar", label: "ソーラー", description: "パネル配置・発電量・CO2" },
  { id: "financial", label: "財務分析", description: "投資回収・節約額" },
  { id: "devmode", label: "開発モード", description: "APIデータ詳細" },
];

type Props = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasData: boolean;
};

export default function TabNavigation({ activeTab, onTabChange }: Props) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-0 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
                ${tab.id === "devmode" ? "ml-auto text-xs" : ""}
              `}
              title={tab.description}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
