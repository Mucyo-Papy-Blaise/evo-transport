import { cn } from "@/utils/utils";
import { CreditCard } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-600",
  pending: "bg-amber-50 text-amber-600",
  failed: "bg-red-50 text-red-500",
  refunded: "bg-muted text-muted-foreground",
};

const payments = [
  {
    id: "PAY-001",
    booking: "EA-24-BJ-01.02.2020",
    customer: "Ronald Garza",
    amount: "$320.00",
    method: "Visa •••• 4242",
    status: "paid",
    date: "Feb 05, 2020",
  },
  {
    id: "PAY-002",
    booking: "AA-90-JK-01.02.2020",
    customer: "Evie Upton",
    amount: "$850.00",
    method: "Mastercard •••• 8821",
    status: "paid",
    date: "Feb 22, 2020",
  },
  {
    id: "PAY-003",
    booking: "BG-30-KK-01.02.2020",
    customer: "James Howell",
    amount: "$175.00",
    method: "Visa •••• 1234",
    status: "failed",
    date: "Feb 17, 2020",
  },
  {
    id: "PAY-004",
    booking: "CC-12-AB-01.02.2020",
    customer: "Maria Chen",
    amount: "$540.00",
    method: "PayPal",
    status: "pending",
    date: "Feb 10, 2020",
  },
  {
    id: "PAY-005",
    booking: "DD-55-XY-01.02.2020",
    customer: "David Kim",
    amount: "$210.00",
    method: "Visa •••• 9876",
    status: "refunded",
    date: "Feb 01, 2020",
  },
];

export function PaymentsTable() {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                "Payment ID",
                "Booking",
                "Customer",
                "Amount",
                "Method",
                "Status",
                "Date",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p, i) => (
              <tr
                key={i}
                className="hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-xs text-foreground font-medium">
                  {p.id}
                </td>
                <td className="px-6 py-4 text-muted-foreground text-xs">
                  {p.booking}
                </td>
                <td className="px-6 py-4 font-medium text-foreground">
                  {p.customer}
                </td>
                <td className="px-6 py-4 font-bold text-secondary">
                  {p.amount}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CreditCard className="w-3.5 h-3.5" />
                    {p.method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "capitalize text-xs font-semibold px-2.5 py-1 rounded-full",
                      STATUS_STYLES[p.status],
                    )}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
