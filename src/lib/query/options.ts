import { queryOptions } from "@tanstack/react-query";
import { fetchSession } from "@/lib/api/mfd";
import { mfdKeys } from "@/lib/query/keys";

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: mfdKeys.session,
    queryFn: ({ signal }) => fetchSession(signal),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
