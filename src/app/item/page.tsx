import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { ItemForm } from "@/components/item/item-form";
import { ItemTable } from "@/components/item/item-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/shadcn/button";
import { getItems } from "@/queries/item";

export const metadata: Metadata = { title: "Elementy" };

export default async function ItemPage() {
  const items = await getItems();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Elementy"
        description="Przykładowa encja: wzorzec CRUD do skopiowania."
        action={
          <ItemForm
            trigger={
              <Button>
                <PlusIcon />
                Dodaj element
              </Button>
            }
          />
        }
      />
      <ItemTable items={items} />
    </div>
  );
}
