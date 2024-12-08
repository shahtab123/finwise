'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
  Users,
  DollarSign,
  Receipt,
  Calendar,
  Download,
  Plus,
  FileText,
  Building2,
  Wallet,
  AlertCircle,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

// Add this interface at the top of the file
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  status: string;
  joinDate: string;
  lastPayroll: string;
  email?: string;
  phone?: string;
  employeeType?: string;
}

// Add this interface at the top with other interfaces
interface Reimbursement {
  id: string;
  employeeId: string;
  employee: string;
  type: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  receipts: number;
  description?: string;
}

// Add this interface at the top with others
interface PayrollEvent {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: 'Scheduled' | 'Pending' | 'Completed';
  description?: string;
}

// Employee List Component
export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Load employees from localStorage on mount
  useEffect(() => {
    const savedEmployees = localStorage.getItem('finwise_employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  // Add function to handle employee deletion
  const handleDeleteEmployee = (id: string) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    localStorage.setItem('finwise_employees', JSON.stringify(updatedEmployees));
  };

  // Add function to reset all employees
  const resetEmployees = () => {
    setEmployees([]);
    localStorage.removeItem('finwise_employees');
  };

  // Make resetEmployees available globally
  useEffect(() => {
    // @ts-ignore
    window.resetEmployees = resetEmployees;
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Manage employee information and payroll details</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{employees.length} Employees</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No employees added yet. Click "Add Employee" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">Since {employee.startDate}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>${employee.salary.toLocaleString()}/yr</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'Active' ? 'success' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
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
    </Card>
  );
}

// Payroll Calendar Component
export function PayrollCalendar() {
  const [events, setEvents] = useState<PayrollEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    type: '',
    amount: '',
    description: '',
    status: 'Scheduled' as const
  });

  const EVENT_TYPES = [
    'Salary Payment',
    'Tax Payment',
    'Bonus Distribution',
    'Insurance Premium',
    'Retirement Contribution',
    'Commission Payout',
    'Other'
  ];

  useEffect(() => {
    const savedEvents = localStorage.getItem('finwise_payroll_events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: PayrollEvent = {
      id: crypto.randomUUID(),
      date: formData.date,
      type: formData.type,
      amount: parseFloat(formData.amount),
      status: formData.status,
      description: formData.description
    };

    const updatedEvents = [...events, newEvent].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    setEvents(updatedEvents);
    localStorage.setItem('finwise_payroll_events', JSON.stringify(updatedEvents));

    setFormData({
      date: '',
      type: '',
      amount: '',
      description: '',
      status: 'Scheduled'
    });
    setShowAddEvent(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Scheduled' | 'Pending' | 'Completed') => {
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, status: newStatus } : event
    );
    setEvents(updatedEvents);
    localStorage.setItem('finwise_payroll_events', JSON.stringify(updatedEvents));
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    localStorage.setItem('finwise_payroll_events', JSON.stringify(updatedEvents));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payroll Calendar</CardTitle>
            <CardDescription>Upcoming payroll events and deadlines</CardDescription>
          </div>
          <Button onClick={() => setShowAddEvent(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payroll events scheduled. Click "Add Event" to create one.
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{event.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('default', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">${event.amount.toLocaleString()}</p>
                    <Badge variant={
                      event.status === 'Completed' ? 'success' :
                      event.status === 'Pending' ? 'warning' : 'outline'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={event.status}
                      onValueChange={(value: 'Scheduled' | 'Pending' | 'Completed') => 
                        handleStatusChange(event.id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payroll Event</DialogTitle>
            <DialogDescription>Schedule a new payroll event or deadline</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              {/* Event Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Date</label>
                <Input
                  type="date"
                  className="col-span-3"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Description</label>
                <Input
                  className="col-span-3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'Scheduled' | 'Pending' | 'Completed') => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Add Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Reimbursement Tracker Component
export function ReimbursementTracker() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: '',
    amount: '',
    description: '',
    receipts: '1'
  });

  const REIMBURSEMENT_TYPES = [
    'Travel',
    'Meals',
    'Office Supplies',
    'Training',
    'Software',
    'Hardware',
    'Medical',
    'Other'
  ];

  useEffect(() => {
    const savedReimbursements = localStorage.getItem('finwise_reimbursements');
    if (savedReimbursements) {
      setReimbursements(JSON.parse(savedReimbursements));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get employee details
    const employees = JSON.parse(localStorage.getItem('finwise_employees') || '[]');
    const employee = employees.find((emp: any) => emp.id === formData.employeeId);
    
    if (!employee) {
      alert('Please select an employee');
      return;
    }

    const newReimbursement: Reimbursement = {
      id: crypto.randomUUID(),
      employeeId: formData.employeeId,
      employee: employee.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      receipts: parseInt(formData.receipts),
      description: formData.description
    };

    const updatedReimbursements = [...reimbursements, newReimbursement];
    setReimbursements(updatedReimbursements);
    localStorage.setItem('finwise_reimbursements', JSON.stringify(updatedReimbursements));

    setFormData({
      employeeId: '',
      type: '',
      amount: '',
      description: '',
      receipts: '1'
    });
    setShowAddDialog(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Approved' | 'Rejected') => {
    const updatedReimbursements = reimbursements.map(r => 
      r.id === id ? { ...r, status: newStatus } : r
    );
    setReimbursements(updatedReimbursements);
    localStorage.setItem('finwise_reimbursements', JSON.stringify(updatedReimbursements));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reimbursement Claims</CardTitle>
            <CardDescription>Track and manage employee expense claims</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Reimbursement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipts</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reimbursements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  No reimbursement claims yet. Click "Add Reimbursement" to create one.
                </TableCell>
              </TableRow>
            ) : (
              reimbursements.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{claim.employee}</TableCell>
                  <TableCell>{claim.type}</TableCell>
                  <TableCell>${claim.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      claim.status === 'Approved' ? 'success' :
                      claim.status === 'Pending' ? 'warning' : 'destructive'
                    }>
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{claim.receipts} files</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {claim.status === 'Pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(claim.id, 'Approved')}
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(claim.id, 'Rejected')}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Reimbursement Claim</DialogTitle>
            <DialogDescription>Submit a new expense reimbursement request</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              {/* Employee Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Employee</label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {JSON.parse(localStorage.getItem('finwise_employees') || '[]')
                      .map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reimbursement Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Type</label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REIMBURSEMENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Description</label>
                <Input
                  className="col-span-3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of expense"
                />
              </div>

              {/* Number of Receipts */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Receipts</label>
                <Input
                  type="number"
                  className="col-span-3"
                  value={formData.receipts}
                  onChange={(e) => setFormData({ ...formData, receipts: e.target.value })}
                  placeholder="Number of receipts"
                  required
                  min="1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Submit Claim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Add Employee Dialog Component
export function AddEmployeeDialog({ open, onOpenChange }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) {
  const [formData, setFormData] = useState({
    id: crypto.randomUUID(),
    name: '',
    email: '',
    position: '',
    department: '',
    customDepartment: '',
    salary: '',
    startDate: '',
    status: 'Active',
    employeeType: 'Full-time',
    phone: ''
  });

  const [showCustomDepartment, setShowCustomDepartment] = useState(false);

  const DEPARTMENTS = [
    'Engineering',
    'Sales',
    'Marketing',
    'Operations',
    'HR',
    'Finance',
    'Custom'
  ];

  const EMPLOYEE_STATUSES = [
    'Active',
    'On Leave',
    'Terminated',
    'Suspended'
  ];

  const EMPLOYEE_TYPES = [
    'Full-time',
    'Part-time',
    'Contract',
    'Intern',
    'Temporary'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEmployee = {
      ...formData,
      department: showCustomDepartment ? formData.customDepartment : formData.department,
      id: formData.id || crypto.randomUUID(),
      lastPayroll: new Date().toISOString().split('T')[0],
      salary: parseFloat(formData.salary)
    };
    
    // Get existing employees
    const existingEmployees = JSON.parse(localStorage.getItem('finwise_employees') || '[]');
    
    // Add new employee
    const updatedEmployees = [...existingEmployees, newEmployee];
    
    // Save to localStorage
    localStorage.setItem('finwise_employees', JSON.stringify(updatedEmployees));
    
    // Trigger storage event for stats recalculation
    window.dispatchEvent(new Event('storage'));
    
    // Reset form and close dialog
    setFormData({
      id: crypto.randomUUID(),
      name: '',
      email: '',
      position: '',
      department: '',
      customDepartment: '',
      salary: '',
      startDate: '',
      status: 'Active',
      employeeType: 'Full-time',
      phone: ''
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Enter employee details to add them to payroll</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Employee ID */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Employee ID</label>
              <Input
                className="col-span-3"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="Auto-generated"
                disabled
              />
            </div>

            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Name</label>
              <Input
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                required
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Email</label>
              <Input
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@company.com"
              />
            </div>

            {/* Position */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Position</label>
              <Input
                className="col-span-3"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Job Title"
                required
              />
            </div>

            {/* Department */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Department</label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  setShowCustomDepartment(value === 'Custom');
                  setFormData({ ...formData, department: value });
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Department */}
            {showCustomDepartment && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">Custom Department</label>
                <Input
                  className="col-span-3"
                  value={formData.customDepartment}
                  onChange={(e) => setFormData({ ...formData, customDepartment: e.target.value })}
                  placeholder="Enter department name"
                  required
                />
              </div>
            )}

            {/* Employee Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Employee Type</label>
              <Select
                value={formData.employeeType}
                onValueChange={(value) => setFormData({ ...formData, employeeType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select employee type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Salary */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Salary</label>
              <Input
                type="number"
                className="col-span-3"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="Annual salary"
                required
                min="0"
                step="1000"
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

            {/* Phone (Optional) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm">Phone</label>
              <Input
                type="tel"
                className="col-span-3"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number (optional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Payroll Rules Dialog Component
export function PayrollRulesDialog({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void
}) {
  const [rules, setRules] = useState({
    overtimeRate: 1.5,
    taxRate: 0.2,
    bonusEligible: true,
    payrollDate: 25,
    autoApprove: false
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payroll Rules Configuration</DialogTitle>
          <DialogDescription>Configure payroll calculation rules and policies</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Overtime Rate</p>
              <p className="text-sm text-muted-foreground">Multiplier for overtime hours</p>
            </div>
            <Input
              type="number"
              value={rules.overtimeRate}
              onChange={(e) => setRules({ ...rules, overtimeRate: parseFloat(e.target.value) })}
              className="w-24"
              step="0.1"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tax Rate</p>
              <p className="text-sm text-muted-foreground">Default tax withholding rate</p>
            </div>
            <Input
              type="number"
              value={rules.taxRate}
              onChange={(e) => setRules({ ...rules, taxRate: parseFloat(e.target.value) })}
              className="w-24"
              step="0.01"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bonus Eligibility</p>
              <p className="text-sm text-muted-foreground">Enable performance bonuses</p>
            </div>
            <Switch
              checked={rules.bonusEligible}
              onCheckedChange={(checked) => setRules({ ...rules, bonusEligible: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Payroll Date</p>
              <p className="text-sm text-muted-foreground">Day of month for salary payment</p>
            </div>
            <Input
              type="number"
              value={rules.payrollDate}
              onChange={(e) => setRules({ ...rules, payrollDate: parseInt(e.target.value) })}
              className="w-24"
              min="1"
              max="31"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-approve Timesheets</p>
              <p className="text-sm text-muted-foreground">Automatically approve submitted hours</p>
            </div>
            <Switch
              checked={rules.autoApprove}
              onCheckedChange={(checked) => setRules({ ...rules, autoApprove: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 