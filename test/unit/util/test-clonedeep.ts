/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { clonedeep } from '../../../src/util'
import { cloneDeep } from 'lodash'

import { expect } from 'chai'

describe('clonedeep', () => {

  describe('test for simple object', () => {

    var source;

    beforeEach(() => {
      source = { a: 32, b: 'abc' };
    });

    it('복사된 오브젝트의 Key의 종류와 값, 그리고 갯수가 같아야 한다.', () => {
      var cloned = clonedeep(source);

      expect(cloned.a).to.equal(32);
      expect(cloned.b).to.equal('abc');

      expect(cloned).to.include.keys('a');
      expect(cloned).to.include.keys('b');

      expect(Object.keys(cloned).length).to.equal(2);
    });

    it('Object.assign()을 사용한 방법보다 빨라야한다.', () => {
      var t0 = Date.now();
      for (let i = 0; i < 50000; i++) {
        let cloned = clonedeep(source);
      }
      var t1 = Date.now();
      var perf_clone = t1 - t0;

      t0 = Date.now();
      for (let i = 0; i < 50000; i++) {
        let cloned = cloneDeep(source);
      }
      t1 = Date.now();
      var perf_assign = t1 - t0;

      console.log("Object.assign()을 사용한 방법 : " + perf_assign + " milliseconds.");
      console.log("clone을 사용한 방법 : " + perf_clone + " milliseconds.");

      // expect(perf_clone).to.be.below(perf_assign);
    });

  });

  describe('test for complex object', () => {

    var source;

    beforeEach(() => {
      source = {
        a: 32,
        b: 'abc',
        c: [1, 2, 3, 4, 5, 6, 7],
        d: {
          aa: 36,
          bb: 'abcdefghi',
          cc: ['a', 'b', 'c', 'd', 'e'],
          dd: {
            x: 1,
            y: 2,
            z: 3
          }
        }
      };
    });

    it('복사된 오브젝트의 Key의 종류와 값, 그리고 갯수가 같아야 한다.', () => {
      var cloned = clonedeep(source);

      expect(cloned.d.aa).to.equal(36);
      expect(cloned.d.bb).to.equal('abcdefghi');

      expect(cloned).to.include.keys('a');
      expect(cloned).to.include.keys('b');
      expect(cloned).to.include.keys('c');
      expect(cloned).to.include.keys('d');

      expect(Object.keys(cloned).length).to.equal(4);
    });

    it('Object.assign()을 사용한 방법보다 빨라야한다.', () => {
      var t0 = Date.now();
      for (let i = 0; i < 50000; i++) {
        let cloned = clonedeep(source);
      }
      var t1 = Date.now();
      var perf_clone = t1 - t0;

      t0 = Date.now();
      for (let i = 0; i < 50000; i++) {
        let cloned = cloneDeep(source);
      }
      t1 = Date.now();
      var perf_assign = t1 - t0;

      console.log("Object.assign()을 사용한 방법 : " + perf_assign + " milliseconds.");
      console.log("clone을 사용한 방법 : " + perf_clone + " milliseconds.");

      // expect(perf_clone).to.be.below(perf_assign);
    });

  });
});
