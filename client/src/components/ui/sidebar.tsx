import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

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
    <div className="hidden md:flex md:flex-col md:w-64 bg-white shadow-md z-10">
      {/* App Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/connect-logo.png" 
            alt="Connect Logo" 
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-xl font-bold text-gray-800">Connect</h1>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <SidebarLink 
            href="/" 
            icon="fas fa-map-marker-alt" 
            label="Explore" 
            isActive={location === "/"} 
          />
          <SidebarLink 
            href="/my-activities" 
            icon="fas fa-calendar-plus" 
            label="My Activities" 
            isActive={location === "/my-activities"} 
          />
          <SidebarLink 
            href="/messages" 
            icon="fas fa-comment" 
            label="Messages" 
            isActive={location === "/messages"} 
            badge={3} 
          />
          <SidebarLink 
            href="/profile" 
            icon="fas fa-user" 
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
                className="w-10 h-10 rounded-full object-cover" 
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-800">{user.username}</p>
              <div className="flex items-center text-xs text-gray-600">
                <button 
                  onClick={handleLogout}
                  className="hover:text-primary hover:underline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SidebarLinkProps = {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  badge?: number;
};

function SidebarLink({ href, icon, label, isActive, badge }: SidebarLinkProps) {
  return (
    <li>
      <Link href={href}>
        <a className={`flex items-center space-x-3 p-2 rounded-lg ${
          isActive 
            ? "bg-blue-50 text-primary font-medium" 
            : "text-gray-700 hover:bg-gray-100"
        }`}>
          <i className={`${icon} w-6`}></i>
          <span>{label}</span>
          {badge && (
            <span className="ml-auto bg-primary text-white text-xs rounded-full px-2 py-0.5">
              {badge}
            </span>
          )}
        </a>
      </Link>
    </li>
  );
}
