/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as Delta from "../delta";
import { ComponentModel } from "../../types";
import {
  requestCustomAnimationFrame,
  cancelCustomAnimationFrame
} from "../../util/custom-animation-frame";

function makeEaseOut(delta, options) {
  return function(progress) {
    return 1 - delta(1 - progress, options);
  };
}

function makeEaseInOut(delta, options) {
  return function(progress) {
    if (progress < 0.5) return delta(2 * progress, options) / 2;
    else return (2 - delta(2 * (1 - progress), options)) / 2;
  };
}

/*
 * 여러가지 Animation 동작의 추상클래스임.
 * Animation 생성자의 client 는
 * - delta, invalidate 메쏘드를 구현하여야 한다.
 */
export default abstract class Animation {
  protected client;
  protected config;
  private _started: boolean = false;
  private delta;
  private _vraf;
  protected _state: ComponentModel;

  protected abstract step(delta): void;

  constructor(client, config) {
    this.client = client;
    this.config = config;

    var { delta = "linear" /* delta function */, options, ease } = this.config;

    if (typeof delta === "string") delta = Delta[delta];

    if (ease == "out") this.delta = makeEaseOut(delta, options);
    else if (ease == "inout") this.delta = makeEaseInOut(delta, options);
    else this.delta = delta;

    this.init();
  }

  dispose() {
    this.stop();
    /* 확인차원에서 this.client 참조를 삭제한다. */
    delete this.client;
  }

  init() {}

  start() {
    if (this._started) return;

    var { duration = 2000, delay = 0, repeat = false } = this.config;

    this._started = true;
    this._state = this.client.state;

    var started_at = 0;
    var total_duration = duration + delay;

    var callback = () => {
      if (!this._started) return;

      if (started_at == 0) {
        started_at = performance.now();
        this.client.touch();
      }

      let time_passed = performance.now() - started_at;
      let progress =
        Math.max((time_passed % total_duration) - delay, 0) / duration;

      this.step(this.delta(progress));
      this.client && this.client.invalidate();

      if (time_passed >= total_duration && (!repeat || !this._started)) {
        this.step(1); /* 강제로 delta 값을 1로 설정함 */
        this.stop();
        started_at = 0;
      }
      if (this._started) this._vraf = requestAnimationFrame(callback);
    };

    this._vraf = requestAnimationFrame(callback);
  }

  stop() {
    if (this._vraf) {
      cancelCustomAnimationFrame(this._vraf);
      this._vraf = null;
    }

    this._started = false;
  }

  get started() {
    return this._started;
  }

  set started(started) {
    if (this.started == !!started) return;

    if (!!started) this.start();
    else this.stop();
  }
}
