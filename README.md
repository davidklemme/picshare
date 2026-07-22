# Kita-Foto-Auswahlassistent

Next.js-App zum Erfassen von Foto-Wünschen inklusive individuellem ZIP-Passwort pro Familie.

## Umgebungsvariablen

- `DATABASE_URL`: Neon-Postgres-Verbindungsstring
- `MASTER_KEY`: AES-256-Schlüssel als 32-Byte-String, 64 Hex-Zeichen oder 44 Base64-Zeichen
- `BETTER_AUTH_SECRET`: Zufälliger Secret-String für Better Auth (Session-Signierung)
- `BETTER_AUTH_URL`: Öffentliche URL der Deployment (optional, wird sonst aus dem Request-Host abgeleitet)
- `PARENT_SIGNUP_CODE`: Geteilter Zugangscode für die Eltern-Registrierung unter `/signup`

## Rollen & Zugang

- **Eltern**: Registrieren sich selbst unter `/signup` mit dem geteilten `PARENT_SIGNUP_CODE` (kein Selbst-Signup ohne Code). Nach der Anmeldung reichen sie unter `/` ihre Fotoauswahl ein.
- **Admins**: Kein Selbst-Signup. Neue Admin-Konten werden ausschließlich von einem bestehenden Admin über `/admin/invite` angelegt.
- Es gibt keinen CSV-Export mehr — `scripts/build-zips.ts` liest die Daten direkt aus der DB (siehe unten), damit nirgendwo eine Datei mit entschlüsselten Klartext-Passwörtern entsteht.

## Kein E-Mail-Versand

Die App verschickt bewusst keine E-Mails. Adressen dienen ausschließlich als Login-Kennung — sie werden nie angeschrieben, nie verifiziert und in den Admin-Tabellen nur maskiert angezeigt. Beide Stellen, an denen sonst Mail nötig wäre, laufen out-of-band: Die Admin-Einladung gibt das Einmal-Passwort direkt an den einladenden Admin aus, und die Eltern-Registrierung ist über `PARENT_SIGNUP_CODE` statt über einen Bestätigungslink abgesichert. Für die Auslieferung der fertigen ZIPs dient die bei der Einreichung erfasste Telefonnummer.

## Passwörter zurücksetzen

Unter `/admin` kann ein Admin für jedes andere Konto (Eltern wie Admins) ein Einmal-Passwort erzeugen. Es wird genau einmal angezeigt und danach mündlich bzw. telefonisch übermittelt. Das Zurücksetzen beendet alle bestehenden Sitzungen des Kontos. Das eigene Passwort lässt sich hier nicht zurücksetzen.

Technisch nutzt das die reguläre `/reset-password`-Route von Better Auth; da kein Mail-Transport konfiguriert ist, wird der Token in `resetUserPassword()` selbst erzeugt statt per Link verschickt.

## Datenmodell

Die App erstellt bei Bedarf die Tabelle `photo_submissions` (verknüpft mit dem Better-Auth-`user`, Spalten u. a. `phone`, `image_numbers`, `encrypted_zip_password`).

## Fotos zippen

`scripts/build-zips.ts` liest die Einreichungen direkt aus der DB (dieselben Env-Vars wie die App), entschlüsselt jedes ZIP-Passwort nur kurz im Speicher und erstellt pro Familie ein passwortgeschütztes ZIP — es entsteht keine CSV mit Klartext-Passwörtern auf der Festplatte. Läuft lokal (braucht Zugriff auf die Originalfotos):

```bash
set -a && source .env.local && set +a
npx tsx scripts/build-zips.ts /pfad/zu/den/originalfotos /pfad/zu/den/fertigen_zips
```

Voraussetzung: `zip`-CLI im PATH. Bildnummern werden über einen Teilstring-Match im Dateinamen gefunden (unterstützt `.jpg`, `.jpeg`, `.cr2`).

## No-Recovery-Policy

Gilt ausschließlich für das **ZIP-Passwort**: Es ist das Verschlüsselungsgeheimnis der Familie und kann nicht wiederhergestellt werden — weder von der App noch von einem Admin. Vergisst eine Familie es, muss die Auswahl neu eingereicht werden.

Das **Login-Passwort** fällt nicht darunter. Es ist über die Admin-Zurücksetzung oben wiederherstellbar; ohne sie wäre ein Konto nach vergessenem Passwort dauerhaft gesperrt.
