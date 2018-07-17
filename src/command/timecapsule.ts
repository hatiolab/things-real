/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { error, warn, debug } from '../util'

export default class TimeCapsule {
  private maxsize: number
  private q: object[]
  private pos: number
  private _snapshot_taker

  constructor(maxsize, start_state?) {
    maxsize = Number(maxsize);

    if (!maxsize || maxsize <= 0) {
      error('TimeCapsule maxsize should be greater than 0.', maxsize);
      this.maxsize = 10;
    } else {
      this.maxsize = maxsize;
    }

    this.reset();
    if (start_state)
      this.snapshot(start_state);
  }

  dispose() {
    this.reset();
  }

  snapshot(state) {
    this.q.splice(this.pos + 1, this.q.length - this.pos + 1, state)

    if (this.q.length > this.maxsize)
      this.q.splice(0, this.q.length - this.maxsize)

    this.pos = this.q.length - 1
  }

  forward() {
    if (this.snapshot_taker)
      this.snapshot_taker.take();

    if (this.forwardable)
      return this.q[++this.pos];
    warn('Not forwardable.')
  }

  backward() {
    if (this.snapshot_taker)
      this.snapshot_taker.take();

    if (this.backwardable)
      return this.q[--this.pos];
    warn('Not backwardable.')
  }

  get current() {
    if (this.pos !== -1)
      return this.q[this.pos];

    warn('Non state has been recorded.');
  }

  get length() {
    return this.q.length;
  }

  get forwardable() {
    return this.pos < this.q.length - 1
  }

  get backwardable() {
    return this.pos > 0
  }

  get snapshot_taker() {
    return this._snapshot_taker
  }

  set snapshot_taker(snapshot_taker) {
    this._snapshot_taker = snapshot_taker;
  }

  reset() {
    this.q = [];
    this.pos = -1;
  }
}
