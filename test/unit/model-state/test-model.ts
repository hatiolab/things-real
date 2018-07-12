import { expect } from 'chai';
import { Component } from '../../../src'

describe('Component model', () => {

  it('should ...', () => {
    const component = new Component({
      model: {
        scale: { x: 1, y: 1, z: 1 }
      }
    });

    component.setModel('scale', { x: 10, y: 10, z: 10 }); // model
    component.scale = { x: 100, y: 100, z: 100 }; // state
    component.clearState('scale'); // state
    component.rotate = { x: 0.1, y: 0.1, z: 0.1 }; // state

    component.scale.x.should.equal(10);
    component.scale.should.equal(component.state.scale);
  });

});