import { expect } from 'chai';
import { Component } from '../../../src/component'

describe('Component model', () => {

  it('should ...', () => {
    const component = new Component({
      model: {
        center: 10
      }
    });

    component['dimension'] = '100'; // state

    expect(component['dimension']).to.equals('100');
    component['center'].should.equal(10);
  });

});