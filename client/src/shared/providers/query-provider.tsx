"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            60 * 1000,   // 1 min default (hooks override per-query)
            gcTime:               5 * 60 * 1000, // keep unused data 5 min in memory
            retry:                1,
            retryDelay:           attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10_000),
            refetchOnWindowFocus: false,
            refetchOnReconnect:   true,         // refetch when back online
          },
          mutations: {
            retry: 0, // don't retry mutations automatically
          },
        },
      })
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
