export function strToSpliced(
  str: string,
  start: number,
  deleteCount: number,
  insert: string = "",
) {
  const len = str.length;
  const actualStart = start < 0
    ? Math.max(0, len + start)
    : Math.min(len, start);
  const actualDeleteCount = Math.max(0, deleteCount);
  return `${str.slice(0, actualStart)}${insert}${
    str.slice(start + actualDeleteCount)
  }`;
}
export function getIndentLen(str: string) {
  return Math.min(
    ...str.split("\n").filter((line) => line.trim().length).map(
      (line) => line.match(/^\t*/)?.[0]?.length || 0,
    ),
  );
}
