/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, Container, RootContainer } from '../../../src/component'
import EventPump from '../../../src/event/event-pump'

import { expect } from 'chai'

describe('EventPump', () => {

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

    root = computer = new RootContainer({ type: 'computer', id: 'computer1' });

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

  describe('on/off', () => {

    it('should be able to use id, type and special(self, all) selector', () => {

      var listener = {}

      function handler(e) {
        eval("origin_" + e.origin.get('type') + "_count++");
        eval("deliverer_" + e.deliverer.get('type') + "_count++");

        var listener_count = listener[e.listener.get('id')];
        listener[e.listener.get('id')] = listener_count ? ++listener_count : 1;

        this.should.be.equal(e.listener);
      }

      // EventPump ( Event Deliverer : computer )
      var pump = new EventPump(computer);

      var computer_listener = {
        // self means event deliverer : computer
        '(self)': {
          'event': handler
        },
        '#file111': {
          'event': handler
        }
      };

      // pump on ( Listener : computer ) - listener means the owner of the event handlers
      pump.addEventHandlers(computer, computer_listener);

      var folder_listener = {
        // self means event deliverer : computer
        '(self)': {
          'event': handler
        },
        '#link114': {
          'event': handler
        }
      };

      // pump on ( Listener : folder1 ) - listener means the owner of the event handlers
      pump.addEventHandlers(folder1, folder_listener);

      pump.start();

      file111.trigger('event');
      computer.trigger('event');

      link114.trigger('event');
      folder1.trigger('event');

      listener['computer1'].should.exist;
      listener['computer1'].should.be.equal(2);
      listener['folder1'].should.be.equal(2);

      origin_computer_count.should.be.equal(2);
      origin_file_count.should.be.equal(1);
      origin_folder_count.should.be.equal(0);
      origin_link_count.should.be.equal(1);

      deliverer_computer_count.should.be.equal(4);

      // /* Remove Subscriber */

      pump.removeEventHandlers(folder1);

      file111.trigger('event');
      computer.trigger('event');

      link114.trigger('event');
      folder1.trigger('event');

      listener['computer1'].should.be.equal(4);
      listener['folder1'].should.be.equal(2);

      origin_computer_count.should.be.equal(3);
      origin_file_count.should.be.equal(2);
      origin_folder_count.should.be.equal(0);
      origin_link_count.should.be.equal(1);

      deliverer_computer_count.should.be.equal(6);

      pump.dispose();
    });

    it('should be able to use variable selector', () => {

      var file_count = 0;
      var link_count = 0;

      function handler1(e) {
        file_count++;
        this.should.be.equal(e.listener);
      }

      function handler2(e) {
        link_count++;
        this.should.be.equal(e.listener);
      }

      computer.setModel({
        'var1': '#file31'
      });
      computer.setModel({
        'var2': '#link22'
      });

      var computer_listener = {
        '?var1': {
          'event': handler1
        },
        '?var2': {
          'event': handler2
        }
      };

      var pump = new EventPump(computer);
      pump.start();

      pump.addEventHandlers(computer, computer_listener);

      file31.trigger('event');
      link22.trigger('event');

      file_count.should.be.equal(1);
      link_count.should.be.equal(1);
    });

    it('should recognize synonyms with parenthesys', () => {
      var root_count = 0;
      var all_count = 0;

      function root_handler(e) {
        root_count++;
        this.should.be.equal(e.listener);
      }

      function all_handler(e) {
        all_count++;
        this.should.be.equal(e.listener);
      }

      var listener = {
        '(root)': {
          'event': root_handler
        },
        '(all)': {
          'event': all_handler
        }
      };

      var pump_on_folder11 = new EventPump(folder11); // deliverer ==> folder11
      pump_on_folder11.start();

      pump_on_folder11.addEventHandlers(this, listener); // listener ==> this

      computer.trigger('event'); // triggered at root (computor가 deliverer의 서브가 아니므로 받지 못한다.)
      file111.trigger('event'); // triggered at sub
      link22.trigger('event'); // triggered at non sub

      root_count.should.be.equal(0); // 루트는 하위가 아니므로, 하나도 받을 수 없다.
      all_count.should.be.equal(1); // 바로 하위(file111)에서 트리거링 된 이벤트만 받는다.

      pump_on_folder11.removeEventHandlers(this);

      /* reset counters */
      root_count = 0;
      all_count = 0;

      var pump_on_computer = new EventPump(computer); // deliverer ==> computer root
      pump_on_computer.start();

      pump_on_computer.addEventHandlers(this, listener); // listener ==> this

      computer.trigger('event'); // triggered at root
      file111.trigger('event'); // triggered at sub
      link22.trigger('event'); // triggered at non sub

      root_count.should.be.equal(1);  // 루트에서 발생한 이벤트도 받는다.
      all_count.should.be.equal(3); // 모두가 하위이므로 모든 이벤트를 받는다.
    });
  });

});

