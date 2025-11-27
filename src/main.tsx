import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CookiesProvider } from "react-cookie";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection time
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </QueryClientProvider>
);
