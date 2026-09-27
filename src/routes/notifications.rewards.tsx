import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ActivityPage, type ActivityItem } from "@/components/ActivityPage";
import { useNotifications } from "@/lib/store";
import { useRewardHistory } from "@/lib/rewards";

export const Route = createFileRoute("/notifications/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards / EARN — Moniepoint Pay" },
      { name: "description", content: "Every reward, bonus and EARN activity credited to your Moniepoint Pay account." },
      { property: "og:title", content: "Rewards / EARN — Moniepoint Pay" },
      { property: "og:description", content: "Every reward, bonus and EARN activity credited to your Moniepoint Pay account." },
    ],
  }),
  component: RewardsActivities,
});

function RewardsActivities() {
  const { notifications, markAllRead, unreadTx } = useNotifications("reward");
  const history = useRewardHistory();
  const items = useMemo<ActivityItem[]>(() => {
    const fromHistory: ActivityItem[] = history.map((r) => ({
      id: r.id, title: r.title, sub: "Reward credited to your balance", amount: r.amount, status: "Credited", dateISO: r.dateISO,
    }));
    return [...notifications, ...fromHistory].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [notifications, history]);
  return (
    <ActivityPage
      tab="rewards"
      title="Rewards / EARN"
      subtitle="Earned rewards, bonuses & EARN activities"
      items={items}
      emptyText="Complete EARN tasks, spin or claim daily rewards to see them here"
      onMount={markAllRead}
      unreadTx={unreadTx}
    />
  );
}
