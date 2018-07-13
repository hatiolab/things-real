import { expect } from 'chai';
import { Component, Container } from '../../../src'

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

    const child = new Component(childModel);
    const parent = new Container(parentModel);

    const childHierachy = child.hierarchy;
    const parentHierachy = parent.hierarchy;

    childHierachy.id.should.equal('child');
    // parentHierachy.components.length.should.equal(1);
  });

});