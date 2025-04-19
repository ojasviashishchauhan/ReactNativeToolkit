import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Home, CalendarDays, MessageSquare, User as UserIcon, LogOut, Map, Activity } from "lucide-react";

type SidebarProps = {
  user: User | null;
};

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-70 bg-white shadow-md z-10">
      {/* App Logo */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity size={24} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            Connect
          </h1>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-3">
          <SidebarLink 
            href="/" 
            icon={<Map size={20} />}
            label="Explore" 
            isActive={location === "/"} 
          />
          <SidebarLink 
            href="/my-activities" 
            icon={<CalendarDays size={20} />}
            label="My Activities" 
            isActive={location === "/my-activities"} 
          />
          <SidebarLink 
            href="/messages" 
            icon={<MessageSquare size={20} />}
            label="Messages" 
            isActive={location === "/messages"} 
            badge={3} 
          />
          <SidebarLink 
            href="/profile" 
            icon={<UserIcon size={20} />}
            label="Profile" 
            isActive={location === "/profile"} 
          />
        </ul>
      </nav>

      {/* User Section */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={`${user.username}'s avatar`} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-gray-200">
                <span className="text-primary font-semibold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-800">{user.username}</p>
              <button 
                onClick={handleLogout}
                className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors mt-1"
              >
                <LogOut size={14} className="mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
};

function SidebarLink({ href, icon, label, isActive, badge }: SidebarLinkProps) {
  const handleClick = () => {
    window.location.href = href;
  };
  
  return (
    <li>
      <div
        onClick={handleClick}
        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
          isActive 
            ? "bg-blue-50 text-primary font-medium" 
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
        {badge && (
          <span className="ml-auto bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
    </li>
  );
}
