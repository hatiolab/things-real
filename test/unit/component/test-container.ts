import { expect } from 'chai';
import { Component, Container, compile } from '../../../src'

describe('Container', () => {

  it('should ...', () => {
    const childModel = {
      type: 'component',
      id: 'child'
    };

    const parentModel = {
      type: 'container',
      id: 'parent',
      components: [
        childModel
      ]
    };

    const parent: Container = compile(parentModel) as Container;
    const child = parent.components[0];

    const childHierachy = child.hierarchy;
    const parentHierachy = parent.hierarchy;

    childHierachy.id.should.equal('child');
    parentHierachy.components.length.should.equal(1);
  });

});