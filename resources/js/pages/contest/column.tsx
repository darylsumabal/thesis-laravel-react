import { Button } from "@/components/ui/button";
import { Contests } from "@/api/contest";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Action, { ActionArchive } from "./Action";

export const columns: ColumnDef<Contests>[] = [
  {
    accessorFn: (r) => r.event.name,
    id: "name",
    header: "Event",
    cell: ({ row }) => (
      <div className="capitalize text-base">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "contest_name",
    header: "Contest Event Category",
    cell: ({ row }) => (
      <div className="capitalize text-base">{row.getValue("contest_name")}</div>
    ),
  },
  {
    accessorKey: "contest_scoring_type",
    header: "Scoring Type",
    cell: ({ row }) => (
      <div className="capitalize text-base">
        {row.getValue("contest_scoring_type")}
      </div>
    ),
  },
  {
    accessorFn: (r) => r.contest_type,
    id: "contest_type",
    header: "Contest Type",
    cell: ({ row }) => (
      <div className="capitalize text-base">{row.getValue("contest_type")}</div>
    ),
  },
  {
    accessorFn: (r) =>
      r.contest_gender_category === "maleFemale"
        ? "Male & Female"
        : r.contest_gender_category.charAt(0).toUpperCase() +
          r.contest_gender_category.slice(1).toLowerCase(),
    id: "contest_gender_category",
    header: "Category",
    cell: ({ row }) => (
      <div className="capitalize text-base">
        {row.getValue("contest_gender_category")}
      </div>
    ),
  },
  {
    accessorFn: (r) => r.contest_date,
    id: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contest Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const formattedDated = row.original.contest_date;

      const formatted = new Date(formattedDated).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return <div className="capitalize text-base">{formatted}</div>;
    },
  },

  {
    header: "Action",
    cell: ({ row }) => {
      return <Action row={row} />;
    },
  },
];

export const columnsArchive: ColumnDef<Contests>[] = [
  {
    accessorFn: (r) => r.event.name,
    id: "name",
    header: "Event",
    cell: ({ row }) => (
      <div className="capitalize text-base">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "contest_name",
    header: "Contest",
    cell: ({ row }) => (
      <div className="capitalize text-base">{row.getValue("contest_name")}</div>
    ),
  },
  {
    accessorKey: "contest_scoring_type",
    header: "Scoring Type",
    cell: ({ row }) => (
      <div className="capitalize text-base">
        {row.getValue("contest_scoring_type")}
      </div>
    ),
  },
  {
    accessorFn: (r) => r.contest_type,
    id: "contest_type",
    header: "Contest Type",
    cell: ({ row }) => (
      <div className="capitalize text-base">{row.getValue("contest_type")}</div>
    ),
  },
  {
    accessorFn: (r) =>
      r.contest_gender_category === "maleFemale"
        ? "Male & Female"
        : r.contest_gender_category.charAt(0).toUpperCase() +
          r.contest_gender_category.slice(1).toLowerCase(),
    id: "contest_gender_category",
    header: "Category",
    cell: ({ row }) => (
      <div className="capitalize text-base">
        {row.getValue("contest_gender_category")}
      </div>
    ),
  },
  {
    accessorFn: (r) => r.contest_date,
    id: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contest Date
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const formattedDated = row.original.contest_date;

      const formatted = new Date(formattedDated).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return <div className="capitalize text-base">{formatted}</div>;
    },
  },
  {
    header: "Action",
    cell: ({ row }) => {
      return <ActionArchive row={row} />;
    },
  },
];
