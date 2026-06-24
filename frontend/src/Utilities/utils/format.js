export const timeAgo = (date) => {
  const now = new Date();
  const published = new Date(date);

  const seconds = Math.floor((now - published) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);

    if (count >= 1) {
      return `${count}${interval.label} ago`;
    }
  }

  return "Just now";
};

export const cleanSource = (source) => {
  if (!source) return "Unknown";

  return source
    .replace(/^www\./, "")
    .replace(".com", "")
    .replace(".in", "")
    .replace(".org", "")
    .trim();
};

export const formatNum = (num) => {
  return Number(num).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};