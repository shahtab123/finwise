'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Building2,
  DollarSign,
  FileText,
  Calendar,
  Download,
  Plus,
  Star,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  FileWarning,
  Edit,
  Trash,
  Mail,
  Phone,
  Globe,
  Upload
} from "lucide-react"
import { cn } from "@/lib/utils"

// Interfaces
interface Vendor {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  website?: string;
  rating: number;
  status: 'Active' | 'Inactive';
  totalSpend: number;
  paymentTerms: string;
  address?: string;
  ratingHistory?: {
    rating: number;
    date: string;
    note?: string;
  }[];
}

interface Payment {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  invoiceNumber: string;
  description?: string;
}

interface Contract {
  id: string;
  vendorId: string;
  vendorName: string;
  type: string;
  startDate: string;
  expiryDate: string;
  value: number;
  status: 'Active' | 'Expired' | 'Pending';
  description?: string;
  documents?: {
    name: string;
    size: string;
    type: string;
    uploadDate: string;
  }[];
}

// Add this rating component at the top of the file
function StarRating({ rating, onRate, readOnly = false }: { 
  rating: number; 
  onRate?: (rating: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onRate?.(i + 1)}
          className={cn(
            "focus:outline-none",
            !readOnly && "cursor-pointer hover:scale-110 transition-transform"
          )}
        >
          <Star
            className={`h-4 w-4 ${
              i < rating 
                ? 'text-yellow-500 fill-yellow-500' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Vendor List Component
export function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showEditVendor, setShowEditVendor] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [ratingNote, setRatingNote] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedVendors = localStorage.getItem('finwise_vendors');
    if (savedVendors) {
      setVendors(JSON.parse(savedVendors));
    }
  }, [refreshTrigger]);

  const handleDeleteVendor = (id: string) => {
    const updatedVendors = vendors.filter(v => v.id !== id);
    setVendors(updatedVendors);
    localStorage.setItem('finwise_vendors', JSON.stringify(updatedVendors));
  };

  const handleRate = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor);
      setRatingNote('');
      setShowRatingDialog(true);
    }
  };

  const submitRating = (newRating: number) => {
    if (!selectedVendor) return;

    const updatedVendors = vendors.map(vendor => 
      vendor.id === selectedVendor.id 
        ? { 
            ...vendor, 
            rating: newRating,
            ratingHistory: [
              ...(vendor.ratingHistory || []),
              { 
                rating: newRating, 
                date: new Date().toISOString(),
                note: ratingNote 
              }
            ]
          }
        : vendor
    );

    setVendors(updatedVendors);
    localStorage.setItem('finwise_vendors', JSON.stringify(updatedVendors));
    setShowRatingDialog(false);
    setSelectedVendor(null);
    setRatingNote('');
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowEditVendor(true);
  };

  const handleEditSubmit = (updatedVendor: Vendor) => {
    const updatedVendors = vendors.map(v => 
      v.id === updatedVendor.id ? updatedVendor : v
    );
    
    setVendors(updatedVendors);
    localStorage.setItem('finwise_vendors', JSON.stringify(updatedVendors));
    setShowEditVendor(false);
    setSelectedVendor(null);
    
    // Trigger storage event for stats recalculation
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vendor Directory</CardTitle>
            <CardDescription>Manage supplier information and relationships</CardDescription>
          </div>
          <Button onClick={() => setShowAddVendor(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Spend</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No vendors added yet. Click "Add Vendor" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-muted-foreground">{vendor.paymentTerms}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.category}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {vendor.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {vendor.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${vendor.totalSpend.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StarRating 
                          rating={vendor.rating} 
                          readOnly 
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleRate(vendor.id)}
                        >
                          Update Rating
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === 'Active' ? 'success' : 'secondary'}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Vendor</DialogTitle>
            <DialogDescription>
              Rate {selectedVendor?.name}'s performance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <StarRating 
                rating={selectedVendor?.rating || 0}
                onRate={submitRating}
              />
              <Input
                placeholder="Add a note about this rating (optional)"
                value={ratingNote}
                onChange={(e) => setRatingNote(e.target.value)}
              />
            </div>

            {selectedVendor?.ratingHistory && selectedVendor.ratingHistory.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Rating History</h4>
                <div className="space-y-2">
                  {selectedVendor.ratingHistory.map((history, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div>
                        <StarRating rating={history.rating} readOnly />
                        {history.note && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {history.note}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(history.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Edit Vendor Dialog */}
      <Dialog open={showEditVendor} onOpenChange={setShowEditVendor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>Update vendor information</DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit(selectedVendor);
              }} 
              className="space-y-4"
            >
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Name</label>
                  <Input
                    className="col-span-3"
                    value={selectedVendor.name}
                    onChange={(e) => setSelectedVendor({
                      ...selectedVendor,
                      name: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Category</label>
                  <Input
                    className="col-span-3"
                    value={selectedVendor.category}
                    onChange={(e) => setSelectedVendor({
                      ...selectedVendor,
                      category: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Email</label>
                  <Input
                    type="email"
                    className="col-span-3"
                    value={selectedVendor.email}
                    onChange={(e) => setSelectedVendor({
                      ...selectedVendor,
                      email: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Phone</label>
                  <Input
                    className="col-span-3"
                    value={selectedVendor.phone}
                    onChange={(e) => setSelectedVendor({
                      ...selectedVendor,
                      phone: e.target.value
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Website</label>
                  <Input
                    type="url"
                    className="col-span-3"
                    value={selectedVendor.website || ''}
                    onChange={(e) => setSelectedVendor({
                      ...selectedVendor,
                      website: e.target.value
                    })}
                    placeholder="https://"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Payment Terms</label>
                  <Input
                    className="col-span-3"
                    value={selectedVendor.paymentTerms}
                    onChange={(e) => setSelectedVendor({
                      ...selectedVendor,
                      paymentTerms: e.target.value
                    })}
                    placeholder="Net 30"
                    required
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Address</label>
                  <Input
                    className="col-span-3"
                    value={selectedVendor.address || ''}
                    onChange={(e) => setSelectedVendor({
                      ...selectedVendor,
                      address: e.target.value
                    })}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm">Status</label>
                  <Select
                    value={selectedVendor.status}
                    onValueChange={(value: 'Active' | 'Inactive') => 
                      setSelectedVendor({
                        ...selectedVendor,
                        status: value
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AddVendorDialog 
        open={showAddVendor} 
        onOpenChange={setShowAddVendor}
        onSuccess={handleRefresh}
      />
    </Card>
  );
}

// Payment Tracker Component
export function PaymentTracker() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    amount: '',
    dueDate: '',
    invoiceNumber: '',
    description: '',
    status: 'Pending' as const
  });

  const PAYMENT_STATUSES = [
    'Pending',
    'Paid',
    'Overdue'
  ] as const;

  useEffect(() => {
    const savedPayments = localStorage.getItem('finwise_vendor_payments');
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get vendor details
    const vendors = JSON.parse(localStorage.getItem('finwise_vendors') || '[]');
    const vendor = vendors.find((v: any) => v.id === formData.vendorId);
    
    if (!vendor) {
      alert('Please select a vendor');
      return;
    }

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      vendorId: formData.vendorId,
      vendorName: vendor.name,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      status: formData.status,
      invoiceNumber: formData.invoiceNumber,
      description: formData.description
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    localStorage.setItem('finwise_vendor_payments', JSON.stringify(updatedPayments));

    // Reset form
    setFormData({
      vendorId: '',
      amount: '',
      dueDate: '',
      invoiceNumber: '',
      description: '',
      status: 'Pending'
    });
    setShowAddPayment(false);

    // Trigger storage event for stats recalculation
    window.dispatchEvent(new Event('storage'));
  };

  const handleStatusChange = (id: string, newStatus: 'Paid' | 'Pending' | 'Overdue') => {
    const updatedPayments = payments.map(payment => 
      payment.id === id ? { ...payment, status: newStatus } : payment
    );
    setPayments(updatedPayments);
    localStorage.setItem('finwise_vendor_payments', JSON.stringify(updatedPayments));
    
    // Trigger storage event for stats recalculation
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Tracker</CardTitle>
            <CardDescription>Track and manage vendor payments</CardDescription>
          </div>
          <Button onClick={() => setShowAddPayment(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No payments recorded yet. Click "Add Payment" to create one.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.vendorName}</TableCell>
                  <TableCell>{payment.invoiceNumber}</TableCell>
                  <TableCell>${payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      payment.status === 'Paid' ? 'success' :
                      payment.status === 'Pending' ? 'warning' : 'destructive'
                    }>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={payment.status}
                        onValueChange={(value: 'Paid' | 'Pending' | 'Overdue') => 
                          handleStatusChange(payment.id, value)
                        }
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Add Payment Dialog */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
            <DialogDescription>Record a new vendor payment</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              {/* Vendor Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Vendor</label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {JSON.parse(localStorage.getItem('finwise_vendors') || '[]')
                      .map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice Number */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Invoice #</label>
                <Input
                  className="col-span-3"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="Enter invoice number"
                  required
                />
              </div>

              {/* Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Amount</label>
                <Input
                  type="number"
                  className="col-span-3"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Due Date</label>
                <Input
                  type="date"
                  className="col-span-3"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Description</label>
                <Input
                  className="col-span-3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Payment description (optional)"
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Paid' | 'Pending' | 'Overdue') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Add Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Contract Manager Component
export function ContractManager() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAddContract, setShowAddContract] = useState(false);
  const [formData, setFormData] = useState({
    vendorId: '',
    type: '',
    value: '',
    startDate: '',
    expiryDate: '',
    description: '',
    status: 'Active' as const,
    documents: [] as string[]
  });

  const CONTRACT_TYPES = [
    'Software License',
    'Service Agreement',
    'Maintenance Contract',
    'Supply Agreement',
    'Consulting Agreement',
    'Equipment Lease',
    'Support Contract',
    'Other'
  ];

  useEffect(() => {
    const savedContracts = localStorage.getItem('finwise_vendor_contracts');
    if (savedContracts) {
      setContracts(JSON.parse(savedContracts));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get vendor details
    const vendors = JSON.parse(localStorage.getItem('finwise_vendors') || '[]');
    const vendor = vendors.find((v: any) => v.id === formData.vendorId);
    
    if (!vendor) {
      alert('Please select a vendor');
      return;
    }

    const newContract: Contract = {
      id: crypto.randomUUID(),
      vendorId: formData.vendorId,
      vendorName: vendor.name,
      type: formData.type,
      startDate: formData.startDate,
      expiryDate: formData.expiryDate,
      value: parseFloat(formData.value),
      status: formData.status,
      description: formData.description,
      documents: formData.documents
    };

    const updatedContracts = [...contracts, newContract];
    setContracts(updatedContracts);
    localStorage.setItem('finwise_vendor_contracts', JSON.stringify(updatedContracts));

    setFormData({
      vendorId: '',
      type: '',
      value: '',
      startDate: '',
      expiryDate: '',
      description: '',
      status: 'Active',
      documents: []
    });
    setShowAddContract(false);

    // Trigger storage event for stats recalculation
    window.dispatchEvent(new Event('storage'));
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Expired' | 'Pending') => {
    const updatedContracts = contracts.map(contract => 
      contract.id === id ? { ...contract, status: newStatus } : contract
    );
    setContracts(updatedContracts);
    localStorage.setItem('finwise_vendor_contracts', JSON.stringify(updatedContracts));
  };

  const handleDeleteContract = (id: string) => {
    const updatedContracts = contracts.filter(contract => contract.id !== id);
    setContracts(updatedContracts);
    localStorage.setItem('finwise_vendor_contracts', JSON.stringify(updatedContracts));
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );
    return days;
  };

  const handleFileUpload = (contractId: string, files: FileList | null) => {
    if (!files) return;

    const fileMetadata = Array.from(files).map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      uploadDate: new Date().toISOString()
    }));

    const updatedContracts = contracts.map(contract => {
      if (contract.id === contractId) {
        return {
          ...contract,
          documents: [
            ...(contract.documents || []),
            ...fileMetadata
          ]
        };
      }
      return contract;
    });

    setContracts(updatedContracts);
    localStorage.setItem('finwise_vendor_contracts', JSON.stringify(updatedContracts));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (doc: any) => {
    // Create a link element
    const link = document.createElement('a');
    
    // Set link properties
    link.href = doc.data;
    link.download = doc.name;
    
    // Append link to body, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Management</CardTitle>
            <CardDescription>Track vendor contracts and renewals</CardDescription>
          </div>
          <Button onClick={() => setShowAddContract(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Contract
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No contracts added yet. Click "Add Contract" to create one.
                </TableCell>
              </TableRow>
            ) : (
              contracts.map((contract) => {
                const daysUntilExpiry = getDaysUntilExpiry(contract.expiryDate);
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                
                return (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.vendorName}</TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>${contract.value.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">
                          Start: {new Date(contract.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          End: {new Date(contract.expiryDate).toLocaleDateString()}
                        </p>
                        {isExpiringSoon && (
                          <Badge variant="warning" className="mt-1">
                            Expires in {daysUntilExpiry} days
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={contract.status}
                        onValueChange={(value: 'Active' | 'Expired' | 'Pending') => 
                          handleStatusChange(contract.id, value)
                        }
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {contract.documents && contract.documents.length > 0 ? (
                          <div className="space-y-1">
                            {contract.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <div>
                                    <span className="text-sm">{doc.name}</span>
                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                      <span>{doc.size}</span>
                                      <span>•</span>
                                      <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => window.open(URL.createObjectURL(new Blob()), '_blank')}
                                  disabled
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No documents</p>
                        )}
                        <div className="relative">
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileUpload(contract.id, e.target.files)}
                            multiple
                            aria-label="Upload contract documents"
                          />
                          <Button variant="outline" size="sm" className="w-full">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteContract(contract.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={showAddContract} onOpenChange={setShowAddContract}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contract</DialogTitle>
            <DialogDescription>Create a new vendor contract</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              {/* Vendor Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Vendor</label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) => setFormData({ ...formData, vendorId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {JSON.parse(localStorage.getItem('finwise_vendors') || '[]')
                      .map((vendor: any) => (
                        <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contract Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contract Value */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Value</label>
                <Input
                  type="number"
                  className="col-span-3"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Contract value"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Start Date</label>
                <Input
                  type="date"
                  className="col-span-3"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              {/* Expiry Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Expiry Date</label>
                <Input
                  type="date"
                  className="col-span-3"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Description</label>
                <Input
                  className="col-span-3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Contract description"
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Active' | 'Expired' | 'Pending') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Add Contract</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Add Vendor Dialog Component
export function AddVendorDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    email: '',
    phone: '',
    website: '',
    paymentTerms: '',
    address: '',
    status: 'Active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVendor: Vendor = {
      id: crypto.randomUUID(),
      ...formData,
      rating: 0,
      totalSpend: 0
    };

    const existingVendors = JSON.parse(localStorage.getItem('finwise_vendors') || '[]');
    const updatedVendors = [...existingVendors, newVendor];
    localStorage.setItem('finwise_vendors', JSON.stringify(updatedVendors));

    setFormData({
      name: '',
      category: '',
      email: '',
      phone: '',
      website: '',
      paymentTerms: '',
      address: '',
      status: 'Active'
    });

    if (onSuccess) {
      onSuccess();
    }

    onOpenChange(false);

    // Trigger storage event for stats recalculation
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogDescription>Enter vendor details to add them to your system</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Name</label>
              <Input
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Category</label>
              <Input
                className="col-span-3"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Email</label>
              <Input
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Phone</label>
              <Input
                className="col-span-3"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Website</label>
              <Input
                type="url"
                className="col-span-3"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Payment Terms</label>
              <Input
                className="col-span-3"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="Net 30"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Address</label>
              <Input
                className="col-span-3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Inactive') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add Vendor</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 