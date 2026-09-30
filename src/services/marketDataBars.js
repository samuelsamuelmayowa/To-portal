const NY_TIME_ZONE = "America/New_York";
const NY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: NY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});
const WEEKDAY_INDEX = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export function getResolutionMinutes(resolution) {
  const mapping = { "1": 1, "5": 5, "15": 15, "30": 30, "60": 60 };
  const minutes = mapping[String(resolution)];
  if (!minutes && !["D", "1D", "W"].includes(String(resolution))) {
    throw new Error(`Unsupported chart resolution: ${resolution}`);
  }
  return minutes || null;
}

function getNewYorkParts(timestamp) {
  const fields = Object.fromEntries(NY_FORMATTER.formatToParts(new Date(timestamp)).map(({ type, value }) => [type, value]));
  return {
    year: Number(fields.year), month: Number(fields.month), day: Number(fields.day),
    hour: Number(fields.hour), minute: Number(fields.minute), weekday: WEEKDAY_INDEX[fields.weekday],
  };
}

function dateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function newYorkTimeToUtc(year, month, day, minuteOfDay) {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const intendedUtc = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = intendedUtc;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = getNewYorkParts(candidate);
    const observedUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    candidate += intendedUtc - observedUtc;
  }
  return candidate;
}

export function getBarBucketStart(timestamp, resolution) {
  const time = Number(timestamp);
  if (!Number.isFinite(time)) return null;
  const minutes = getResolutionMinutes(resolution);
  const parts = getNewYorkParts(time);
  const dayDate = dateKey(parts.year, parts.month, parts.day);
  if (resolution === "D" || resolution === "1D") return Date.parse(`${dayDate}T00:00:00.000Z`);
  if (resolution === "W") {
    const monday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day - parts.weekday));
    return Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
  }

  const minuteOfDay = parts.hour * 60 + parts.minute;
  const marketOpenMinute = 9 * 60 + 30;
  const marketCloseMinute = 16 * 60;
  if (minuteOfDay < marketOpenMinute || minuteOfDay >= marketCloseMinute) return null;
  const sessionOffset = minuteOfDay - marketOpenMinute;
  const startMinute = marketOpenMinute + Math.floor(sessionOffset / minutes) * minutes;
  return newYorkTimeToUtc(parts.year, parts.month, parts.day, startMinute);
}

export function aggregateMinuteBar(lastBar, minuteBar, resolution, lastSourceTime = -Infinity, lastSourceBar = null) {
  const sourceTime = Number(minuteBar?.time);
  const isCorrection = minuteBar?.updated === true;
  if (!Number.isFinite(sourceTime) || sourceTime < lastSourceTime || (sourceTime === lastSourceTime && !isCorrection)) return null;
  const bucketTime = getBarBucketStart(sourceTime, resolution);
  if (bucketTime === null || (lastBar && bucketTime < lastBar.time)) return null;

  if (isCorrection && sourceTime === lastSourceTime && lastBar?.time === bucketTime) {
    if (resolution === "1") return { bar: { ...minuteBar, time: bucketTime }, lastSourceTime, lastSourceBar: minuteBar };
    return {
      bar: {
        time: bucketTime,
        open: lastBar.open,
        high: Math.max(lastBar.high, minuteBar.high),
        low: Math.min(lastBar.low, minuteBar.low),
        close: minuteBar.close,
        volume: Math.max(0, lastBar.volume + minuteBar.volume - Number(lastSourceBar?.volume || 0)),
      },
      lastSourceTime,
      lastSourceBar: minuteBar,
    };
  }

  if (resolution === "1") {
    return {
      bar: { ...minuteBar, time: bucketTime },
      lastSourceTime: sourceTime,
      lastSourceBar: minuteBar,
    };
  }

  if (lastBar?.time === bucketTime) {
    return {
      bar: {
        time: bucketTime,
        open: lastBar.open,
        high: Math.max(lastBar.high, minuteBar.high),
        low: Math.min(lastBar.low, minuteBar.low),
        close: minuteBar.close,
        volume: lastBar.volume + minuteBar.volume,
      },
      lastSourceTime: sourceTime,
      lastSourceBar: minuteBar,
    };
  }
  return {
    bar: { time: bucketTime, open: minuteBar.open, high: minuteBar.high, low: minuteBar.low, close: minuteBar.close, volume: minuteBar.volume },
    lastSourceTime: sourceTime,
    lastSourceBar: minuteBar,
  };
}
