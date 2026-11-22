import { env } from "@/lib/env";
import { site } from "@/lib/site";

type EmailInput = { to: string; subject: string; html: string; text: string };

// Wysyłka przez API Resend (bez dodatkowych paczek). Bez RESEND_API_KEY mail nie jest wysyłany,
// a treść (z linkiem) trafia do konsoli serwera: wygodne w lokalnym developmencie.
export async function sendEmail({ to, subject, html, text }: EmailInput) {
  if (!env.RESEND_API_KEY) {
    console.warn(`[email] Brak RESEND_API_KEY. Do: ${to}\n${subject}\n${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html, text }),
  });
  if (!res.ok) {
    throw new Error(`Wysyłka e-maila nie powiodła się (${res.status}): ${await res.text()}`);
  }
}

export async function sendVerificationEmail(to: string, name: string, url: string) {
  const subject = `Potwierdź adres e-mail w ${site.name}`;
  const text = `Cześć ${name},\n\npotwierdź swój adres e-mail, klikając w link:\n${url}\n\nJeśli to nie Ty zakładałeś(-aś) konto, zignoruj tę wiadomość.`;
  const html = `<p>Cześć ${escapeHtml(name)},</p><p>potwierdź swój adres e-mail w ${escapeHtml(site.name)}:</p><p><a href="${url}">Potwierdź adres e-mail</a></p><p>Jeśli to nie Ty zakładałeś(-aś) konto, zignoruj tę wiadomość.</p>`;
  await sendEmail({ to, subject, html, text });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
