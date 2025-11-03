import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, User, Settings, LogOut, Bell } from 'lucide-react';
import logo from "../../assets/cipher_peak full.png"

interface NavbarProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

const Navbar = ({ onThemeToggle, isDark }: NavbarProps) => {
  const [notifications] = useState(3);

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-40 h-40 rounded-lg flex items-center justify-center">
            <img src={logo} alt="" />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onThemeToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger text-danger-foreground text-xs rounded-full flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback className="bg-[#4D4D4D] hover:bg-[#4D4D4D] hover:text-[#ffff] text-white">JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">John Doe</p>
                <p className="text-xs leading-none text-muted-foreground">john@company.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;