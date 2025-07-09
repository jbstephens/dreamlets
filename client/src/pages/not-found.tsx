import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cream">
      <Card className="w-full max-w-md mx-4 bg-white">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-navy">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist.
          </p>
          
          <button
            onClick={() => window.location.href = "/"}
            className="mt-4 px-4 py-2 bg-coral text-white rounded-lg hover:bg-coral/80 transition-colors"
          >
            Go to Home
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
