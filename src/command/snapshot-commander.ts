/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import EventSource from '../event/event-source'
import TimeCapsule from './timecapsule'
import SnapshotTaker from './snapshot-taker'

export type SnapshotProvider = { take: () => object, putback: (snapshot: object) => void }

function recovery(state, snapshotProvider) {
  if (state) {
    snapshotProvider.putback(JSON.parse(state));
  }
}

export class SnapshotCommander extends EventSource {

  private snapshotProvider
  private timecapsule
  private snapshot_taker

  constructor(snapshotProvider: SnapshotProvider) {
    super()

    this.snapshotProvider = snapshotProvider

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

    this.trigger('execute', command, /* undoable */ true, /* redoable */ false)
  }

  undo() {
    if (!this.timecapsule.backwardable)
      return;

    recovery(this.timecapsule.backward(), this.snapshotProvider)

    this.trigger('undo', this.undoable(), this.redoable())
  }

  redo() {
    if (!this.timecapsule.forwardable)
      return;

    recovery(this.timecapsule.forward(), this.snapshotProvider)

    this.trigger('redo', this.undoable(), this.redoable())
  }

  undoable() {
    return this.timecapsule.backwardable
  }

  redoable() {
    return this.timecapsule.forwardable
  }

  reset() {
    this.timecapsule && this.timecapsule.reset()
    this.trigger('command-reset')
  }
}
