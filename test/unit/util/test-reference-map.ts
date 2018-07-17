/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import ReferenceMap from '../../../src/util/reference-map'

import { expect } from 'chai'

describe('(Core) ReferenceMap', function () {

  it('레퍼런스 add 함수가 호출될 때, 타겟 오브젝트가 제공되지 않으면, 레퍼런스 카운터 생성자가 실행되어야 한다.', function () {
    var creator_called = false

    var references = new ReferenceMap(function (id, resolve, reject) {
      creator_called = true

      resolve({ v: "Reference : " + id })
    })

    references.add('first item')
      .then(function (ref) {
        expect(creator_called).to.be.true;
      });
  });

  it('레퍼런스 add 함수가 호출될 때, 타겟 오브젝트가 제공되면, 레퍼런스 카운터 생성자가 실행되지 않아야 한다.', function () {
    var creator_called = false

    var references = new ReferenceMap(function (id, resolve, reject) {
      creator_called = true;

      resolve({ v: "Reference : " + id })
    })

    var target = { a: 'a' }
    references.add('first item', target)
      .then(function (ref) {
        expect(ref).to.equal(target);
        expect(creator_called).to.be.false;
      });
  });

  it('등록되지 않은 레퍼런스를 가지고 오면, 생성자가 실행되어야 한다.', function () {
    var creator_called = false;

    var references = new ReferenceMap(function (id, resolve, reject) {
      creator_called = true;

      resolve({ v: "Reference : " + id })
    })

    references.get('first item', true)
      .then(function (ref) {
        expect(creator_called).to.be.true;
      });
  });

  it('등록된 레퍼런스를 get 하면, 등록된 레퍼런스가 반환되어야 한다.', function () {
    var creator_called = false;

    var references = new ReferenceMap(function (id, resolve, reject) {
      creator_called = true;
      resolve({ v: "Reference : " + id })
    })

    var target = { a: 'a' }
    references.add('first item', target)
      .then(function (ref) {
        references.get('first item')
          .then(function (ref) {
            expect(creator_called).to.be.false;
            expect(target).to.equal(ref);
          })
      });
  });

  it('레퍼런스 카운트가 0로 될 때, 레퍼런스 카운터 소멸자가 실행되어야 한다.', function () {
    var disposer_called = false

    var references = new ReferenceMap(function (id, resolve, reject) {
      resolve({ v: "Reference : " + id })
    }, function (id, target) {
      disposer_called = true;
    })

    references.add('first item')
      .then(function (ref) {
        ref['release']();

        expect(disposer_called).to.be.true;
      });
  });

  it('소멸된 레퍼런스를 달라고 하면, undefined가 반환되어야 한다.', function () {
    var disposer_called = false

    var references = new ReferenceMap(function (id, resolve, reject) {
      resolve({ v: "Reference : " + id })
    }, function (id, target) {
      disposer_called = true;
    })

    references.add('first item')
      .then(function (ref) {
        ref['release']();

        references.get('first item', false)
          .then(function (ref) {
            expect(disposer_called).to.be.true;
            expect(ref).to.equal(undefined);
          })
      });
  });

});
