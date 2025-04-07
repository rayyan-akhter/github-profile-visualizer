
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CalendarDays } from "lucide-react";
import { ContributionData } from "../types/github";
import { getContributionActivity } from "../services/githubService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityGraphProps {
  username: string;
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ username }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ContributionData | null>(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getContributionActivity(username);
        setActivityData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load activity data");
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchActivityData();
    }
  }, [username]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getColorForLevel = (level: number): string => {
    switch (level) {
      case 0: return "bg-[#ebedf0] dark:bg-[#161b22]";
      case 1: return "bg-[#9be9a8] dark:bg-[#0e4429]";
      case 2: return "bg-[#40c463] dark:bg-[#006d32]";
      case 3: return "bg-[#30a14e] dark:bg-[#26a641]";
      case 4: return "bg-[#216e39] dark:bg-[#39d353]";
      default: return "bg-[#ebedf0] dark:bg-[#161b22]";
    }
  };

  const getDayLabel = (index: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  const getMonthLabels = (): { label: string, position: number }[] => {
    if (!activityData?.weeks || activityData.weeks.length === 0) return [];
    
    const months: { label: string, position: number }[] = [];
    let currentMonth = '';
    let monthPosition = 0;
    
    activityData.weeks.forEach((week, weekIndex) => {
      week.days.forEach((day) => {
        const date = new Date(day.date);
        const month = date.toLocaleDateString(undefined, { month: 'short' });
        
        if (month !== currentMonth) {
          currentMonth = month;
          monthPosition = weekIndex;
          months.push({ label: month, position: weekIndex });
        }
      });
    });
    
    return months;
  };

  return (
    <Card className="mb-6 glass frosted-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={18} />
          Contribution Activity
        </CardTitle>
        <CardDescription>
          GitHub activity for {username} over the last year
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[130px] w-full glass-card neumorphic-inset" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive glass-card p-4">
            <p>{error}</p>
          </div>
        ) : !activityData ? (
          <div className="text-center py-8 text-muted-foreground glass-card p-4">
            <p>No activity data available for this user.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <CalendarDays size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{activityData.totalContributions} contributions in the last year</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className={`w-3 h-3 rounded-sm ${getColorForLevel(0)}`}></div>
                  <div className={`w-3 h-3 rounded-sm ${getColorForLevel(1)}`}></div>
                  <div className={`w-3 h-3 rounded-sm ${getColorForLevel(2)}`}></div>
                  <div className={`w-3 h-3 rounded-sm ${getColorForLevel(3)}`}></div>
                  <div className={`w-3 h-3 rounded-sm ${getColorForLevel(4)}`}></div>
                  <span>More</span>
                </div>
              </div>

              <div className="glass-card p-4 overflow-x-auto">
                <div className="min-w-max">
                  <div className="flex">
                    {/* Day labels */}
                    <div className="flex flex-col text-xs text-muted-foreground mr-2 h-[118px] pt-6">
                      {[0, 2, 4, 6].map(day => (
                        <div key={day} className="h-[9px] my-1">{getDayLabel(day)}</div>
                      ))}
                    </div>
                    
                    {/* Activity grid */}
                    <div>
                      {/* Month labels */}
                      <div className="flex text-xs text-muted-foreground h-6 mb-1">
                        {getMonthLabels().map((month, index) => (
                          <div key={index} 
                              className="w-[11px] mx-[2px]" 
                              style={{ marginLeft: index === 0 ? `${month.position * 15}px` : "2px" }}>
                            {month.label}
                          </div>
                        ))}
                      </div>
                      
                      {/* Grid */}
                      <div className="flex">
                        {activityData.weeks.map((week, weekIndex) => (
                          <div key={weekIndex} className="flex flex-col gap-[2px] mr-[2px]">
                            {week.days.map((day, dayIndex) => (
                              <TooltipProvider key={dayIndex}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div 
                                      className={`w-[11px] h-[11px] rounded-sm ${getColorForLevel(day.level)} hover-scale`}
                                    ></div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs">
                                      <p className="font-medium">{day.count} contributions</p>
                                      <p className="text-muted-foreground">{formatDate(day.date)}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in stagger-2">
              <div className="text-center glass-card p-3 rounded-lg neumorphic">
                <p className="text-2xl font-bold">{activityData.totalContributions}</p>
                <p className="text-sm text-muted-foreground">Total Contributions</p>
              </div>
              <div className="text-center glass-card p-3 rounded-lg neumorphic">
                <p className="text-2xl font-bold">{activityData.weeks.length}</p>
                <p className="text-sm text-muted-foreground">Active Weeks</p>
              </div>
              <div className="text-center glass-card p-3 rounded-lg neumorphic">
                <p className="text-2xl font-bold">
                  {Math.max(...activityData.weeks.flatMap(week => week.days.map(day => day.count)))}
                </p>
                <p className="text-sm text-muted-foreground">Max in a Day</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityGraph;
