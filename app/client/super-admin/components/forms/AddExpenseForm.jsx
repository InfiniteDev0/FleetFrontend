"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AddExpenseForm = ({
  dialogOpen,
  setDialogOpen,
  formData,
  setFormData,
  handleAddExpense,
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  // Wrap handleAddExpense to control submitting state
  const handleSubmit = async (e) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await handleAddExpense(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="!pt-3 border-t !mt-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" disabled={submitting}>
            Add Expense
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Enter expense details for this trip
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="!space-y-4">
            <div>
              <Label htmlFor="Payment">Payment</Label>
              <Input
                id="Payment"
                type="number"
                step="0.01"
                placeholder="e.g. 500"
                value={formData.Payment}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, Payment: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="rate">Exchange rate</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                placeholder="e.g. 2.5"
                value={formData.rate}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, rate: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Calculated Amount (USD)</Label>
              <Input
                id="amount"
                type="text"
                disabled
                value={
                  formData.Payment &&
                  formData.rate &&
                  Number(formData.rate) !== 0
                    ? `$${(
                        Number(formData.Payment) / Number(formData.rate)
                      ).toFixed(2)}`
                    : "$0.00"
                }
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="e.g. Fuel refill"
                value={formData.reason}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, reason: e.target.value }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddExpenseForm;
