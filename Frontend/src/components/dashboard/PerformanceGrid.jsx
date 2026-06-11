import { Award, Lightbulb } from 'lucide-react';

export function PerformanceGrid() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Top Staff */}
      <div className="glass-card p-6 rounded-[32px]">
        <h2 className="font-headline-md text-xl text-foreground font-display font-medium mb-6">Top Staff</h2>
        <div className="space-y-5">
          <div className="flex items-center gap-4 border-b border-border/40 pb-4.5">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-black/5 relative border-2 border-primary/40">
              <img 
                className="h-full w-full object-cover" 
                alt="Priya Sharma" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwLkqEuQ1taMYcEkbLrIJj8vmJUuExlzLvA6HWOkgl6-1aLGUxhQp040p2LRSaQmJp7IXGcvTvUW_gCt4aC1gY0v90QmTySfxSGo7N4kYE9bdEKAmCZBgIl2R8sTHfsEHCazeqKuX7tj43ZTaG1VIou6VQvIcqzVBmhysHbHq3n2OhX_wOO__AI5EpxE73KmG2b_uJS0itxEwr7CjoR36p9KZD3IRoXEr1Z8mBNdUmrF0uW7Bw0qDIpQTBDTOVT9MIpljs0IlNg2__"
              />
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-primary text-[8px] flex items-center justify-center text-primary-foreground font-bold rounded-full border border-background">
                1
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">Priya Sharma</p>
              <p className="text-xs text-muted-foreground">Senior Stylist</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary text-sm">₹1.2L</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">This Mo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-black/5 relative border-2 border-primary/40">
              <img 
                className="h-full w-full object-cover" 
                alt="Vikram Singh" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXu3ne7f3gj2k1x87lau-AEwQdDR3OpDcsrr57GmWeVS5queQtxYz7NSJ0WoFoOV30myyWXXHUokwyNR-wPYS-VJXPm_WaFZZ-hLui0SKEil2eT-xHkv3X5x1r6fpTNwzp5g_gbORNbSQMvDwiUw6LZB3E8AzkQLHIfCj8VYAHcXtD6H17d8PfYGtDjy5i3UZaBqFE96uiLH30s06zvSqC3zIsDEHG39l0OCOUgaTx2lwCjXy1cWnMCLrRvuUQ2TrpS5MDJzbhe6CDfp"
              />
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-primary text-[8px] flex items-center justify-center text-primary-foreground font-bold rounded-full border border-background">
                2
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">Vikram Singh</p>
              <p className="text-xs text-muted-foreground">Barber Specialist</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary text-sm">₹98k</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">This Mo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="glass-card p-6 rounded-[32px]">
        <h2 className="font-headline-md text-xl text-foreground font-display font-medium mb-6">Top Services</h2>
        <div className="space-y-4.5">
          <div className="p-4 bg-white border border-border/40 rounded-2xl hover:bg-primary/5 transition-all">
            <div className="flex justify-between items-center mb-2 text-xs font-semibold">
              <span className="text-foreground">Balayage Artistry</span>
              <span className="text-primary">42 Bookings</span>
            </div>
            <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.3)]"></div>
            </div>
          </div>

          <div className="p-4 bg-white border border-border/40 rounded-2xl hover:bg-primary/5 transition-all">
            <div className="flex justify-between items-center mb-2 text-xs font-semibold">
              <span className="text-foreground">Deep Hydration Facial</span>
              <span className="text-primary">38 Bookings</span>
            </div>
            <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[72%] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.3)]"></div>
            </div>
          </div>

          <div className="p-4 bg-white border border-border/40 rounded-2xl hover:bg-primary/5 transition-all">
            <div className="flex justify-between items-center mb-2 text-xs font-semibold">
              <span className="text-foreground">Bridal Makeup</span>
              <span className="text-primary">29 Bookings</span>
            </div>
            <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[55%] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.3)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Insights */}
      <div className="glass-card p-6 rounded-[32px] bg-white border border-border/40 relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-4">
            <Lightbulb className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="font-headline-md text-xl text-foreground font-display font-medium mb-2">Atelier Insights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Based on your trends, Friday evenings are seeing a 20% spike in men's grooming requests.
          </p>
        </div>

        <div className="mt-6 relative z-10 p-4.5 bg-black/5 border border-border/40 backdrop-blur-md rounded-2xl">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1 font-sans">
            <Award className="h-3.5 w-3.5" /> Recommendation
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            Activate "Happy Hours" for Haircuts on Wed-Thu to balance the weekly load.
          </p>
          <button className="mt-4 w-full py-2 bg-primary hover:opacity-90 active:scale-95 text-primary-foreground rounded-xl font-bold text-xs transition-all shadow-md">
            Apply Strategy
          </button>
        </div>
      </div>
    </section>
  );
}

export default PerformanceGrid;
