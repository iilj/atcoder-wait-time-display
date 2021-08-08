import moment = require('moment');
import { Timer } from './components/Timer';
import { extractContestAndProblemSlugs } from './utils';
import { getRecentSubmissions, getSubmitIntervalSecs } from './utils/DOMParseUtil';

void (async () => {
    // 終了後のコンテストに対しては処理しない？
    //if (moment() >= endTime) return;

    const [contestSlug, taskSlug] = extractContestAndProblemSlugs(document.location.href);
    if (contestSlug !== contestScreenName) {
        throw new Error('url が不正です');
    }
    const submitIntervalSecs = await getSubmitIntervalSecs(contestSlug);

    const recentSubmissions: [string, string, moment.Moment][] = await getRecentSubmissions(contestSlug, taskSlug);
    const lastSubmitTime: moment.Moment | null = recentSubmissions.reduce<moment.Moment | null>(
        (
            prev: moment.Moment | null,
            [, statusLabel, submitTime]: [string, string, moment.Moment]
        ): moment.Moment | null => {
            if (statusLabel === 'CE') return prev;
            if (prev === null || submitTime > prev) return submitTime;
            return prev;
        },
        null
    );

    new Timer(lastSubmitTime, submitIntervalSecs);
})();
