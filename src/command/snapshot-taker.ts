/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { debounce } from 'lodash'

var debouncer = debounce((taker) => {
  if (!taker.brake) {
    taker.take()
  }
}, 1000, { leading: true, trailing: false })

function take_snapshot(taker) {
  if (taker.brake || !taker.dirty)
    return
  debouncer(taker)
}

export default class SnapshotTaker {

  private _brake
  private dirty: boolean
  private state_holder
  private timecapsule

  constructor(state_holder, timecapsule) {
    this.brake = false;
    this.dirty = false;
    this.state_holder = state_holder;
    this.timecapsule = timecapsule;
    this.timecapsule.snapshot_taker = this;
  }

  dispose() {
    delete this.state_holder
    delete this.timecapsule
  }

  touch() {
    this.dirty = true;
    take_snapshot(this)
  }

  /* 모든 조건에 관계없이 현재 상태를 snapshot으로 취한다. */
  take(force) {
    if (this.dirty || force) {
      this.timecapsule.snapshot(this.state_holder.state)
      this.dirty = false;
    }
  }

  get brake() {
    return this._brake
  }

  /* 마우스를 드래깅하는 동안, 보통 brake 를 ON 시킨다. */
  set brake(brake) {
    this._brake = !!brake
    take_snapshot(this)
  }
}
