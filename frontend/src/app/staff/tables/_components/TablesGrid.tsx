"use client";

import TableCard from "./TableCard";
import type { StaffTable } from "@/services/staffTables";

interface Props {
  tables: StaffTable[];
  onReserve: (table: StaffTable) => void;
  onUnlock: (table: StaffTable) => void;
}

export default function TablesGrid({ tables, onReserve, onUnlock }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onReserve={onReserve}
          onUnlock={onUnlock}
        />
      ))}
    </div>
  );
}
