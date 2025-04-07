
import { GithubRepo, GithubUser, CommitActivity, DailyCommits, ContributionData, ContributionWeek, ContributionDay } from "../types/github";

const BASE_URL = "https://api.github.com";

export async function getUser(username: string): Promise<GithubUser> {
  const response = await fetch(`${BASE_URL}/users/${username}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch user data");
  }
  
  return response.json();
}

export async function getRepositories(username: string): Promise<GithubRepo[]> {
  const response = await fetch(`${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch repositories");
  }
  
  return response.json();
}

export async function getCommitActivity(username: string, repo: string): Promise<CommitActivity[]> {
  const response = await fetch(`${BASE_URL}/repos/${username}/${repo}/stats/commit_activity`);
  
  if (!response.ok) {
    // GitHub might return 202 while generating stats, so we just return empty array
    if (response.status === 202) {
      return [];
    }
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch commit activity");
  }
  
  return response.json();
}

export async function getContributionActivity(username: string): Promise<ContributionData> {
  // Since GitHub API doesn't provide contribution data directly through REST API,
  // we'll simulate contribution data based on recent events
  const response = await fetch(`${BASE_URL}/users/${username}/events?per_page=100`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch activity data");
  }
  
  const events = await response.json();
  
  // Process events into contribution data format
  const contributionMap = new Map<string, number>();
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  // Initialize all dates in the past year with zero contributions
  for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
    contributionMap.set(d.toISOString().split('T')[0], 0);
  }
  
  // Count events per day
  events.forEach((event: any) => {
    const date = event.created_at.split('T')[0];
    if (contributionMap.has(date)) {
      contributionMap.set(date, (contributionMap.get(date) || 0) + 1);
    }
  });
  
  // Convert to ContributionData format
  const weeks: ContributionWeek[] = [];
  const sortedDates = Array.from(contributionMap.keys()).sort();
  let currentWeek: ContributionDay[] = [];
  
  sortedDates.forEach((date) => {
    const count = contributionMap.get(date) || 0;
    // Determine level based on count (0-4)
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    if (count >= 6) level = 3;
    if (count >= 10) level = 4;
    
    currentWeek.push({ date, count, level });
    
    if (currentWeek.length === 7) {
      weeks.push({ days: [...currentWeek] });
      currentWeek = [];
    }
  });
  
  // Add the last partial week if any
  if (currentWeek.length > 0) {
    // Fill the rest of the week with empty days
    while (currentWeek.length < 7) {
      const lastDate = new Date(currentWeek[currentWeek.length - 1].date);
      lastDate.setDate(lastDate.getDate() + 1);
      currentWeek.push({
        date: lastDate.toISOString().split('T')[0],
        count: 0,
        level: 0
      });
    }
    weeks.push({ days: currentWeek });
  }
  
  const totalContributions = Array.from(contributionMap.values()).reduce((sum, count) => sum + count, 0);
  
  return { weeks, totalContributions };
}

export function processDailyCommits(commitActivities: CommitActivity[]): DailyCommits[] {
  if (!commitActivities || commitActivities.length === 0) {
    return [];
  }
  
  const dailyCommits: DailyCommits[] = [];
  
  commitActivities.forEach(weekData => {
    const weekTimestamp = weekData.week * 1000; // Convert to milliseconds
    
    weekData.days.forEach((count, dayIndex) => {
      const date = new Date(weekTimestamp + dayIndex * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      dailyCommits.push({
        date: dateStr,
        count
      });
    });
  });
  
  return dailyCommits.sort((a, b) => a.date.localeCompare(b.date));
}
