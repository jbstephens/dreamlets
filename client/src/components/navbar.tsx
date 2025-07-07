import { History, User, LogOut, Moon, Stars, Sparkles } from "lucide-react";

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
          <div className="flex items-center space-x-4">
            <button className="text-cream hover:text-golden transition-colors flex items-center bg-white/20 px-3 py-2 rounded-full backdrop-blur-sm">
              <History className="h-4 w-4 mr-2" />
              My Stories
            </button>
            <button className="text-cream hover:text-golden transition-colors flex items-center bg-white/20 px-3 py-2 rounded-full backdrop-blur-sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
            <button className="bg-sunset text-white px-4 py-2 rounded-full hover:bg-sunset/90 transition-all shadow-lg flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
