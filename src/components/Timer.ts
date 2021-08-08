import moment = require('moment');
import { secondsToString } from '../utils/TimeFormat';
import css from './timer.scss';

export class Timer {
    static readonly ELEMENT_ID = 'js-awtd-timer';

    element: HTMLDivElement;
    top: HTMLDivElement;
    bottom: HTMLDivElement;
    prevSeconds: number;
    intervalID: number;

    lastSubmitTime: moment.Moment | null;
    submitIntervalSecs: number;

    displayInterval: boolean;

    constructor(lastSubmitTime: moment.Moment | null, submitIntervalSecs: number) {
        this.lastSubmitTime = lastSubmitTime;
        this.submitIntervalSecs = submitIntervalSecs;

        GM_addStyle(css);
        this.element = document.createElement('div');
        this.element.id = Timer.ELEMENT_ID;
        this.element.title = `間隔：${this.submitIntervalSecs} 秒`;
        document.body.appendChild(this.element);

        this.top = document.createElement('div');
        this.top.classList.add('js-awtd-timer-top');
        this.element.appendChild(this.top);
        this.bottom = document.createElement('div');
        this.bottom.classList.add('js-awtd-timer-bottom');
        this.element.appendChild(this.bottom);

        this.prevSeconds = -1;
        this.intervalID = window.setInterval(() => {
            this.updateTime();
        }, 100);

        this.displayInterval = false;
        this.element.addEventListener('click', () => {
            this.displayInterval = !this.displayInterval;
            this.prevSeconds = -1;
            this.updateTime();
        });
    }

    updateTime(): void {
        const currentTime: moment.Moment = moment();
        const seconds: number = currentTime.seconds();
        if (seconds === this.prevSeconds) return;

        if (this.displayInterval) {
            this.top.textContent = '提出間隔';
            this.bottom.textContent = `${this.submitIntervalSecs} 秒`;
        } else {
            if (this.lastSubmitTime !== null) {
                // 経過時間を表示
                const elapsedMilliseconds = currentTime.diff(this.lastSubmitTime);
                const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
                this.top.textContent = `経過：${secondsToString(elapsedSeconds)}`;
                const waitTime = Math.max(0, this.submitIntervalSecs - elapsedSeconds);
                this.bottom.textContent = `待ち：${secondsToString(waitTime)}`;
                // if (waitTime > 0) this.bottom.style.color = '#cc0000';
                // else this.bottom.style.color = 'inherit';
            } else {
                this.top.textContent = 'この問題は';
                this.bottom.textContent = '未提出です';
            }
        }
    }
}
