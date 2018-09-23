/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

// import { EventSource } from '../event'
import TimeCapsule from './timecapsule'
import SnapshotTaker from './snapshot-taker'

export type SnapshotProvider = { take: () => object, putback: (snapshot: object) => void }

function recovery(state, snapshotProvider) {
  if (state) {
    snapshotProvider.putback(JSON.parse(state));
  }
}

export class SnapshotCommander {

  private snapshotProvider
  private timecapsule
  private snapshot_taker
  private event_target

  constructor(snapshotProvider: SnapshotProvider, event_target?: EventTarget) {
    // super()

    this.snapshotProvider = snapshotProvider

    this.event_target = event_target

    this.timecapsule = new TimeCapsule(20)
    var self = this
    this.snapshot_taker = new SnapshotTaker({
      get state() {
        return JSON.stringify(self.snapshotProvider.take())
      }
    }, this.timecapsule)

    this.snapshot_taker.take(true)
  }

  dispose() {
    this.reset()
    this.timecapsule && this.timecapsule.dispose()
    this.snapshot_taker && this.snapshot_taker.dispose()

    delete this.snapshotProvider
    delete this.timecapsule
    delete this.snapshot_taker
  }

  execute(command, doit) {
    /* doit 파라미터가 명시적으로 false가 아니면, 실행한다. */
    if (doit !== false && command)
      command.execute()

    this.snapshot_taker.touch()

    this.event_target && this.event_target.dispatchEvent(new CustomEvent('execute', {
      bubbles: true, composed: true,
      detail: {
        command,
        undoable: true,
        redoable: false
      }
    }))
  }

  undo() {
    if (!this.timecapsule.backwardable)
      return;

    recovery(this.timecapsule.backward(), this.snapshotProvider)

    this.event_target && this.event_target.dispatchEvent(new CustomEvent('undo', {
      bubbles: true, composed: true,
      detail: {
        undoable: this.undoable(),
        redoable: this.redoable()
      }
    }))
  }

  redo() {
    if (!this.timecapsule.forwardable)
      return;

    recovery(this.timecapsule.forward(), this.snapshotProvider)

    this.event_target && this.event_target.dispatchEvent(new CustomEvent('redo', {
      bubbles: true, composed: true,
      detail: {
        undoable: this.undoable(),
        redoable: this.redoable()
      }
    }))
  }

  undoable() {
    return this.timecapsule.backwardable
  }

  redoable() {
    return this.timecapsule.forwardable
  }

  reset() {
    this.timecapsule && this.timecapsule.reset()

    this.event_target && this.event_target.dispatchEvent(new CustomEvent('command-reset', {
      bubbles: true, composed: true
    }))
  }
}
