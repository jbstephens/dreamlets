import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-cream py-6 mt-auto no-print">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-cream/80">
            © 2025 Q5 Labs, LLC. All rights reserved.
          </div>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link href="/terms">
              <span className="text-sm text-cream/80 hover:text-cream transition-colors cursor-pointer">
                Terms & Conditions
              </span>
            </Link>
            <span className="text-sm text-cream/80">
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}