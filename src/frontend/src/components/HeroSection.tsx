export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-1/10 via-chart-2/10 to-chart-3/10" />
      <div className="container relative py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-chart-1 via-chart-2 to-chart-3 bg-clip-text text-transparent">
            Discover the Future of Web3
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore, rate, and interact with decentralized applications on the Internet Computer. 
            Join the revolution of truly decentralized software.
          </p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <img src="/assets/generated/analytics-icon.dim_64x64.png" alt="Analytics" className="h-6 w-6" />
              <span>Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <img src="/assets/generated/payment-icon.dim_64x64.png" alt="Payments" className="h-6 w-6" />
              <span>Dual Payment System</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <img src="/assets/generated/ai-icon.dim_64x64.png" alt="AI" className="h-6 w-6" />
              <span>AI Recommendations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
