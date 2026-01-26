# SecureCase

[Zobacz działający projekt online](https://secure-case-six.vercel.app/)

SecureCase to system zarządzania sprawami policyjnymi umożliwiający cyfrowe zarządzanie sprawami, przestępcami, raportami oraz dowodami w ramach jednostki policji.
## Funkcjonalności

### Użytkownicy (policjanci)

- Logowanie do systemu z indywidualnym kontem użytkownika.
- Dostęp do listy przypisanych spraw w sekcji „Moje sprawy”.
- Rejestrowanie aktywności: czas logowania, tworzenie oraz edycja raportów i spraw.
- Filtrowanie spraw według statusu: do rozpatrzenia, w toku, zamknięte.
- Tworzenie nowych spraw i raportów 

### Przestępcy

- Baza przestępców zawierająca:
  - Imię i nazwisko (PІB).
  - Opis.
  - Status: poszukiwany, zatrzymany, skazany.
  - Miarę kary, powiązany artykuł oraz wyrok.
- Profil przestępcy z możliwością dodawania wielu zdjęć oraz fingerprints.
- Każde zdjęcie przechowuje datę dodania oraz autora.

### Sprawy

- Dane sprawy:
  - Numer sprawy.
  - Opis.
  - Typ przestępstwa.
  - Status: nowa, w rozpatrzeniu, w sądzie, zamknięta.
- Powiązanie sprawy z jednym lub wieloma przestępcami.
- Lista „Moje sprawy” dla każdego policjanta z filtrami według statusu.

### Raporty i dowody

- Raporty:
  - Tekstowy opis zdarzenia.
  - Data i czas.
  - Miejsce.
  - Autor (policjant).
  - Powiązanie z konkretną sprawą.
- Dowody:
  - Dodawanie zdjęć, dokumentów oraz fotorobotów do spraw lub raportów.
  - Galeria dowodów przypisana do konkretnej sprawy, z możliwością przeglądania.

## Struktura projektu

```text
.
├── app
│   ├── api
│   │   └── cases
│   │       └── [id]
│   │           ├── case-detail.module.css
│   │           └── page.tsx
│   ├── components
│   │   ├── ActivityLog.module.css
│   │   ├── ActivityLog.tsx
│   │   ├── ActivityClientLoader.tsx
│   │   ├── CasePhotosManager.tsx
│   │   ├── CaseReportsClient.module.css
│   │   ├── CaseReportsClient.tsx
│   │   ├── LocalSync.tsx
│   │   ├── ReportClientEditor.tsx
│   │   ├── ReportClientView.tsx
│   │   ├── ReportClientView.module.css
│   │   ├── ReportForm.tsx
│   │   ├── ReportForm.module.css
│   │   ├── ReportReviewControls.tsx
│   │   ├── ReportReviewSummary.tsx
│   │   ├── ReportReviewSummary.module.css
│   │   ├── ReportsListClient.tsx
│   │   ├── ReportsListClient.module.css
│   │   ├── StartOverlay.tsx
│   │   └── start-overlay.module.css
│   ├── dashboard
│   │   ├── dashboard.module.css
│   │   └── page.tsx
│   ├── login
│   │   ├── login.module.css
│   │   └── page.tsx
│   ├── reports
│   │   └── [id]
│   │       ├── page.tsx
│   │       ├── report-detail.module.css
│   │       └── layout.tsx
│   ├── globals.css
│   ├── home.module.css
│   └── page.tsx
├── data
│   ├── cases.json
│   ├── criminals.json
│   ├── reports.json
│   └── users.json
├── lib
├── node_modules
├── public
│   └── images
│       ├── fingerprints
│       ├── mugshots
│       ├── places
│       ├── icon.jpg
│       ├── logo1.png
│       ├── file.svg
│       ├── globe.svg
│       ├── next.svg
│       ├── vercel.svg
│       └── window.svg
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json


### Użytkownicy (policjanci)

Uruchamianie 

```
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



Khylchenko Valeriia 21279, Yana Trotsenko 21232
=======


