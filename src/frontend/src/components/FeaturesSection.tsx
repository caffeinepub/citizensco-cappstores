import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Sparkles, Target, TrendingUp } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <img
          src="/assets/generated/analytics-icon.dim_64x64.png"
          alt="Analytics"
          className="h-12 w-12"
        />
      ),
      title: "Real-time Analytics",
      description:
        "Track user engagement, clicks, and geographic metrics with comprehensive dashboards.",
    },
    {
      icon: (
        <img
          src="/assets/generated/payment-icon.dim_64x64.png"
          alt="Payments"
          className="h-12 w-12"
        />
      ),
      title: "Dual Payment System",
      description:
        "Accept both fiat payments via Stripe and ICP tokens with automatic revenue splitting.",
    },
    {
      icon: (
        <img
          src="/assets/generated/ai-icon.dim_64x64.png"
          alt="AI"
          className="h-12 w-12"
        />
      ),
      title: "AI-Powered Recommendations",
      description:
        "Get personalized DApp suggestions based on your browsing history and preferences.",
    },
    {
      icon: (
        <img
          src="/assets/generated/ads-icon.dim_64x64.png"
          alt="Advertising"
          className="h-12 w-12"
        />
      ),
      title: "Performance-Based Ads",
      description:
        "Promote your DApps with targeted advertising and earn based on engagement metrics.",
    },
  ];

  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Everything You Need for Web3 Success
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive platform designed for the decentralized future
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="border-border/50 hover:border-primary/50 transition-colors"
          >
            <CardHeader>
              <div className="mb-4">{feature.icon}</div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
