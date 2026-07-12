# Kita-Foto-Auswahlassistent

Next.js-App zum Erfassen von Foto-Wünschen inklusive individuellem ZIP-Passwort pro Familie.

## Umgebungsvariablen

- `DATABASE_URL`: Neon-Postgres-Verbindungsstring
- `MASTER_KEY`: AES-256-Schlüssel als 32-Byte-String, 64 Hex-Zeichen oder 44 Base64-Zeichen

## Datenmodell

Die App erstellt bei Bedarf die Tabelle `photo_submissions` mit der Spalte `encrypted_zip_password`.

## No-Recovery-Policy

Es gibt keine Passwort-Wiederherstellung und kein UI-Element zum Zurücksetzen. Der CSV-Export entschlüsselt die ZIP-Passwörter nur temporär für die lokale ZIP-Erstellung.
