import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/register")({
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/activate", search: { ref: search.ref } });
  },
});
