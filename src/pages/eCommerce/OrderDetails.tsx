"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
  ArrowLeft,
  Check,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Truck,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                       Static sample data (replace freely)                  */
/* -------------------------------------------------------------------------- */

const order = {
  id: "ORD-003",
  status: "Completed",
  paymentStatus: "Paid",
  date: "Feb 3, 2024",
  subtotal: "$220.00",
  tax: "$15.75",
  shipping: "$10.00",
  total: "$245.75",
  customer: {
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1 (555) 214-8890",
    avatar: "https://randomuser.me/api/portraits/men/30.jpg",
    orders: 8,
  },
  shippingAddress: ["Michael Brown", "742 Evergreen Terrace", "Springfield, IL 62704", "United States"],
  payment: { method: "Visa", last4: "4242" },
  items: [
    { name: "Denim Jacket", variant: "Blue / M", sku: "DNM-JKT-BLU-M", price: "$95.00", qty: 1, total: "$95.00", image: "/pulse-ui-react/products/01.png" },
    { name: "Leather Belt", variant: "Brown / 34", sku: "LTH-BLT-BRN-34", price: "$45.00", qty: 1, total: "$45.00", image: "/pulse-ui-react/products/02.png" },
    { name: "Cotton T-Shirt", variant: "White / L", sku: "CTN-TSH-WHT-L", price: "$25.00", qty: 2, total: "$50.00", image: "/pulse-ui-react/products/03.png" },
    { name: "Canvas Cap", variant: "Black / One size", sku: "CNV-CAP-BLK-OS", price: "$30.00", qty: 1, total: "$30.00", image: "/pulse-ui-react/products/04.png" },
  ],
  timeline: [
    { title: "Order placed", note: "Order placed by Michael Brown", time: "Feb 3, 10:24 AM", icon: Package },
    { title: "Payment confirmed", note: "Visa •••• 4242 charged $245.75", time: "Feb 3, 10:25 AM", icon: CreditCard },
    { title: "Order shipped", note: "Tracking no. 1Z999AA10123456784", time: "Feb 4, 2:10 PM", icon: Truck },
    { title: "Order completed", note: "Delivered to the customer", time: "Feb 6, 11:42 AM", icon: Check },
  ],
}

const statusClass = (status: string) => {
  switch (status) {
    case "Completed":
    case "Paid":
      return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/30"
    case "Pending":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/30"
    case "Processing":
      return "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30"
    case "Cancelled":
      return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function OrderDetails() {
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div className="min-w-0 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" aria-label="Back to orders" className="mt-0.5 print:hidden">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Order {order.id}</h1>
              <Badge variant="outline" className={statusClass(order.status)}>
                {order.status}
              </Badge>
              <Badge variant="outline" className={statusClass(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Placed on {order.date} · {itemCount} items
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" size="sm">
            <FileText className="mr-1.5 h-4 w-4" />
            Invoice
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ============================ MAIN COLUMN ============================ */}
        <div className="min-w-0 space-y-6">
          {/* ORDER ITEMS */}
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="space-y-1.5">
                <CardTitle>Order items</CardTitle>
                <CardDescription>
                  {order.items.length} products · {itemCount} items
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="pl-6">Product</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Price</TableHead>
                    <TableHead className="hidden text-center sm:table-cell">Qty</TableHead>
                    <TableHead className="pr-6 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 shrink-0 rounded-lg border bg-muted/50 object-cover p-1"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.variant} · {item.sku}
                            </p>
                            {/* Mobile only: price and quantity under the name */}
                            <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                              {item.price} × {item.qty}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden text-right sm:table-cell">{item.price}</TableCell>
                      <TableCell className="hidden text-center sm:table-cell">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-medium">
                          {item.qty}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right font-medium">{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* TOTALS */}
              <div className="border-t bg-muted/20 px-6 py-5">
                <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd>{order.subtotal}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd>{order.shipping}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tax</dt>
                    <dd>{order.tax}</dd>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold">
                    <dt>Total</dt>
                    <dd>{order.total}</dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>

          {/* ORDER ACTIVITY */}
          <Card>
            <CardHeader>
              <CardTitle>Order activity</CardTitle>
              <CardDescription>Track every step of this order.</CardDescription>
            </CardHeader>

            <CardContent>
              <ol className="relative space-y-6">
                {order.timeline.map((step, i) => {
                  const Icon = step.icon
                  const isLast = i === order.timeline.length - 1
                  return (
                    <li key={step.title} className="relative flex gap-4">
                      {/* connector line */}
                      {!isLast && (
                        <span
                          aria-hidden
                          className="absolute left-[17px] top-9 h-[calc(100%-12px)] w-px bg-border"
                        />
                      )}

                      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 space-y-0.5 pt-0.5">
                        <div className="flex flex-wrap items-center justify-between gap-x-4">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-muted-foreground">{step.time}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.note}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* ============================== SIDEBAR ============================== */}
        <aside className="min-w-0 space-y-6 print:hidden">
          {/* CUSTOMER */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={order.customer.avatar}
                  alt={order.customer.name}
                  className="h-12 w-12 rounded-full border object-cover"
                />
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.orders} orders</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2.5 text-sm">
                <p className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate text-foreground">{order.customer.email}</span>
                </p>
                <p className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="text-foreground">{order.customer.phone}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SHIPPING ADDRESS */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2.5 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <address className="space-y-0.5 not-italic">
                {order.shippingAddress.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
            </CardContent>
          </Card>

          {/* PAYMENT */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-12 items-center justify-center rounded-md border bg-muted/50">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">
                    {order.payment.method} •••• {order.payment.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">Credit card</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusClass(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{order.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* ACTIONS */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select defaultValue="Completed">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button className="w-full">Update status</Button>

              <Separator />

              <Button variant="outline" className="w-full">
                Refund order
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-500/40 text-red-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
              >
                Cancel order
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}