export function RevenueChart({ revenueTimeframe, setRevenueTimeframe, chartPoints, maxChartVal }) {
  return (
    <section className="glass-card p-6 md:p-8 rounded-[32px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-headline-md text-2xl text-foreground font-display font-medium">Revenue Trend</h2>
          <p className="font-body-sm text-sm text-muted-foreground mt-1">Financial health analysis across your branches</p>
        </div>
        <div className="flex bg-primary/5 border border-primary/10 p-1 rounded-full">
          {['7D', '30D', '90D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setRevenueTimeframe(tf)}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 ${
                revenueTimeframe === tf
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Visual Bars */}
      <div className="h-[280px] w-full flex items-end justify-between gap-2 md:gap-4 px-2 md:px-4 pb-4">
        {chartPoints.map((point, index) => {
          const val = point.value;
          const label = point.label;
          const percentHeight = Math.max(12, Math.min(100, Math.round((val / maxChartVal) * 100)));
          const isHighest = val === maxChartVal;

          return (
            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full relative flex justify-center" style={{ height: `${percentHeight}%` }}>
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-inverse-surface text-inverse-on-surface px-2.5 py-1 rounded-md text-[10px] font-bold shadow-lg pointer-events-none whitespace-nowrap z-10 border border-white/10">
                  ₹{val.toLocaleString('en-IN')}
                </div>
                {/* Bar */}
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 cursor-pointer ${
                    isHighest
                      ? 'bg-primary shadow-lg shadow-primary/20 group-hover:brightness-110'
                      : 'bg-black/5 hover:bg-primary/30 group-hover:brightness-125'
                  }`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold font-sans mt-3 group-hover:text-primary transition-colors whitespace-nowrap">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RevenueChart;
