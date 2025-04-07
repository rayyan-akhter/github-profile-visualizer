import React from "react";
import { GithubRepo, GithubUser } from "../types/github";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink, Users, Mail, MapPin, Briefcase } from "lucide-react";

interface UserHeaderProps {
  user?: GithubUser;
  repos: GithubRepo;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, repos }) => {

  return (
    <Card className="mb-6 glass frosted-glass animate-scale-in">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 ring-2 ring-primary/30 ring-offset-2 animate-scale-in hover-scale neumorphic">
            <AvatarImage src={user.avatar_url} alt={user.login} />
            <AvatarFallback>
              {user.login.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold animate-fade-in">
              {user.name || user.login}
            </h2>
            <h3 className="text-lg text-muted-foreground mb-2 animate-fade-in stagger-1">
              {user.login}
            </h3>

            {user.bio && (
              <p className="mb-4 animate-fade-in stagger-2">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline animate-fade-in stagger-1 hover-scale"
              >
                <ExternalLink size={16} />
                GitHub Profile
              </a>

              <div className="flex items-center gap-1 animate-fade-in stagger-2">
                <Users size={16} />
                {user.followers} followers · {user.following} following
              </div>

              {user.email && (
                <div className="flex items-center gap-1 animate-fade-in stagger-2">
                  <Mail size={16} />
                  {user.email}
                </div>
              )}

              {user.location && (
                <div className="flex items-center gap-1 animate-fade-in stagger-3">
                  <MapPin size={16} />
                  {user.location}
                </div>
              )}

              {user.company && (
                <div className="flex items-center gap-1 animate-fade-in stagger-3">
                  <Briefcase size={16} />
                  {user.company}
                </div>
              )}
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-3 rounded-lg animate-fade-in stagger-1 hover-scale">
                <p className="text-2xl font-bold">{user.public_repos}</p>
                <p className="text-sm text-muted-foreground">Repositories</p>
              </div>
              <div className="glass-card p-3 rounded-lg animate-fade-in stagger-2 hover-scale">
                <p className="text-2xl font-bold">{user.public_gists}</p>
                <p className="text-sm text-muted-foreground">Gists</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserHeader;
