const pad = (num: number, length = 2): string => `00${num}`.slice(-length);
const days = ['日', '月', '火', '水', '木', '金', '土'] as const;

export const formatDate = (date: Date, format = '%Y-%m-%d (%a) %H:%M:%S.%f %z'): string => {
    const offset = date.getTimezoneOffset();
    const offsetSign = offset < 0 ? '+' : '-';
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;

    let ret: string = format.replace(/%Y/g, String(date.getFullYear()));
    ret = ret.replace(/%m/g, pad(date.getMonth() + 1));
    ret = ret.replace(/%d/g, pad(date.getDate()));
    ret = ret.replace(/%a/g, days[date.getDay()]);

    ret = ret.replace(/%H/g, pad(date.getHours()));
    ret = ret.replace(/%M/g, pad(date.getMinutes()));
    ret = ret.replace(/%S/g, pad(date.getSeconds()));
    ret = ret.replace(/%f/g, pad(date.getMilliseconds(), 3));

    ret = ret.replace(/%z/g, `${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`);

    return ret;
};

export const formatTime = (hours: number, minutes: number, seconds: number): string => {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const secondsToString = (diffWholeSecs: number): string => {
    const diffSecs = diffWholeSecs % 60;
    const diffMinutes = Math.floor(diffWholeSecs / 60) % 60;
    const diffHours = Math.floor(diffWholeSecs / 3600) % 24;
    const diffDate = Math.floor(diffWholeSecs / (3600 * 24));
    if (diffDate > 0) return `${diffDate}日`;
    return formatTime(diffHours, diffMinutes, diffSecs);
};
