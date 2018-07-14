/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { EventTracker } from '../../../src/event/event-tracker'
import mixin from '../../../src/util/mixin'
import Event from '../../../src/util/event'

import { expect } from 'chai'

describe('EventTracker', function () {

  var eventTracker;

  class EventSource {
    trigger: (s, e) => void
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

  mixin(EventSource.prototype, Event.withEvent)

  var evsource;

  beforeEach(function () {
    evsource = new EventSource();
    eventTracker = new EventTracker({
      select: function (selector, listener) {
        if (selector === '(self)')
          return listener;
      }
    });
  });

  afterEach(function () {
    eventTracker.dispose();
  });

  describe('on', function () {
    it('should execute belonging event handlers on the bound events', function () {
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

    it('should bind on the specified object self when handlers call-backed', function () {
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

    it('should bind target object self member when handlers call-backed if bind object is not specified', function () {
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

    it('should recognize (self) selector', function () {

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

  describe('off', function () {
    it('should remove managed tracker matched with target object and handlers', function () {
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

    it('should match with only target object when handlers is not specified', function () {
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

