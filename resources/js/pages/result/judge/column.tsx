import { JudgesGroup } from "@/api/result";
import { ColumnDef } from "@tanstack/react-table";

export const column: ColumnDef<JudgesGroup>[] = [
  {
    accessorFn: (item) => item.judges.name,
    accessorKey: "judge",
    header: "Judge",
    cell: ({ row }) => {
      return <div className="capitalize">{row.getValue("judge")}</div>;
    },
  },
  {
    accessorFn: (item) => (item?.is_finished === 0 ? "UNFINISHED" : "FINISHED"),
    accessorKey: "score",
    header: "Finished",
    cell: ({ row }) => {
      const a = row.original.is_finished === 0;

      return (
        <div
          className={`uppercase p-1 rounded-xs ${a ? "bg-destructive" : "bg-emerald-600"}`}
        >
          {row.getValue("score")}
        </div>
      );
    },
  },
];

export const columnMultiple: ColumnDef<JudgesGroup>[] = [
  {
    accessorFn: (item) => item.judge?.name ?? "NA",
    accessorKey: "judge",
    header: "Judge",
    cell: ({ row }) => {
      return <div className="capitalize">{row.getValue("judge")}</div>;
    },
  },
  {
    accessorFn: (item) => (item?.isJudgeFinished ? "FINISHED" : "UNFINISHED"),
    accessorKey: "score",
    header: "Finished",
    cell: ({ row }) => {
      const a = row.original.isJudgeFinished;
      return (
        <div
          className={`uppercase p-1 rounded-xs ${a ? "bg-emerald-600" : "bg-destructive"}`}
        >
          {row.getValue("score")}
        </div>
      );
    },
  },
];
