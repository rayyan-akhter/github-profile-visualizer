import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GithubRepo, CommitActivity, DailyCommits } from "../types/github";
import { getCommitActivity, processDailyCommits } from "../services/githubService";
import { GitCommit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CommitChartProps {
  username: string;
  repo: GithubRepo;
}

const CommitChart: React.FC<CommitChartProps> = ({ username, repo }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commitData, setCommitData] = useState<DailyCommits[]>([]);
  
  useEffect(() => {
    const fetchCommitActivity = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const activityData = await getCommitActivity(username, repo.name);
        
        if (activityData && activityData.length > 0) {
          const dailyCommits = processDailyCommits(activityData);
          setCommitData(dailyCommits.slice(-30));
        } else {
          setCommitData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load commit data");
      } finally {
        setLoading(false);
      }
    };
    
    if (username && repo?.name) {
      fetchCommitActivity();
    }
  }, [username, repo]);
  
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString(undefined, { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{formattedDate}</p>
          <p className="flex items-center gap-1 text-accent">
            <GitCommit size={14} />
            {payload[0].value} commits
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  const totalCommits = commitData.reduce((sum, day) => sum + day.count, 0);
  const maxCommitsInDay = commitData.length > 0 ? Math.max(...commitData.map(day => day.count)) : 0;
  const avgCommitsPerDay = commitData.length > 0 ? (totalCommits / commitData.length).toFixed(1) : 0;

  return (
    <Card className="mb-6 glass frosted-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCommit size={18} />
          Commit Activity
        </CardTitle>
        <CardDescription>
          Daily commits for {repo.name} over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full glass-card neumorphic-inset" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive glass-card p-4">
            <p>{error}</p>
          </div>
        ) : commitData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground glass-card p-4">
            <p>No commit data available for this repository.</p>
            <p className="text-sm">GitHub may still be generating statistics or this repository has no recent commits.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center glass-card p-3 rounded-lg neumorphic">
                <p className="text-2xl font-bold">{totalCommits}</p>
                <p className="text-sm text-muted-foreground">Total Commits</p>
              </div>
              <div className="text-center glass-card p-3 rounded-lg neumorphic">
                <p className="text-2xl font-bold">{maxCommitsInDay}</p>
                <p className="text-sm text-muted-foreground">Max in a Day</p>
              </div>
              <div className="text-center glass-card p-3 rounded-lg neumorphic">
                <p className="text-2xl font-bold">{avgCommitsPerDay}</p>
                <p className="text-sm text-muted-foreground">Avg per Day</p>
              </div>
            </div>
          
            <div className="h-[300px] glass-card p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={commitData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxis}
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--accent))" 
                    fill="hsla(var(--accent), 0.2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CommitChart;
