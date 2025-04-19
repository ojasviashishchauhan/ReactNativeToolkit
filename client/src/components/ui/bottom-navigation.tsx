import { useLocation } from "wouter";
import { Map, CalendarDays, MessageSquare, User } from "lucide-react";

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="md:hidden bg-white shadow-md border-t z-10 pb-safe pt-2">
      <div className="flex justify-around">
        <NavItem 
          href="/" 
          icon={<Map size={24} />}
          label="Explore" 
          isActive={location === "/"} 
        />
        <NavItem 
          href="/my-activities" 
          icon={<CalendarDays size={24} />}
          label="Activities" 
          isActive={location === "/my-activities"} 
        />
        <NavItem 
          href="/messages" 
          icon={<MessageSquare size={24} />}
          label="Messages" 
          isActive={location === "/messages"} 
          badge={3}
        />
        <NavItem 
          href="/profile" 
          icon={<User size={24} />}
          label="Profile" 
          isActive={location === "/profile"} 
        />
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  badge?: number;
};

function NavItem({ href, icon, label, isActive, badge }: NavItemProps) {
  const handleClick = () => {
    window.location.href = href;
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex flex-col items-center py-3 px-6 cursor-pointer transition-colors ${
        isActive 
          ? "text-primary" 
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <div className="relative mb-1">
        {icon}
        {badge && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium mt-1">{label}</span>
    </div>
  );
}
