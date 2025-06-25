import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { PricingTable } from "@clerk/nextjs";

export function PricingTableSection() {
  return (
    <section className="py-8">
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold">
            Simple & Transparent Pricing
          </CardTitle>
          <CardDescription className="text-xl max-w-2xl mx-auto">
            No hidden fees. Just great features designed to empower your
            presentations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <PricingTable />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
