# 🛡️ NEXITY COMMAND CENTER v8.2

System zarządzania logami i alertami bezpieczeństwa stworzony dla **Nikolety**. Platforma łączy się z bazą danych RavenDB w USA i zapewnia dostęp do rejestru zdarzeń w czasie rzeczywistym.

## 🚀 Funkcje
- **Secure Access:** Dostęp chroniony hasłem systemowym.
- **Live Monitoring:** Podgląd ostatnich 20 wpisów z bazy danych.
- **Audio Alerts:** Powiadomienia dźwiękowe przy logach typu "ALARM".
- **Cloud Ready:** System skonfigurowany pod darmowe wdrożenie na platformie Render.

## 🛠️ Instalacja lokalna
1. Pobierz repozytorium.
2. Uruchom `npm install`, aby zainstalować biblioteki: `express`, `express-session`, `ravendb`.
3. Umieść certyfikat `.pfx` w folderze głównym.
4. Uruchom serwer komendą `node serwer.js`.

## 🔐 Bezpieczeństwo
Dostęp do panelu jest możliwy po podaniu hasła zdefiniowanego w kodzie źródłowym.
