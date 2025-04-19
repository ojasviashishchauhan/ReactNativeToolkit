import { Link, useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="md:hidden bg-white shadow-md border-t z-10">
      <div className="flex justify-around">
        <NavItem 
          href="/" 
          icon="fas fa-map-marker-alt" 
          label="Explore" 
          isActive={location === "/"} 
        />
        <NavItem 
          href="/my-activities" 
          icon="fas fa-calendar-plus" 
          label="Activities" 
          isActive={location === "/my-activities"} 
        />
        <NavItem 
          href="/messages" 
          icon="fas fa-comment" 
          label="Messages" 
          isActive={location === "/messages"} 
          badge={3}
        />
        <NavItem 
          href="/profile" 
          icon="fas fa-user" 
          label="Profile" 
          isActive={location === "/profile"} 
        />
      </div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  badge?: number;
};

function NavItem({ href, icon, label, isActive, badge }: NavItemProps) {
  return (
    <Link href={href}>
      <a 
        className={`flex flex-col items-center py-4 px-5 ${
          isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <div className="relative">
          <i className={`${icon} text-2xl mb-1`}></i>
          {badge && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {badge}
            </span>
          )}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </a>
    </Link>
  );
}
