import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";

export default function Home() {
  const sections = site.nav.filter((item) => item.href !== "/");

  return (
    <div className="space-y-8">
      <PageHeader title={site.name} description={site.description} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
                <CardDescription>Przejdź do sekcji „{item.label}”</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
