export default function flattenSchema(obj, prefix = "", depth = 0) {
  if (typeof obj !== "object" || obj === null) return [];
  return Object.entries(obj).flatMap(([key, val]) => {
    const row = {
      name: prefix ? `${prefix}.${key}` : key,
      type: Array.isArray(val) ? "array" : typeof val,
      description: "",
      depth,
    };
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      return [
        row,
        ...flattenSchema(val, row.name, depth + 1),
      ];
    } else {
      return [row];
    }
  });
}
