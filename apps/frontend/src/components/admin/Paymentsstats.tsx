import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const stats = [
  {
    label: "Total Revenue",
    value: "$48,295",
    change: 8.2,
    up: true,
    icon: DollarSign,
  },
  {
    label: "Pending",
    value: "$3,540",
    change: 2.1,
    up: false,
    icon: AlertCircle,
  },
  {
    label: "Refunded",
    value: "$1,210",
    change: 1.4,
    up: false,
    icon: RefreshCw,
  },
];

export function PaymentsStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-card rounded-2xl p-5 border border-border shadow-xs"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${s.up ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"}`}
              >
                {s.up ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {s.change}%
              </span>
            </div>
            <p className="text-2xl font-bold text-secondary mb-1">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}
