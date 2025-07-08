import { History, User, LogOut, Moon, Stars, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-lavender via-coral to-mint shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Moon className="h-8 w-8 text-cream animate-pulse" />
              <Stars className="h-4 w-4 text-golden absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-cream tracking-wide">Dreamlets</h1>
              <p className="text-xs text-cream/80 font-medium">✨ Magical Bedtime Stories ✨</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-cream hover:text-golden transition-colors flex items-center bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
                <User className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-white/20">
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <History className="h-4 w-4 mr-3" />
                My Stories
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <User className="h-4 w-4 mr-3" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
