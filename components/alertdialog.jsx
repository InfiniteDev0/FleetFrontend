import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Reusable AlertDialog wrapper with open state
// Convert this file to .tsx for TypeScript support
// @ts-nocheck

export function DeleteTruckAlert({ trigger, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {React.cloneElement(trigger, {
          onClick: (e) => {
            e.preventDefault();
            setOpen(true);
            if (trigger.props.onClick) trigger.props.onClick(e);
          },
        })}
      </AlertDialogTrigger>
      {open && children(() => setOpen(false))}
    </AlertDialog>
  );
}
