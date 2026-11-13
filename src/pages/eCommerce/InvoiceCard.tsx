"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Download,
  Mail,
  MapPin,
  Phone,
  Printer,
  Send,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                       Static sample data (replace freely)                  */
/* -------------------------------------------------------------------------- */

const invoice = {
  number: "INV-001245",
  status: "Unpaid",
  issueDate: "Oct 25, 2025",
  dueDate: "Nov 5, 2025",
  terms: "Net 11 days",
  currency: "USD",
  from: {
    name: "ReactBoard Technologies",
    address: ["123 Innovation Street", "San Francisco, CA 94107", "United States"],
    email: "support@reactboard.com",
    phone: "+1 555 234 5678",
  },
  to: {
    name: "John Doe",
    company: "Pixel Studio Ltd.",
    address: ["22 Green Valley Road", "Austin, TX 73301", "United States"],
    email: "john@pixelstudio.com",
    phone: "+1 555 789 1234",
  },
  items: [
    {
      name: "ReactBoard Admin Template",
      description: "Extended license, lifetime updates",
      qty: 1,
      price: "$49.00",
      total: "$49.00",
    },
    {
      name: "Custom UI Kit Development",
      description: "Design tokens and 24 custom components",
      qty: 2,
      price: "$120.00",
      total: "$240.00",
    },
    {
      name: "React Integration Support",
      description: "Setup, routing and theming assistance",
      qty: 1,
      price: "$80.00",
      total: "$80.00",
    },
  ],
  subtotal: "$369.00",
  taxRate: "10%",
  tax: "$36.90",
  total: "$405.90",
  payment: {
    bank: "First National Bank",
    accountName: "ReactBoard Technologies",
    accountNumber: "•••• •••• 4821",
    reference: "INV-001245",
  },
  notes:
    "Please include the invoice number as the payment reference. Late payments may be subject to a 2% monthly fee.",
}

const statusClass = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/30"
    case "Unpaid":
      return "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30"
    case "Overdue":
      return "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function Invoice() {
  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-6">
      {/* ACTION BAR (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to invoices
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Send className="mr-1.5 h-4 w-4" />
            Send
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Download PDF
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" />
            Print invoice
          </Button>
        </div>
      </div>

      {/* INVOICE */}
      <Card className="overflow-hidden py-0 print:border-0 print:shadow-none">
        {/* Header band */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b bg-muted/30 px-6 py-8 sm:px-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                R
              </div>
              <span className="text-lg font-semibold tracking-tight">{invoice.from.name}</span>
            </div>

            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{invoice.from.address.join(", ")}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                {invoice.from.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                {invoice.from.phone}
              </p>
            </div>
          </div>

          <div className="space-y-2 sm:text-right">
            <p className="text-3xl font-semibold tracking-tight">Invoice</p>
            <p className="text-sm text-muted-foreground">#{invoice.number}</p>
            <Badge variant="outline" className={statusClass(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>
        </div>

        <CardContent className="space-y-8 px-6 py-8 sm:px-10">
          {/* Key details */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Issue date</p>
              <p className="mt-1 text-sm font-medium">{invoice.issueDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due date</p>
              <p className="mt-1 text-sm font-medium">{invoice.dueDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment terms</p>
              <p className="mt-1 text-sm font-medium">{invoice.terms}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 sm:text-right">
              <p className="text-xs text-muted-foreground">Amount due</p>
              <p className="mt-1 text-xl font-semibold">{invoice.total}</p>
            </div>
          </div>

          <Separator />

          {/* Billed to */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Billed to</p>
              <div className="space-y-0.5 text-sm">
                <p className="text-base font-semibold">{invoice.to.name}</p>
                <p>{invoice.to.company}</p>
                {invoice.to.address.map((line) => (
                  <p key={line} className="text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:text-right">
              <p className="text-xs font-medium text-muted-foreground">Contact</p>
              <div className="space-y-0.5 text-sm">
                <p>{invoice.to.email}</p>
                <p className="text-muted-foreground">{invoice.to.phone}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Qty</th>
                  <th className="hidden px-4 py-3 text-right font-medium sm:table-cell">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {invoice.items.map((item) => (
                  <tr key={item.name}>
                    <td className="px-4 py-4">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      {/* Mobile only */}
                      <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                        {item.qty} × {item.price}
                      </p>
                    </td>
                    <td className="hidden px-4 py-4 text-center sm:table-cell">{item.qty}</td>
                    <td className="hidden px-4 py-4 text-right sm:table-cell">{item.price}</td>
                    <td className="px-4 py-4 text-right font-medium">{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals + payment */}
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="order-2 space-y-4 sm:order-1">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Payment details</p>
                <dl className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 text-muted-foreground">Bank</dt>
                    <dd>{invoice.payment.bank}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 text-muted-foreground">Account name</dt>
                    <dd>{invoice.payment.accountName}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 text-muted-foreground">Account no.</dt>
                    <dd>{invoice.payment.accountNumber}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 text-muted-foreground">Reference</dt>
                    <dd>{invoice.payment.reference}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="order-1 sm:order-2">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{invoice.subtotal}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax ({invoice.taxRate})</dt>
                  <dd>{invoice.tax}</dd>
                </div>
                <Separator />
                <div className="flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3 text-base font-semibold">
                  <dt>Total due</dt>
                  <dd className="text-lg">{invoice.total}</dd>
                </div>
              </dl>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Notes</p>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>

          <p className="text-center text-sm font-medium">Thank you for your business.</p>
        </CardContent>
      </Card>
    </div>
  )
}