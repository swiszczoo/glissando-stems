import { QueryKey, useQueryClient } from "@tanstack/react-query";

export function useQueryData(key: QueryKey) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData(key);
}
