'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AddInvestmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddInvestment: (investment: any) => void
}

export function AddInvestmentDialog({ open, onOpenChange, onAddInvestment }: AddInvestmentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    value: '',
    initialValue: '',
    purchaseDate: '',
    riskLevel: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddInvestment({
      ...formData,
      value: parseFloat(formData.value),
      initialValue: parseFloat(formData.initialValue),
      return: ((parseFloat(formData.value) - parseFloat(formData.initialValue)) / parseFloat(formData.initialValue) * 100).toFixed(2),
      lastUpdated: new Date().toISOString().split('T')[0],
      managementUrl: '#'
    });
    onOpenChange(false);
    setFormData({
      name: '',
      type: '',
      value: '',
      initialValue: '',
      purchaseDate: '',
      riskLevel: '',
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
          <DialogDescription>
            Enter the details of your investment below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                  <SelectItem value="Bonds">Bonds</SelectItem>
                  <SelectItem value="ETF">ETF</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Current Value
              </Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="col-span-3"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialValue" className="text-right">
                Initial Value
              </Label>
              <Input
                id="initialValue"
                type="number"
                value={formData.initialValue}
                onChange={(e) => setFormData({ ...formData, initialValue: e.target.value })}
                className="col-span-3"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchaseDate" className="text-right">
                Purchase Date
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="riskLevel" className="text-right">
                Risk Level
              </Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) => setFormData({ ...formData, riskLevel: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Investment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 