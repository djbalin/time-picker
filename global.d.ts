// Gives `useTranslations`/`getTranslations` autocomplete and compile-time
// checking against the English catalog's keys (the source of truth — `da.json`
// is checked against it structurally, not the other way around).
type Messages = typeof import("./messages/en.json");

declare interface IntlMessages extends Messages {}
