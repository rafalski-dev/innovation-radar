import type { Metadata } from "next";
import { BusinessForm } from "@/components/business/business-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Nowa organizacja" };

export default function NewBusinessPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nowa" accent="organizacja" />
      <BusinessForm />
    </div>
  );
}
