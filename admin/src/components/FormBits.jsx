import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui";

export const BackLink = ({ to, children }) => (
  <Link to={to} className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
    <ArrowLeft className="size-4" /> {children}
  </Link>
);

/** Sticky save bar at the bottom of long forms. */
export function SaveBar({ saving, label = "Save", onCancel, formId }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex justify-end gap-2 border-t border-stone-200 bg-stone-100/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      <Button type="submit" form={formId} loading={saving}>{label}</Button>
    </div>
  );
}
