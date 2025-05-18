
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthContext } from "@/providers/auth-provider";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

export function AppHeader() {
  const { user, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="border-b sticky top-0 z-30 bg-primary text-primary-foreground shadow-md">
      <div className="flex h-16 items-center px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3 font-bold text-xl">
          <img 
            src="/src/logo.jpg" 
            alt="CUT & TRACK MRP" 
            className="h-10 w-10 rounded-md" 
          />
          <div className="flex flex-col items-start">
            <span className="hidden md:inline uppercase tracking-wide">CUT & TRACK MRP</span>
            <span className="text-xs text-primary-foreground/80 hidden md:inline">ITAR Compliant · Aerospace CNC</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button 
            variant="secondary" 
            size="sm"
            className="h-10 w-10 rounded-md p-0"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-10 px-4 font-medium rounded-md flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.name || user.email.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-bold">{user.name || user.email.split('@')[0]}</span>
                    <span>{user.email}</span>
                    <span className="text-xs mt-1 bg-secondary text-secondary-foreground py-0.5 px-2 rounded-full w-fit">
                      {user.role}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button 
                    className="w-full cursor-pointer text-left flex items-center gap-2"
                    onClick={() => logout()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
