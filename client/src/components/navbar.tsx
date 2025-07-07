import { BookOpen, History, User, LogOut } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-coral mr-3" />
            <h1 className="text-xl font-nunito font-bold text-navy">StoryForge</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-navy hover:text-coral transition-colors">
              <History className="h-4 w-4 mr-2 inline" />
              My Stories
            </button>
            <button className="text-navy hover:text-coral transition-colors">
              <User className="h-4 w-4 mr-2 inline" />
              Profile
            </button>
            <button className="bg-coral text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors">
              <LogOut className="h-4 w-4 mr-2 inline" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
