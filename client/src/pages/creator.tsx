import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupee } from "@/lib/utils";
import { TrendingUp, Users, Clock, DollarSign, Sparkles, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { creatorsQuery, quantumCreatorOptimize, type Creator } from "@/lib/api";
import { useState, useEffect } from "react";

export default function CreatorDashboard() {
  const { data: allCreators = [] } = useQuery(creatorsQuery());
  const [optimizedCreators, setOptimizedCreators] = useState<Creator[]>([]);
  const [fairnessScore, setFairnessScore] = useState(0);

  useEffect(() => {
    if (allCreators.length > 0) {
      quantumCreatorOptimize().then(result => {
        setOptimizedCreators(result.selected);
        setFairnessScore(result.fairnessScore);
      }).catch(console.error);
    }
  }, [allCreators]);

  const topCreators = optimizedCreators.length > 0 ? optimizedCreators.slice(0, 5) : allCreators.slice(0, 5);
  
  const totalViews = allCreators.reduce((s, c) => s + c.totalViews, 0);
  const avgEngagement = allCreators.length > 0 ? Math.round(allCreators.reduce((s, c) => s + c.engagementScore, 0) / allCreators.length) : 0;

  const chartData = [
    { name: 'Mon', views: 4000 },
    { name: 'Tue', views: 3000 },
    { name: 'Wed', views: 2000 },
    { name: 'Thu', views: 2780 },
    { name: 'Fri', views: 1890 },
    { name: 'Sat', views: 2390 },
    { name: 'Sun', views: 3490 },
  ];

  return (
    <div className="container px-4 py-8 min-h-screen space-y-8 relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-bold tracking-tight">Creator Dashboard</h1>
          <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20">
            <Sparkles className="w-3 h-3" /> AI Ranked
          </span>
        </div>
        <p className="text-xl text-muted-foreground">Track your impact and earnings.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Earnings" value={formatRupee(12500)} icon={DollarSign} desc="+12% from last month" trend="up" />
        <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Users} desc="+5% new viewers" trend="up" />
        <StatsCard title="Watch Time" value="1.2k hrs" icon={Clock} desc="Consistent engagement" trend="neutral" />
        <StatsCard title="Avg Engagement" value={`${avgEngagement}%`} icon={TrendingUp} desc="Platform average" trend="up" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Views Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="views" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.views > 3000 ? 'hsl(155, 100%, 23%)' : 'hsl(155, 100%, 23%, 0.3)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-lg bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Top Creators
            </CardTitle>
            {fairnessScore > 0 && (
              <p className="text-xs text-primary font-mono">Fairness Score: {(fairnessScore * 100).toFixed(0)}%</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCreators.map((creator, i) => (
                <motion.div 
                  key={creator.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl border ${i === 0 ? 'bg-white shadow-md border-primary/30' : 'bg-muted/50 border-transparent'}`}
                  data-testid={`card-creator-${creator.id}`}
                >
                  <div className="flex items-center gap-3">
                    {creator.avatar && (
                      <img src={creator.avatar} alt={creator.name} className="h-8 w-8 rounded-full" />
                    )}
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2">
                        {creator.name}
                        {creator.isNew && (
                          <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">New</span>
                        )}
                        {i === 0 && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{creator.category} &middot; {creator.tutorialCount} tutorials</p>
                    </div>
                  </div>
                  <div className="text-right font-bold text-xl text-primary">
                    {Math.round(creator.engagementScore)}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, desc, trend }: any) {
  return (
    <Card className="rounded-[2rem] border-none shadow-md hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="text-3xl font-bold" data-testid={`text-stat-${title.toLowerCase().replace(/\s/g, '-')}`}>{value}</div>
        <p className={`text-xs mt-2 font-medium ${trend === 'up' ? 'text-primary' : 'text-muted-foreground'}`}>
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}
