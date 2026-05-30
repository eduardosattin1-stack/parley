import { useMeetLog } from "../context/MeetingContext";
import { BarChart2, TrendingUp, CheckSquare, Clock, Folder, Calendar } from "lucide-react";

export default function AnalyticsView() {
  const { meetings, projects } = useMeetLog();

  // 1. Calculate general stats metrics blocks
  const totalMeetings = meetings.length;

  const totalDurationSec = meetings.reduce((acc, curr) => acc + curr.durationSec, 0);
  const totalDurationMin = Math.round(totalDurationSec / 60);

  const avgDurationMin = totalMeetings > 0
    ? Math.round((totalDurationSec / totalMeetings) / 60)
    : 0;

  // Calculate task actions completion rates
  const allActions = meetings.flatMap(m => m.actionItems || []);
  const completedActions = allActions.filter(a => a.completed).length;
  const actionsCompletionRatio = allActions.length > 0
    ? Math.round((completedActions / allActions.length) * 100)
    : 0;

  // 2. Project breakdown data
  const projectStats = projects.map(proj => {
    const projMeetings = meetings.filter(m => m.project === proj.name);
    const count = projMeetings.length;
    const minutes = Math.round(projMeetings.reduce((acc, curr) => acc + curr.durationSec, 0) / 60);
    const percentage = totalMeetings > 0 ? Math.round((count / totalMeetings) * 100) : 0;
    return {
      ...proj,
      count,
      minutes,
      percentage
    };
  }).sort((a, b) => b.count - a.count);

  // 3. Extranous Tag frequencies
  const tagsMap: Record<string, number> = {};
  meetings.forEach(m => {
    (m.tags || []).forEach(tag => {
      tagsMap[tag] = (tagsMap[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagsMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Custom Line Chart coordinates for meetings trends
  // We'll generate dynamic historic items mock for last 7 dates
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const trendsData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayLabel = days[d.getDay()];

    // Count how many meetings are recorded on this weekday date
    const formattedDate = d.toDateString();
    const count = meetings.filter(m => new Date(m.date).toDateString() === formattedDate).length;

    return { label: dayLabel, count };
  });

  // Calculate coordinates for responsive SVG layout (height bounds: 0 - 80)
  const maxAxisCount = Math.max(...trendsData.map(t => t.count), 1);
  const chartHeight = 80;
  const chartWidth = 350;
  const svgPoints = trendsData.map((t, idx) => {
    const x = 20 + (idx * (chartWidth - 40) / 6);
    // scale y coordinate inverted
    const y = chartHeight - (t.count / maxAxisCount) * (chartHeight - 15) - 5;
    return { x, y, label: t.label, count: t.count };
  });

  const polylinePointsStr = svgPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-6" id="analytics-statistics-view">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-brand-green dark:text-brand-cream tracking-tight">
          Trends & <span className="text-brand-gold">Analytics</span>
        </h1>
        <p className="text-xs text-brand-green/75 dark:text-brand-cream/70 mt-0.5">
          Real-time insights across meetings categorization structures
        </p>
      </div>

      {/* Grid: 4 Core Stats Bento Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5" id="bento-metrics-grid">
        {/* Met 1: Total recordings */}
        <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-3.5 rounded-2xl flex flex-col justify-between h-24 shadow-sm">
          <div className="flex justify-between items-center text-brand-green/60 dark:text-brand-cream/60 font-sans">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Transcripts</span>
            <Calendar size={15} className="text-brand-gold" />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-green dark:text-[#EEF0EA] leading-none font-sans">
              {totalMeetings}
            </span>
            <p className="text-[9px] text-brand-green/70 dark:text-brand-cream/70 mt-0.5">saved meeting tracks</p>
          </div>
        </div>

        {/* Met 2: Duration */}
        <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-3.5 rounded-2xl flex flex-col justify-between h-24 shadow-sm">
          <div className="flex justify-between items-center text-brand-green/60 dark:text-brand-cream/60 font-sans">
            <span className="text-[10px] uppercase font-bold tracking-wider">Minutes Logged</span>
            <Clock size={15} className="text-brand-gold" />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-green dark:text-[#EEF0EA] leading-none font-sans">
              {totalDurationMin}m
            </span>
            <p className="text-[9px] text-brand-green/70 dark:text-brand-cream/70 mt-0.5">average: {avgDurationMin}m per track</p>
          </div>
        </div>

        {/* Met 3: Tasks Rate */}
        <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-3.5 rounded-2xl flex flex-col justify-between h-24 shadow-sm">
          <div className="flex justify-between items-center text-brand-green/60 dark:text-brand-cream/60 font-sans">
            <span className="text-[10px] uppercase font-bold tracking-wider">Actions Complete</span>
            <CheckSquare size={15} className="text-brand-gold" />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-green dark:text-[#EEF0EA] leading-none font-sans">
              {actionsCompletionRatio}%
            </span>
            <p className="text-[9px] text-brand-green/70 dark:text-brand-cream/70 mt-0.5">
              {completedActions} of {allActions.length} items check-offs
            </p>
          </div>
        </div>

        {/* Met 4: Folders count */}
        <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-3.5 rounded-2xl flex flex-col justify-between h-24 shadow-sm">
          <div className="flex justify-between items-center text-brand-green/60 dark:text-brand-cream/60 font-sans flex-shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider">Target Projects</span>
            <Folder size={15} className="text-brand-gold" />
          </div>
          <div>
            <span className="text-2xl font-black text-brand-green dark:text-[#EEF0EA] leading-none font-sans">
              {projects.length}
            </span>
            <p className="text-[9px] text-brand-green/70 dark:text-brand-cream/70 mt-0.5">active organize segments</p>
          </div>
        </div>
      </div>

      {/* CHART SECTION 1: Weekday Activity Trends (Responsive SVG) */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-3xl space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
            <TrendingUp size={14} className="text-brand-gold" />
            Historic Activity Trends
          </h3>
          <span className="text-[10px] text-brand-green/60 dark:text-brand-cream/60 italic">Weekly timeline</span>
        </div>

        {/* Custom Responsive SVG Chart Canvas */}
        <div className="w-full h-32 flex items-center justify-center bg-brand-green/5 dark:bg-brand-green-dark/40 rounded-2xl p-2.5">
          <svg viewBox="0 0 350 100" className="w-full h-full text-brand-green/20 dark:text-brand-gold/10" id="trends-svg-chart">
            {/* Grid baseline lines */}
            <line x1="20" y1="15" x2="330" y2="15" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="20" y1="45" x2="330" y2="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <line x1="20" y1="75" x2="330" y2="75" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />

            {/* Glowing fill path under line */}
            {totalMeetings > 0 && (
              <path
                d={`M 20,${chartHeight} L ${svgPoints[0].x},${svgPoints[0].y} ` +
                  svgPoints.slice(1).map(p => `L ${p.x},${p.y}`).join(" ") +
                  ` L ${svgPoints[svgPoints.length - 1].x},${chartHeight} Z`}
                fill="url(#boneGradFill)"
                className="opacity-25 paint-order-fill"
              />
            )}

            {/* Core trend connection line */}
            <polyline
              fill="none"
              stroke="#C9A84C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePointsStr}
            />

            {/* Glowing gradient definition */}
            <defs>
              <linearGradient id="boneGradFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Data points circle anchors + counts */}
            {svgPoints.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#ffffff"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  className="hover:scale-150 transition-transform cursor-pointer"
                />
                {point.count > 0 && (
                  <text
                    x={point.x}
                    y={point.y - 8}
                    textAnchor="middle"
                    className="text-[9px] font-bold fill-brand-green dark:fill-brand-gold font-mono"
                  >
                    {point.count}
                  </text>
                )}
                {/* Day label */}
                <text
                  x={point.x}
                  y="92"
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-brand-green/60 dark:fill-brand-cream/60"
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* CHART SECTION 2: Project Breakdown Stacked List */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-3xl space-y-3.5 shadow-sm">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
          <Folder size={14} className="text-brand-gold" />
          Library Space Allocation
        </h3>

        {totalMeetings === 0 ? (
          <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 italic text-center py-4">No allocations available.</p>
        ) : (
          <div className="space-y-3">
            {projectStats.map((proj) => (
              <div key={proj.id} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] uppercase font-extrabold text-brand-green/70 dark:text-brand-cream/70 tracking-wide">
                  <span className="flex items-center gap-1.5 font-sans">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                    {proj.name}
                  </span>
                  <span className="font-mono">{proj.count} Note{proj.count !== 1 ? "s" : ""} ({proj.percentage}%)</span>
                </div>

                {/* Progress bar container */}
                <div className="w-full h-2 bg-brand-green/5 dark:bg-brand-green-dark/40 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${proj.percentage}%` }}
                    className="h-full bg-brand-gold rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHART SECTION 3: Frequently analyzed tags */}
      <div className="bg-white dark:bg-brand-green-dark/80 border border-brand-green/10 dark:border-brand-gold/15 p-4 rounded-3xl space-y-3 shadow-sm">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-green dark:text-[#EEF0EA] flex items-center gap-1.5">
          <BarChart2 size={14} className="text-brand-gold" />
          Frequented Keyword Elements
        </h3>

        {topTags.length === 0 ? (
          <p className="text-xs text-brand-green/60 dark:text-brand-cream/60 italic text-center py-4">No analyzed tags in workspace.</p>
        ) : (
          <div className="divide-y divide-brand-green/10 dark:divide-brand-gold/10 space-y-2.5">
            {topTags.map((t, idx) => (
              <div key={t.tag} className="flex justify-between items-center pt-2.5 first:pt-0">
                <span className="text-xs font-mono font-bold text-brand-green dark:text-[#EEF0EA]">
                  {idx + 1}. #{t.tag}
                </span>

                <span className="bg-brand-gold/10 text-brand-green dark:text-brand-gold text-[10px] font-black font-mono px-2 py-0.5 rounded-full border border-brand-gold/25">
                  {t.count} Instance{t.count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
