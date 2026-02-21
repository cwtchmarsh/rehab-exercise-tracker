export function getTodayDateString() {
    return formatDateInput(new Date());
}
export function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
export function parseDate(dateString) {
    const parts = dateString.split("-");
    const yearRaw = Number(parts[0] ?? Number.NaN);
    const monthRaw = Number(parts[1] ?? Number.NaN);
    const dayRaw = Number(parts[2] ?? Number.NaN);
    const year = Number.isFinite(yearRaw) ? yearRaw : 1970;
    const month = Number.isFinite(monthRaw) ? monthRaw : 1;
    const day = Number.isFinite(dayRaw) ? dayRaw : 1;
    return new Date(year, month - 1, day);
}
export function toReadableDate(dateString) {
    return parseDate(dateString).toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
export function startOfWeek(date) {
    const copy = new Date(date);
    const day = copy.getDay();
    const distance = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + distance);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
export function endOfWeek(date) {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
}
export function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
export function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
export function listDatesInRange(start, end) {
    const dates = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    while (current <= end) {
        dates.push(formatDateInput(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}
export function weekLabel(dateString) {
    const date = parseDate(dateString);
    const start = startOfWeek(date);
    return `${start.getFullYear()}-W${getWeekNumber(start)}`;
}
function getWeekNumber(date) {
    const copy = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = copy.getUTCDay() || 7;
    copy.setUTCDate(copy.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((copy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return String(weekNo).padStart(2, "0");
}
//# sourceMappingURL=date.js.map