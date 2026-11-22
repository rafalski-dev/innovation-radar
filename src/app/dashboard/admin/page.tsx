import type { Metadata } from "next";
import {
  addBlockedEmail,
  addBlockedTopic,
  removeBlockedEmail,
  removeBlockedTopic,
} from "@/actions/admin";
import { AdminBlocklist } from "@/components/admin/admin-blocklist";
import { AdminSettings } from "@/components/admin/admin-settings";
import { AdminSources } from "@/components/admin/admin-sources";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/admin";
import { FEEDBACK_LABELS } from "@/validation/feedback";
import { getAdminData } from "@/queries/admin";

export const metadata: Metadata = { title: "Panel administratora" };

export default async function AdminPage() {
  await requireAdmin();
  const { sources, emails, topics, settings, feedback } = await getAdminData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Panel administratora"
        accent="radaru"
        description="Źródła agenta, czarne listy i zakres promptów. Zmiany działają od razu dla wszystkich użytkowników."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Źródła agenta</h2>
        <p className="text-xs text-muted-foreground">
          Agent szuka tylko w domenach aktywnych źródeł. Użytkownik wybiera do 2 źródeł przy każdym
          aspekcie.
        </p>
        <AdminSources sources={sources} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Czarna lista e-maili</h2>
        <p className="text-xs text-muted-foreground">
          Pełny adres (jan@x.pl) albo cała domena z @ (@x.pl). Blokuje zakładanie nowych kont.
        </p>
        <AdminBlocklist
          entries={emails.map((e) => ({ id: e.id, value: e.pattern }))}
          placeholder="jan@x.pl albo @x.pl"
          onAdd={addBlockedEmail}
          onRemove={removeBlockedEmail}
          emptyText="Czarna lista e-maili jest pusta."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Zakres promptów</h2>
        <AdminSettings initial={settings} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Czarna lista tematów</h2>
        <p className="text-xs text-muted-foreground">
          Fraza znaleziona w tytule lub opisie projektu albo we frazach aspektu blokuje zapis i
          generowanie przez AI (wielkość liter nie ma znaczenia).
        </p>
        <AdminBlocklist
          entries={topics.map((t) => ({ id: t.id, value: t.phrase }))}
          placeholder="np. broń"
          onAdd={addBlockedTopic}
          onRemove={removeBlockedTopic}
          emptyText="Czarna lista tematów jest pusta."
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Zgłoszenia z przycisku „Pomoc” ({feedback.length})
        </h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-muted-foreground">Brak zgłoszeń.</p>
        ) : (
          <ul className="grid gap-2">
            {feedback.map((f) => (
              <li key={f.id} className="space-y-1 rounded-2xl border bg-card p-3 text-sm">
                <p className="font-medium">
                  {FEEDBACK_LABELS[f.type]}
                  {f.subject && <span className="text-muted-foreground"> · {f.subject}</span>}
                </p>
                <p className="whitespace-pre-line">{f.message}</p>
                <p className="text-xs text-muted-foreground">
                  {f.email ?? "anonimowo"} · {f.pageUrl} ·{" "}
                  {f.createdAt.toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
