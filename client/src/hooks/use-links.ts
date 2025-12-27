import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateLinkRequest } from "@shared/routes";

// GET /api/links - List all links
export function useLinks() {
  return useQuery({
    queryKey: [api.links.list.path],
    queryFn: async () => {
      const res = await fetch(api.links.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch links");
      return api.links.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/links/:alias - Get single link details
export function useLink(alias: string) {
  return useQuery({
    queryKey: [api.links.get.path, alias],
    queryFn: async () => {
      const url = buildUrl(api.links.get.path, { alias });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch link details");
      return api.links.get.responses[200].parse(await res.json());
    },
    enabled: !!alias,
  });
}

// GET /api/links/:id/analytics - Get analytics data
export function useLinkAnalytics(id: number | undefined) {
  return useQuery({
    queryKey: [api.links.getAnalytics.path, id],
    queryFn: async () => {
      if (!id) return [];
      const url = buildUrl(api.links.getAnalytics.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.links.getAnalytics.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/links - Create new link
export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateLinkRequest) => {
      // Basic validation handled by Zod on server, but good to have safety
      const res = await fetch(api.links.create.path, {
        method: api.links.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.links.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create short link");
      }
      return api.links.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.links.list.path] });
    },
  });
}
