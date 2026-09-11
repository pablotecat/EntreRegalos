#!/usr/bin/env node

const now = new Date();
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const parts = new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
}).formatToParts(now);

const partValue = (type) => parts.find((part) => part.type === type)?.value;
const timeZoneOffset = -now.getTimezoneOffset();
const offsetSign = timeZoneOffset >= 0 ? "+" : "-";
const offsetHours = String(Math.floor(Math.abs(timeZoneOffset) / 60)).padStart(2, "0");
const offsetMinutes = String(Math.abs(timeZoneOffset) % 60).padStart(2, "0");

console.log(
  JSON.stringify({
    utc: now.toISOString(),
    local_date: `${partValue("year")}-${partValue("month")}-${partValue("day")}`,
    local_time: `${partValue("hour")}:${partValue("minute")}:${partValue("second")}`,
    utc_offset: `${offsetSign}${offsetHours}:${offsetMinutes}`,
    time_zone: timeZone,
  })
);