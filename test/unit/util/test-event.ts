/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import mixin from '../../../src/util/mixin'
import event from '../../../src/util/event'

import { expect } from 'chai'

describe('(Core) Event', function () {
  describe('#listenTo() #trigger()', function () {
    it('should receive listening event from the event', function () {

      var Animal = function (name) {
        this.name = name;
      };

      Animal.prototype = {
        getName: function () {
          return this.name;
        }
      }

      mixin(Animal.prototype, event.withEvent)

      var dog = new Animal('wang');
      var person = {
        run: function (e) {
          this.trigger('run');
          this.running = true;
        }
      };

      mixin(person, event.withEvent)

      // event subscribing
      dog.on('buck', person.run, person);
      // person.listenTo(dog, 'buck', person.run);

      event.listenTo(dog, 'buck', function (e) {
        // console.log('I have got an event');
        // console.log(this, e);
      });

      // event firing
      dog.trigger('buck');

      expect(person.running).to.equal(true);
    });
  });

  describe('listenTo all', function () {
    it('should receive all kind of event from the event source', function () {

      var Animal = function (name) {
        this.name = name;
      };

      mixin(Animal.prototype, event.withEvent);

      var dog = new Animal('wang');
      var name;

      dog.on('(all)', function (dogname) {
        name = dogname;
      });

      dog.trigger('buck', dog.name);

      expect(name).to.equal(dog.name);
    });
  });

  describe('delegate', function () {
    it('should not change event object from the event source', function () {

      var Animal = function () { }

      mixin(Animal.prototype, event.withEvent);

      var dog = new Animal();

      var Hutch = function () { }

      mixin(Hutch.prototype, event.withEvent);

      var hutch = new Hutch();

      var Home = function () { }

      mixin(Home.prototype, event.withEvent);

      var home = new Home();

      var bucked = 0;
      home.on('buck', function () {
        bucked++;
      });

      home.on('huck', function () {
        bucked += 2;
      });

      hutch.delegate_on(home)
      dog.delegate_on(hutch);

      dog.trigger('buck');
      dog.trigger('huck');

      expect(bucked).to.equal(3);
    });
  });
});
