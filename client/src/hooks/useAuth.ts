import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user");
        if (response.status === 401) {
          return null; // User is not authenticated, this is normal for guests
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      } catch (error) {
        return null; // Return null for any auth errors, treating as guest
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}