import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en", "fr", "es"],
  defaultLocale: "ko",
  localePrefix: "always",
});
