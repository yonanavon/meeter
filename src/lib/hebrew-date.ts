import { HDate } from "@hebcal/core";

const hebrewDays = [
  "יום ראשון",
  "יום שני",
  "יום שלישי",
  "יום רביעי",
  "יום חמישי",
  "יום שישי",
  "שבת",
];

export function getHebrewDateString(date: Date): string {
  const hd = new HDate(date);
  const dayOfWeek = hebrewDays[date.getDay()];
  const hebrewDate = hd.renderGematriya(true);
  return `${dayOfWeek}, ${hebrewDate}`;
}

export function formatGregorianDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
