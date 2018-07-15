/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { EventSource } from '../../../src/event'

import { expect } from 'chai'

describe('Event', () => {

  class Creature extends EventSource {
    public name: string

    constructor(name) {
      super();
      this.name = name;
    }
  }

  class Animal extends Creature {
  }

  describe('trigger', () => {
    it('should receive listening event from the event', () => {

      class Person extends Creature {
        public running: boolean = false

        run(e) {
          this.trigger('run');
          this.running = true;
        }
      }

      var dog = new Animal('wang');
      var person = new Person('NaN');

      // event subscribing
      dog.on('buck', person.run, person);

      // event firing
      dog.trigger('buck');

      expect(person.running).to.equal(true);
    });
  });

  describe('trigger', () => {
    it('should receive all kind of event from the event source', () => {

      var dog = new Animal('wang');
      var name;

      dog.on('(all)', (dogname) => {
        name = dogname;
      });

      dog.trigger('buck', dog.name);

      expect(name).to.equal(dog.name);
    });
  });

  describe('delegate', () => {
    it('should not change event object from the event source', () => {

      var dog = new Animal('dog');

      class Hutch extends Creature { }
      var hutch = new Hutch('hutch');

      class Home extends EventSource { }
      var home = new Home();

      var bucked = 0;
      home.on('buck', () => {
        bucked++;
      });

      home.on('huck', () => {
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
