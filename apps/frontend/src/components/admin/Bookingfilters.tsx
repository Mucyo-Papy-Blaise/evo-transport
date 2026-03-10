"use client";

import { useState } from "react";
import { ChevronDown, Check, Filter, X } from "lucide-react";
import { cn } from "@/utils/utils";
import { BookingStatus } from "@/types";
import { Button } from "@/components/ui/button";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"];

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "text-amber-600 bg-amber-50",
  CONFIRMED: "text-emerald-600 bg-emerald-50",
  REJECTED: "text-red-600 bg-red-50",
  CANCELLED: "text-gray-600 bg-gray-50",
  COMPLETED: "text-blue-600 bg-blue-50",
};

interface BookingFiltersProps {
  onFilterChange: (filters: { status?: BookingStatus; search?: string }) => void;
  totalBookings?: number;
}

export function BookingFilters({ onFilterChange, totalBookings }: BookingFiltersProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState("");


  const selectStatus = (status: BookingStatus) => {
    const newStatus = selectedStatus === status ? null : status;
    setSelectedStatus(newStatus);
    setStatusOpen(false);
    
    // Call onFilterChange after state update
    setTimeout(() => {
      onFilterChange({ 
        status: newStatus || undefined, 
        search: searchTerm 
      });
    }, 0);
  };

  const clearFilters = () => {
    setSelectedStatus(null);
    setSearchTerm("");
    
    // Call onFilterChange after state updates
    setTimeout(() => {
      onFilterChange({});
    }, 0);
  };

  const hasActiveFilters = selectedStatus !== null || searchTerm;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Status filter - Single select */}
      <div className="relative">
        <button
          onClick={() => setStatusOpen(!statusOpen)}
          className={cn(
            "flex items-center gap-2 h-9 px-3 rounded-lg border transition-colors text-sm",
            selectedStatus
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-card text-foreground hover:border-primary"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">
            {selectedStatus ? STATUS_LABELS[selectedStatus] : "Status"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        
        {statusOpen && (
          <div className="absolute top-11 left-0 z-50 bg-card border border-border rounded-xl shadow-lg p-2 min-w-48">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => selectStatus(status)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border",
                      selectedStatus === status
                        ? "bg-primary border-primary"
                        : "border-border",
                    )}
                  >
                    {selectedStatus === status && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", STATUS_COLORS[status])}>
                    {STATUS_LABELS[status]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}

      {/* Total count */}
      {totalBookings !== undefined && (
        <div className="text-sm text-muted-foreground ml-auto">
          Total: <span className="font-medium text-foreground">{totalBookings}</span>
        </div>
      )}
    </div>
  );
}