/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import buildAccessor from '../../../src/util/obj-accessor'

import { expect } from 'chai'

describe('accessor', () => {

  var o = {
    'attr-100': 100,
    'attr-a': {
      'attr-aa': 'aa',
      'attr-ab': 'ab'
    },
    'attr-b': [{
      'attr-ba': 'ba0',
      'attr-bb': 'bb0'
    }, {
      'attr-ba': 'ba1',
      'attr-bb': 'bb1'
    }, {
      'attr-ba': 'ba2',
      'attr-bb': 'bb2'
    }]
  };

  var a = [{
    'attr-ba': 'ba0',
    'attr-bb': 'bb0'
  }, {
    'attr-ba': 'ba1',
    'attr-bb': 'bb1'
  }, {
    'attr-ba': 'ba2',
    'attr-bb': 'bb2'
  }];

  beforeEach(() => {
  });

  describe('invalid accessor', () => {
    it('공백 속성인 경우에는 오브젝트 자신이 반환되어야 한다.', () => {
      var accessor0 = buildAccessor('');
      var accessor1 = buildAccessor(' ');
      var accessor2 = buildAccessor('.  .  . ');
      var accessor3 = buildAccessor();
      var accessor4 = buildAccessor('attr-100');

      expect(accessor0(o)).to.equal(o);
      expect(accessor1(o)).to.equal(o);
      expect(accessor2(o)).to.equal(o);
      expect(accessor3(o)).to.equal(o);
      expect(accessor4(o)).to.equal(100);
    });
  });

  describe('first level attribute', () => {
    it('해당 속성값을 가져올 수 있어야 한다.', () => {
      var accessor = buildAccessor('attr-100');

      expect(accessor(o)).to.equal(100);
    });

    it('해당 속성 객체를 가져올 수 있어야 한다.', () => {
      var accessor = buildAccessor('attr-a');

      expect(accessor(o)['attr-ab']).to.equal('ab');
    });

    it('해당 속성 배열을 가져올 수 있어야 한다.', () => {
      var accessor = buildAccessor('attr-b');

      expect(accessor(o)[1]['attr-bb']).to.equal('bb1');
    });

    it('속성이 없을 때는 undefine가 된다.', () => {
      var accessor = buildAccessor('attr-c');

      expect(accessor(o)).to.be.an('undefined');
    });

  });

  describe('deeper level attribute', () => {
    it('다 단계의 속성 값을 가져올 수 있어야 한다.', () => {
      var accessor = buildAccessor('attr-a.attr-ab');

      expect(accessor(o)).to.equal('ab');
    });

    it('배열 인덱스가 포함된 다단계 속성 값을 가져올 수 있어야 한다.', () => {
      var accessor = buildAccessor('attr-b[1].attr-bb');

      expect(accessor(o)).to.equal('bb1');
    });

  });


});

