/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Command from '../../../src/command/command'
import { SnapshotProvider, SnapshotCommander } from '../../../src/command/snapshot-commander'

import { expect } from 'chai'

describe('Snapshot Commander', () => {
  var cm;

  var count = 0;

  var snapshotProvider = {
    take() {
      return {
        count: count
      }
    },
    putback(model) {
      count = model.count
    }
  }

  class SampleCommand extends Command {
    execute() {
      count++;
    }
  }

  beforeEach(function () {
    count = 0;
    cm = new SnapshotCommander(snapshotProvider);
  });

  describe('execute', function () {

    it('should execute command through SnapshotCommander', () => {

      cm.execute(new SampleCommand());

      count.should.equal(1);
    });
  });

  describe('undo', function () {

    it('should execute reverse actions of the queued command.', function (done) {
      // snapshot taker가 1초동안 debounce되므로, 1초 후에 실행해야 함.
      setTimeout(function () {
        cm.execute(new SampleCommand());
        cm.undo();

        count.should.equal(0);

        done();
      }, 1100);
    });

  });

  describe('redo', function () {

    it('should execute actions of the undoed command', function (done) {
      // snapshot taker가 1초동안 debounce되므로, 1초 후에 실행해야 함.
      setTimeout(function () {
        cm.execute(new SampleCommand());

        cm.undo();
        count.should.equal(0);

        cm.redo();
        count.should.equal(1);
        done();
      }, 1100);
    });
  });

  describe('reset', function () {

    it('should make undoable to false', function (done) {
      // snapshot taker가 1초동안 debounce되므로, 1초 후에 실행해야 함.
      setTimeout(function () {
        cm.execute(new SampleCommand());

        cm.undo();
        count.should.equal(0);

        cm.redo();
        cm.undoable().should.equal(true);

        cm.reset();
        cm.undoable().should.equal(false);

        done();
      }, 1100);
    });

    it('should make redoable to false', function (done) {
      // snapshot taker가 1초동안 debounce되므로, 1초 후에 실행해야 함.
      setTimeout(function () {
        cm.execute(new SampleCommand());

        cm.undo();
        count.should.equal(0);

        cm.redoable().should.equal(true);

        cm.reset();
        cm.redoable().should.equal(false);

        done();
      }, 1100);
    });
  });
});
