import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/components/ActivityPage";
import { useNotifications } from "@/lib/store";

export const Route = createFileRoute("/notifications/")({
  head: () => ({
    meta: [
      { title: "Transaction Activities — Moniepoint Pay" },
      { name: "description", content: "Your transfers, payments, purchases and withdrawals on Moniepoint Pay." },
      { property: "og:title", content: "Transaction Activities — Moniepoint Pay" },
      { property: "og:description", content: "Your transfers, payments, purchases and withdrawals on Moniepoint Pay." },
    ],
  }),
  component: TransactionActivities,
});

function TransactionActivities() {
  const { notifications, markAllRead, unreadRewards } = useNotifications("transaction");
  return (
    <ActivityPage
      tab="transactions"
      title="Transaction Activities"
      subtitle="Deposits, transfers, payments & purchases"
      items={notifications}
      emptyText="Your transaction activity will appear here"
      onMount={markAllRead}
      unreadRewards={unreadRewards}
    />
  );
}
