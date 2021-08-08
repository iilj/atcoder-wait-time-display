import moment = require('moment');
import { extractContestAndProblemSlugs } from '.';

export const getRecentSubmissions = async (
    contestSlug: string,
    taskSlug: string
): Promise<[string, string, moment.Moment][]> => {
    const res = await fetch(`https://atcoder.jp/contests/${contestSlug}/submissions/me?f.Task=${taskSlug}`);
    const text = await res.text();
    const dom = new DOMParser().parseFromString(text, 'text/html');
    // console.log(dom);
    // 2021-05-29 16:15:34+0900

    const rows: NodeListOf<HTMLTableRowElement> = dom.querySelectorAll<HTMLTableRowElement>(
        '#main-container div.panel.panel-default.panel-submission > div.table-responsive > table > tbody > tr'
    );

    const ret: [string, string, moment.Moment][] = [];
    rows.forEach((row: HTMLTableRowElement): void => {
        const problem: HTMLAnchorElement | null = row.querySelector<HTMLAnchorElement>(
            `a[href^="/contests/${contestSlug}/tasks/${taskSlug}"]`
        );
        if (problem === null) {
            throw new Error('テーブルに提出先不明の行があります');
        }
        const time: HTMLElement | null = row.querySelector<HTMLElement>('time.fixtime-second');
        if (time === null) {
            throw new Error('テーブルに提出時刻不明の行があります');
        }
        const [contestSlugTmp, taskSlugTmp] = extractContestAndProblemSlugs(problem.href);
        if (contestSlugTmp !== contestSlug || taskSlugTmp !== taskSlug) {
            throw new Error('異なる問題への提出記録が紛れています');
        }
        const submission: HTMLAnchorElement | null = row.querySelector<HTMLAnchorElement>(
            `a[href^="/contests/${contestSlug}/submissions/"]`
        );
        if (submission === null) {
            throw new Error('テーブルに提出 ID 不明の行があります');
        }
        const statusLabel: HTMLSpanElement | null = row.querySelector<HTMLSpanElement>('span.label');
        if (statusLabel === null) {
            throw new Error('提出ステータス不明の行があります');
        }
        const label: string | undefined = statusLabel.textContent?.trim();
        if (label === undefined) {
            throw new Error('提出ステータスが空の行があります');
        }
        const submitTime: moment.Moment = moment(time.innerText);
        ret.push([submission.href, label, submitTime]);
    });
    return ret;
};

export const getSubmitIntervalSecs = async (contestSlug: string): Promise<number> => {
    const res = await fetch(`https://atcoder.jp/contests/${contestSlug}?lang=ja`);
    const text = await res.text();
    const dom = new DOMParser().parseFromString(text, 'text/html');

    // 例外的な処理
    if (contestSlug === 'wn2017_1') {
        return 3600;
    } else if (contestSlug === 'caddi2019') {
        return 300;
    }

    // AHC/HTTF/日本橋ハーフマラソン/Future 仕様の文字列を検索
    const candidates: HTMLCollectionOf<HTMLElement> = dom.getElementsByTagName('strong');
    for (let i = 0; i < candidates.length; ++i) {
        const content: string | undefined = candidates[i].textContent?.trim();
        if (content === undefined) continue;
        // 5分以上の間隔
        const matchArray: RegExpExecArray | null = /^(\d+)(秒|分|時間)以上の間隔/.exec(content);
        if (matchArray === null) continue;
        if (matchArray[2] === '秒') return Number(matchArray[1]);
        if (matchArray[2] === '分') return Number(matchArray[1]) * 60;
        if (matchArray[2] === '時間') return Number(matchArray[1]) * 3600;
    }

    const statement: HTMLElement | null = dom.getElementById('contest-statement');
    if (statement === null) {
        throw new Error('コンテスト説明文が見つかりませんでした');
    }
    const statementText: string | null = statement.textContent;
    if (statementText === null) {
        throw new Error('コンテスト説明文が空です');
    }

    // Asprova 仕様
    //   「提出間隔：プログラム提出後10分間は再提出できません。」
    //   「提出後1時間は再提出できません」
    // Hitachi Hokudai 仕様
    //   「提出直後の1時間は再提出することができません」
    //   「提出直後の1時間は、再提出することができません」
    // ヤマトコン仕様
    //   「提出後30分は再提出することはできません」
    {
        const matchArray: RegExpExecArray | null = /提出[^\d]{1,5}(\d+)(秒|分|時間).{1,5}再提出/.exec(statementText);
        if (matchArray !== null) {
            if (matchArray[2] === '秒') return Number(matchArray[1]);
            if (matchArray[2] === '分') return Number(matchArray[1]) * 60;
            if (matchArray[2] === '時間') return Number(matchArray[1]) * 3600;
        }
    }

    // Chokudai Contest 仕様
    //   「CEの提出を除いて5分に1回しか提出できません」
    //   「前の提出から30秒以上開けての提出をお願いします」
    //   「前の提出から5分以上開けての提出をお願いします」
    // Introduction to Heuristics Contest 仕様
    //   「提出の間隔は5分以上空ける必要があります」
    {
        const matchArray: RegExpExecArray | null = /提出[^\d]{1,5}(\d+)(秒|分|時間)以上(?:空け|開け)/.exec(
            statementText
        );
        console.log(matchArray);
        if (matchArray !== null) {
            if (matchArray[2] === '秒') return Number(matchArray[1]);
            if (matchArray[2] === '分') return Number(matchArray[1]) * 60;
            if (matchArray[2] === '時間') return Number(matchArray[1]) * 3600;
        }
    }
    {
        const matchArray: RegExpExecArray | null = /(\d+)(秒|分|時間)に1回.{1,5}提出/.exec(statementText);
        if (matchArray !== null) {
            if (matchArray[2] === '秒') return Number(matchArray[1]);
            if (matchArray[2] === '分') return Number(matchArray[1]) * 60;
            if (matchArray[2] === '時間') return Number(matchArray[1]) * 3600;
        }
    }
    return 5;
};
