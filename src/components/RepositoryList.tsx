
import React from "react";
import { GithubRepo } from "../types/github";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, Calendar, ExternalLink, CircleAlert } from "lucide-react";

interface RepositoryListProps {
  repos: GithubRepo[];
  onRepoSelect: (repo: GithubRepo) => void;
  selectedRepo?: GithubRepo;
}

const RepositoryList: React.FC<RepositoryListProps> = ({ 
  repos, 
  onRepoSelect,
  selectedRepo 
}) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Map languages to colors
  const languageColors: Record<string, string> = {
    "JavaScript": "bg-yellow-400",
    "TypeScript": "bg-blue-500",
    "Python": "bg-green-500",
    "Java": "bg-red-600",
    "Go": "bg-cyan-500",
    "Ruby": "bg-red-500",
    "PHP": "bg-purple-500",
    "C#": "bg-green-600",
    "C++": "bg-pink-500",
    "C": "bg-gray-500",
    "HTML": "bg-orange-500",
    "CSS": "bg-blue-400",
    "Swift": "bg-orange-600",
    "Kotlin": "bg-purple-400",
    "Rust": "bg-amber-600",
    "Dart": "bg-blue-300",
    "Shell": "bg-gray-600",
    "Jupyter Notebook": "bg-orange-300",
  };

  return (
    <Card className="mb-6 glass frosted-glass">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Repositories ({repos.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <Card 
              key={repo.id} 
              className={`cursor-pointer transition-all glass-card ${
                selectedRepo?.id === repo.id ? 'ring-2 ring-primary/50' : ''
              }`}
              onClick={() => onRepoSelect(repo)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 overflow-hidden">
                    <CardTitle className="text-lg truncate flex items-center">
                      {repo.name}
                      {repo.fork && (
                        <span className="ml-2 text-xs">
                          <Badge variant="outline" className="flex items-center gap-1 glass-button">
                            <GitFork size={12} />
                            Fork
                          </Badge>
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <a 
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
                {repo.description && (
                  <CardDescription className="line-clamp-2 h-10">
                    {repo.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2">
                  {repo.language && (
                    <Badge variant="secondary" className="flex items-center gap-1 glass-button">
                      <span 
                        className={`w-2 h-2 rounded-full ${languageColors[repo.language] || 'bg-gray-400'}`}
                      ></span>
                      {repo.language}
                    </Badge>
                  )}
                  
                  {repo.topics && repo.topics.slice(0, 2).map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs glass-button">
                      {topic}
                    </Badge>
                  ))}
                  
                  {repo.archived && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <CircleAlert size={12} />
                      Archived
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground pt-0">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{formatDate(repo.created_at)}</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} />
                    <span>{repo.stargazers_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork size={14} />
                    <span>{repo.forks_count}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RepositoryList;
