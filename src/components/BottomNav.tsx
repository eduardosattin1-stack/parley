import { useMeetLog } from "../context/MeetingContext";
import { Home, Mic, FolderOpen, BarChart2, User, Sparkles, Users } from "lucide-react";
import { ActiveTab } from "../types";

export default function BottomNav() {
  const { activeTab, setActiveTab } = useMeetLog();

  const NAV_ITEMS = [
    { id: "home" as ActiveTab, label: "Feed", icon: Home },
    { id: "record" as ActiveTab, label: "Record", icon: Mic, highlight: true },
    { id: "projects" as ActiveTab, label: "Projects", icon: FolderOpen },
    { id: "relations" as ActiveTab, label: "Relations", icon: Users },
    { id: "analytics" as ActiveTab, label: "Trends", icon: BarChart2 },
    { id: "profile" as ActiveTab, label: "Account", icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-canvas/95 backdrop-blur-md border-t border-line px-4 py-2 z-50 shadow-xl safe-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                id={`nav-btn-${item.id}`}
                className={`flex flex-col items-center justify-center -translate-y-4 w-14 h-14 rounded-full shadow-lg transition-all duration-300 bg-primary text-on-primary ${
                  isActive
                    ? "border-2 border-accent scale-110 active:scale-100 shadow-[0_0_12px_rgba(201,168,76,0.4)]"
                    : "hover:scale-105 active:scale-95 border border-accent/20"
                }`}
              >
                <Icon size={26} className={isActive ? "animate-pulse" : ""} />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              id={`nav-btn-${item.id}`}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-colors duration-200 rounded-xl ${
                isActive
                  ? "text-primary font-black"
                  : "text-ink-subtle hover:text-ink"
              }`}
            >
              <Icon size={20} className={isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"} />
              <span className="text-[10px] mt-0.5 tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
