
import { GithubRepo, GithubUser, CommitActivity, DailyCommits } from "../types/github";

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
