/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Rotation from '../../../src/animation/animations/rotation'

import { expect } from 'chai'

describe('Rotation', function () {

  describe('start-stop', function () {

    var anim;
    var component;
    var dx;

    beforeEach(function () {
      dx = 0;
      component = {
        invalidate: function () { },
        delta: function (k, v) {
          if (v === undefined)
            return dx
          dx = v;
        },
        touch: function () { }
      };

      anim = new Rotation(component, {
        duration: 1000,
        theta: 1,
        repeat: false
      });
    });

    it('반복하지 않는 애니메이션은 시작된 후에 duration이 지나면 delta 값이 1 이되어야 한다.', (done) => {

      dx.should.equal(0);

      anim.start();

      setTimeout(function () {
        dx.should.equal(1);
        done();
      }, 1500);
    });

    it('애니메이션 start() 메쏘드와 속성 started = true는 같은 동작을 한다.', (done) => {
      dx.should.equal(0);

      anim.started = true;

      setTimeout(function () {
        dx.should.equal(1);
        done();
      }, 1500);
    });

    it('반복하지 않는 애니메이션은 시작된 후에 duration이 지나면 delta 값이 1 이되어야 한다.', (done) => {
      dx.should.equal(0);

      anim.stop();

      setTimeout(function () {
        dx.should.equal(0);
        done();
      }, 500);
    });

    it('애니메이션 stop() 메쏘드와 속성 started = false는 같은 동작을 한다.', (done) => {
      anim.started = false;

      dx.should.equal(0);

      setTimeout(function () {
        dx.should.equal(0);
        done();
      }, 1500);
    });

  });

});
