/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, Container, RootContainer } from '../../../src/component'
import EventEngine from '../../../src/event/event-engine'

import { expect } from 'chai'

describe('EventEngine', () => {

  var root;

  var computer;

  var folder1;
  var folder2;
  var folder3;

  var folder11;

  var file111;
  var file112;
  var file113;
  var link114;

  var file21;
  var link22;

  var file31;
  var link32;

  var origin_computer_count;
  var origin_folder_count;
  var origin_file_count;
  var origin_link_count;

  var deliverer_computer_count;
  var deliverer_folder_count;
  var deliverer_file_count;
  var deliverer_link_count;

  beforeEach(() => {
    origin_computer_count = 0;
    origin_folder_count = 0;
    origin_file_count = 0;
    origin_link_count = 0;

    deliverer_computer_count = 0;
    deliverer_folder_count = 0;
    deliverer_file_count = 0;
    deliverer_link_count = 0;

    root = computer = new RootContainer({
      width: 100,
      height: 100,
      type: 'computer',
      id: 'computer1'
    });

    folder1 = new Container({ type: 'folder', id: 'folder1' });
    folder2 = new Container({ type: 'folder', id: 'folder2' });
    folder3 = new Container({ type: 'folder', id: 'folder3' });

    [folder1, folder2, folder3].forEach(folder => root.addComponent(folder));

    folder11 = new Container({ type: 'folder', id: 'folder11' });

    folder1.addComponent(folder11);

    file111 = new Component({ type: 'file', id: 'file111' });
    file112 = new Component({ type: 'file', id: 'file112' });
    file113 = new Component({ type: 'file', id: 'file113' });
    link114 = new Component({ type: 'link', id: 'link114' });

    [file111, file112, file113, link114].forEach(file => folder11.addComponent(file));

    file21 = new Component({ type: 'file', id: 'file21' });
    link22 = new Component({ type: 'link', id: 'link22' });

    [file21, link22].forEach(file => folder2.addComponent(file));

    file31 = new Component({ type: 'file', id: 'file31' });
    link32 = new Component({ type: 'link', id: 'link32' });

    [file31, link32].forEach(file => folder3.addComponent(file));
  });

  afterEach(() => {
    root.dispose()
  });

  describe('constructor/add/remove', () => {

    it('(root) deliverer, (all) origin 조합은 하위의 모든 이벤트를 다 받을 수 있다.', () => {
      var engine = new EventEngine(root);

      function handler(e) {
        eval("origin_" + e.origin.get('type') + "_count++");
        eval("deliverer_" + e.deliverer.get('type') + "_count++");

        this.should.be.equal(e.listener);
        // e.deliverer.get('type').should.be.equal(computer)
      }

      engine.add(this, {
        '(root)': {
          '(all)': {
            'event': handler
          }
        }
      });

      file31.trigger('event');

      origin_file_count.should.be.equal(1);
      deliverer_computer_count.should.be.equal(1);

      link114.trigger('event');

      origin_file_count.should.be.equal(1);
      origin_link_count.should.be.equal(1);
      deliverer_computer_count.should.be.equal(2);

    });

    it('리스너가 이벤트 객체가 아닌 경우 (self) 지시자를 사용하면 예외가 발생해야 한다.', () => {
      var engine = new EventEngine(root);

      function handler(e) {
        eval("origin_" + e.origin.get('type') + "_count++");
        eval("deliverer_" + e.deliverer.get('type') + "_count++");

        this.should.be.equal(e.listener);
      }

      function fn() {
        engine.add(this, {
          '(self)': {
            '(all)': {
              'event': handler
            }
          }
        });
      }

      // 여기에서는 Error가 발생해야 한다.
      expect(fn).to.throw(Error);
    });
  });

});

