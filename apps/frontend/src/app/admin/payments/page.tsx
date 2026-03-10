import { PaymentsStats } from "@/components/admin/Paymentsstats";
import { PaymentsTable } from '@/components/admin/Paymentstable';

export default function PaymentsPage() {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all transactions and payment statuses</p>
        </div>
        <button className="h-9 px-4 rounded-lg bg-secondary hover:bg-primary text-secondary-foreground text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <PaymentsStats />

      {/* Table */}
      <PaymentsTable />
    </div>
  );
}