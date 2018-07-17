/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { isEqual } from 'lodash'

import { expect } from 'chai'

describe('isEqual', function () {

  describe('test for simple object', function () {

    var obj1, obj2, obj3;

    beforeEach(function () {
      obj1 = { a: 32, b: 'abc' };
      obj2 = { a: 32, b: 'abc' };
      obj3 = { a: '32', b: 'abc' };
    });

    it('key의 종류와 값이 같은 오브젝트의 비교는 결과가 true이어야 한다.', function () {
      var equality = isEqual(obj1, obj2);

      expect(equality).to.be.true;
    });

    it('key의 값 타입이 다른 오브젝트의 비교는 결과가 false이어야 한다.', function () {
      var equality = isEqual(obj1, obj3);

      expect(equality).to.be.false;
    });


    // it('JSON을 사용한 방법보다 빨라야한다.', function () {
    //   var t0 = Date.now();
    //   for(let i = 0;i < 10000;i++) {
    //     let equality = JSON.stringify(obj1) == JSON.stringify(obj2);
    //   }
    //   var t1 = Date.now();
    //   var perf_json = t1 - t0;
    //   console.log("JSON을 활용한 방법 : " + perf_json + " milliseconds.");

    //   t0 = Date.now();
    //   for(let i = 0;i < 10000;i++) {
    //     let equality = deepEquals(obj1, obj2);
    //   }
    //   t1 = Date.now();
    //   var perf_deepequals = t1 - t0;
    //   console.log("deepEquals을 사용한 방법 : " + perf_deepequals + " milliseconds.");

    //   expect(perf_deepequals).to.be.below(perf_json);
    // });

  });

});
