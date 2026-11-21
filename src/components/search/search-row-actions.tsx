"use client";

import { XIcon } from "lucide-react";
import { deleteSearch } from "@/actions/search";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";

// Przycisk X na końcu wiersza: usuwa wyszukiwanie po potwierdzeniu.
export function SearchRowActions({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmDeleteButton itemName={name} icon={<XIcon />} onConfirm={() => deleteSearch(id)} />
  );
}
