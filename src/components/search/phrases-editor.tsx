"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { MAX_PHRASES, type Phrases } from "@/validation/search";

// Edytowalna lista fraz: każdą można poprawić, usunąć lub dodać nową (do MAX_PHRASES).
export function PhrasesEditor({
  value,
  onChange,
}: {
  value: Phrases;
  onChange: (next: Phrases) => void;
}) {
  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {value.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <Input
              value={item}
              aria-label={`Fraza ${index + 1}`}
              onChange={(e) => onChange(value.map((v, i) => (i === index ? e.target.value : v)))}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Usuń frazę"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <XIcon />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={value.length >= MAX_PHRASES}
        onClick={() => onChange([...value, ""])}
      >
        <PlusIcon />
        Dodaj
      </Button>
    </div>
  );
}
