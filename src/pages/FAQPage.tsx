"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import {
  CircleHelp,
  FileText,
  Mail,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

type Faq = { q: string; a: ReactNode }
type Category = {
  value: string
  title: string
  icon: LucideIcon
  faqs: Faq[]
}

const categories: Category[] = [
  {
    value: "purchasing",
    title: "Purchasing Templates",
    icon: ShoppingCart,
    faqs: [
      {
        q: "How do I purchase a template?",
        a: "Browse our collection, select your desired template, and click “Buy Now.” You’ll be redirected to our secure checkout page to complete the payment.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit/debit cards, PayPal, and other secure online payment options depending on your region.",
      },
      {
        q: "Will I receive updates after purchase?",
        a: "Yes, once you purchase a template, you’ll receive free updates whenever improvements or fixes are released.",
      },
    ],
  },
  {
    value: "refunds",
    title: "Refund Policy",
    icon: RotateCcw,
    faqs: [
      {
        q: "Do you offer refunds?",
        a: (
          <>
            Yes. We provide a{" "}
            <b className="font-semibold text-foreground">7-day refund policy</b>{" "}
            if you face technical issues that cannot be resolved by our support team.
          </>
        ),
      },
      {
        q: "When am I not eligible?",
        a: "Refunds are not available for change of mind, third-party incompatibility, or issues caused by user environment.",
      },
      {
        q: "How do I request one?",
        a: "Contact our support team with your order details. If the issue cannot be fixed, we’ll process your refund.",
      },
    ],
  },
  {
    value: "quality",
    title: "Work Quality & Support",
    icon: ShieldCheck,
    faqs: [
      {
        q: "Are templates tested?",
        a: "Yes, all templates are thoroughly tested for responsiveness, cross-browser compatibility, and clean code standards.",
      },
      {
        q: "Do you provide support?",
        a: (
          <>
            Yes, we provide{" "}
            <b className="font-semibold text-foreground">6 months of free support</b>{" "}
            with every purchase.
          </>
        ),
      },
      {
        q: "Can I customize them?",
        a: "Absolutely! Our templates are built with clean, developer-friendly code and include documentation.",
      },
    ],
  },
  {
    value: "licensing",
    title: "Licensing & Usage",
    icon: FileText,
    faqs: [
      {
        q: "Can I use one template for multiple projects?",
        a: "Our standard license allows one template per project/client. Additional projects require additional licenses.",
      },
      {
        q: "Do I need to give credit?",
        a: "No credit is required for premium templates. Attribution is appreciated for free versions.",
      },
    ],
  },
  {
    value: "general",
    title: "General Questions",
    icon: CircleHelp,
    faqs: [
      {
        q: "Do you offer discounts?",
        a: "Yes, we offer bundle packs and special discounts. Check our Everything Bundle for maximum value.",
      },
      {
        q: "Can I resell templates?",
        a: "No. Redistribution or reselling is strictly prohibited. Templates are for your own or client projects only.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <section className="relative isolate overflow-hidden px-6">

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground supports-backdrop-filter:backdrop-blur-md">
            <CircleHelp className="h-3.5 w-3.5 text-primary" />
            FAQ
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Everything you need to know about purchasing, licensing, and support.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <Accordion
            type="single"
            collapsible
            defaultValue="purchasing"
            className="space-y-3"
          >
            {categories.map(({ value, title, icon: Icon, faqs }) => (
              <AccordionItem
                key={value}
                value={value}
                className="rounded-2xl border bg-background/60 px-5 shadow-sm transition-colors last:border-b supports-backdrop-filter:backdrop-blur-xl data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="py-5 hover:no-underline">
                  <span className="flex items-center gap-4 text-left">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-base font-semibold text-foreground md:text-lg">
                        {title}
                      </span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {faqs.length} questions
                      </span>
                    </span>
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pb-6 sm:pl-14">
                  <dl className="divide-y">
                    {faqs.map((faq) => (
                      <div
                        key={faq.q}
                        className="py-4 first:pt-0 last:pb-0"
                      >
                        <dt className="text-sm font-medium text-foreground md:text-base">
                          {faq.q}
                        </dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-base">
                          {faq.a}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-background/60 p-6 text-center shadow-sm supports-backdrop-filter:backdrop-blur-xl sm:flex-row sm:text-left"
        >
          <div>
            <p className="font-semibold text-foreground">Still have questions?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Can’t find what you’re looking for? Our support team is happy to help.
            </p>
          </div>

          <Button asChild size="lg" className="w-full shrink-0 rounded-xl sm:w-auto">
            <a href="mailto:support@example.com">
              <Mail />
              Contact support
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}