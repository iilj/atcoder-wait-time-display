export const extractContestAndProblemSlugs = (url: string): [string, string] => {
    // https://atcoder.jp/contests/*/tasks/*
    const urlMatchArray: RegExpExecArray | null = /^https?:\/\/atcoder\.jp\/contests\/([^/]+)\/tasks\/([^/]+)/.exec(
        url
    );
    if (urlMatchArray === null) {
        throw new Error('url が不正です');
    }
    return [urlMatchArray[1], urlMatchArray[2]];
};
