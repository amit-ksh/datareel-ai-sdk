import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { Popover } from "../popover";
import { Button } from "../button";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
} from "lucide-react";

const headerVariants = cva(
  "w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        dark: "bg-gray-900 border-gray-700 text-white",
        primary: "bg-brand border-brand text-white",
      },
      size: {
        sm: "px-3 py-2",
        default: "px-4 py-3",
        lg: "px-6 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface HeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof headerVariants> {
  logo?: React.ReactNode;
  title?: string;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  navigation?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }>;
  actions?: React.ReactNode;
  onUserMenuAction?: (action: "profile" | "settings" | "logout") => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  (
    {
      className,
      variant,
      size,
      logo,
      title,
      user,
      navigation = [],
      actions,
      onUserMenuAction,
      showSearch = false,
      onSearch,
      showNotifications = false,
      notificationCount = 0,
      onNotificationClick,
      ...props
    },
    ref
  ) => {
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(searchQuery);
    };

    const UserMenu = () => (
      <div className="space-y-1 min-w-48">
        {user?.name && (
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="font-medium text-sm">{user.name}</p>
            {user.email && (
              <p className="text-xs text-gray-500">{user.email}</p>
            )}
          </div>
        )}
        <button
          onClick={() => onUserMenuAction?.("profile")}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </button>
        <button
          onClick={() => onUserMenuAction?.("settings")}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </button>
        <hr className="my-1" />
        <button
          onClick={() => onUserMenuAction?.("logout")}
          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    );

    return (
      <header
        className={clsx(headerVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {logo && <div className="flex-shrink-0">{logo}</div>}
          {title && (
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          )}

          {/* Navigation */}
          {navigation.length > 0 && (
            <nav className="hidden md:flex items-center space-x-1 ml-8">
              {navigation.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={clsx(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    item.active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          {showSearch && (
            <form onSubmit={handleSearch} className="hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </form>
          )}

          {/* Notifications */}
          {showNotifications && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onNotificationClick}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Custom actions */}
          {actions && (
            <div className="flex items-center space-x-2">{actions}</div>
          )}

          {/* User menu */}
          {user && (
            <Popover
              content={<UserMenu />}
              side="bottom"
              align="end"
              trigger="click"
            >
              <Button variant="ghost" className="flex items-center space-x-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium">
                  {user.name}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </Popover>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = "Header";
