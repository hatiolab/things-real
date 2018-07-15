/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { EventSource, EventTracker } from '../../../src/event'

import { expect } from 'chai'

describe('EventTracker', () => {

  var eventTracker;

  class EventSourceTest extends EventSource {
    test(e) {
      this.trigger('dragstart', e);
      for (var i = 0; i < 10; i++) {
        this.trigger('dragmove', e);
      }
      this.trigger('dragend', e);
    }

    twice(num) {
      return num * 2;
    }
  }

  var evsource;

  beforeEach(() => {
    evsource = new EventSourceTest();
    eventTracker = new EventTracker({
      select: function (selector, listener) {
        if (selector === '(self)')
          return listener;
      }
    });
  });

  afterEach(() => {
    eventTracker.dispose();
  });

  describe('on', () => {
    it('should execute belonging event handlers on the bound events', () => {
      var startcount = 0;
      var movecount = 0;
      var endcount = 0;

      var handlers = {
        dragstart: function (e) {
          startcount++;
        },
        dragmove: function (e) {
          movecount++;
        },
        dragend: function (e) {
          endcount++;
        }
      };

      eventTracker.on(evsource, handlers);
      evsource.test();

      startcount.should.equal(1);
      movecount.should.equal(10);
      endcount.should.equal(1);

      eventTracker.off(evsource, handlers);

      eventTracker.on(evsource, handlers);

      evsource.test();

      startcount.should.equal(2);
      movecount.should.equal(20);
      endcount.should.equal(2);
    });

    it('should bind on the specified object self when handlers call-backed', () => {
      var self = {
        a: 'a'
      };

      var handlers = {
        dragstart: function (e) {
          this.context.a = 'A';
        }
      };

      eventTracker.on(evsource, handlers, {}, self);
      evsource.test();

      self.a.should.equal('A');
    });

    it('should bind target object self member when handlers call-backed if bind object is not specified', () => {
      var calc = 1;

      var handlers = {
        dragstart: function (e) {
          calc = this.context.twice(calc);
        }
      };

      eventTracker.on(evsource, handlers);
      evsource.test();

      calc.should.equal(2);
    });

    it('should recognize (self) selector', () => {

      var count = 0;

      var handlers = {
        dragstart: function (e) {
          count++;
        }
      };

      eventTracker.on('(self)', handlers, evsource);
      evsource.test();

      count.should.equal(1);
    });

  });

  describe('off', () => {
    it('should remove managed tracker matched with target object and handlers', () => {
      var handlers1 = {
        dragstart: function (e) {
        },
        dragmove: function (e) {
        },
        dragend: function (e) {
        }
      };

      var handlers2 = {
        dragstart: function (e) {
        },
        dragmove: function (e) {
        },
        dragend: function (e) {
        }
      };

      var trackers = eventTracker.all();
      trackers.length.should.equal(0);

      eventTracker.on(evsource, handlers1);
      eventTracker.on(evsource, handlers2);
      trackers = eventTracker.all();
      trackers.length.should.equal(2);

      eventTracker.off(evsource, handlers1);
      trackers = eventTracker.all();
      trackers.length.should.equal(1);
    });

    it('should match with only target object when handlers is not specified', () => {
      var handlers1 = {
        dragstart: function (e) {
        },
        dragmove: function (e) {
        },
        dragend: function (e) {
        }
      };

      var handlers2 = {
        dragstart: function (e) {
        },
        dragmove: function (e) {
        },
        dragend: function (e) {
        }
      };

      var trackers = eventTracker.all();
      trackers.length.should.equal(0);

      eventTracker.on(evsource, handlers1);
      eventTracker.on(evsource, handlers2);
      trackers = eventTracker.all();
      trackers.length.should.equal(2);

      eventTracker.off(evsource);
      trackers = eventTracker.all();
      trackers.length.should.equal(0);
    });
  });

});

