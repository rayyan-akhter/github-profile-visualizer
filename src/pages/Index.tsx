
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Github, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getUser, getRepositories } from "../services/githubService";
import { GithubUser, GithubRepo } from "../types/github";
import UserHeader from "@/components/UserHeader";
import RepositoryList from "@/components/RepositoryList";
import CommitChart from "@/components/CommitChart";
import ActivityGraph from "@/components/ActivityGraph";

const Index = () => {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<GithubUser | null>(null);
  const [repositories, setRepositories] = useState<GithubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: "Username is required",
        description: "Please enter a GitHub username to search",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setUserData(null);
    setRepositories([]);
    setSelectedRepo(null);
    setSearchInitiated(true);
    
    try {
      // Fetch user data
      const user = await getUser(username);
      setUserData(user);
      
      // Fetch repositories
      const repos = await getRepositories(username);
      setRepositories(repos);
      
      // Select first non-fork repo with most stars
      const sortedRepos = [...repos]
        .filter(repo => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count);
      
      if (sortedRepos.length > 0) {
        setSelectedRepo(sortedRepos[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch GitHub data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl bg-gradient-to-br from-background to-muted/50 min-h-screen">
      <div className="flex flex-col items-center justify-center mb-8 animate-fade-in">
        <div className="flex items-center mb-2">
          <Github className="h-8 w-8 mr-2 animate-pulse-slow text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GitHub Profile Analyzer
          </h1>
        </div>
        <p className="text-muted-foreground mb-6 animate-fade-in stagger-1">
          Enter a GitHub username to analyze their profile and repository activity
        </p>
        
        <Card className="w-full max-w-xl glass frosted-glass animate-scale-in stagger-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Enter GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 glass-input"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="shrink-0 glass-button hover-scale"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Searching...
                  </span>
                ) : "Analyze"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-12 animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      {userData && !isLoading && (
        <div className="animate-fade-in">
          <UserHeader user={userData} />
          
          {repositories.length > 0 && (
            <div className="mb-8 animate-slide-in stagger-1">
              <RepositoryList 
                repos={repositories} 
                onRepoSelect={(repo) => setSelectedRepo(repo)}
                selectedRepo={selectedRepo || undefined}
              />
            </div>
          )}
          
          {selectedRepo && (
            <div className="animate-slide-in stagger-2">
              <CommitChart username={username} repo={selectedRepo} />
            </div>
          )}
          
          <div className="animate-slide-in stagger-3">
            <ActivityGraph username={username} />
          </div>
        </div>
      )}
      
      {!userData && !isLoading && (
        <div className={`flex flex-col items-center justify-center py-12 text-center ${searchInitiated ? "animate-fade-in" : "animate-scale-in stagger-3"}`}>
          <div className="glass neumorphic p-8 rounded-full">
            <Github className="h-16 w-16 text-primary/70 animate-pulse-slow" />
          </div>
          <h2 className="text-2xl font-bold mt-4 mb-2">No Profile Selected</h2>
          <p className="text-muted-foreground max-w-md">
            Enter a GitHub username above to see their profile information, repository list, and commit activity.
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
