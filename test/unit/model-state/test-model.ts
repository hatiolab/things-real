import { expect } from 'chai';
import { Component } from '../../../src/component'

describe('Component model', () => {

  it('should ...', () => {
    const component = new Component({
      model: {
        center: 10,
        dimension: '100'
      }
    });

    component.dimension = '180'; // state
    component.setModel('center', 50); // model
    component.clearState('dimension'); // state
    component.center = 40; // state
    component.clearState('center'); // state
    component.rotate = '0'; // state

    component.dimension.should.equals('100');
    component.center.should.equal(50);
    console.log(component.model);
    component.center.should.equal(component.state.center);
  });

});