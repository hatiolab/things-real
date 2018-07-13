import { expect } from 'chai';
import { Component, Container, compile } from '../../../src'

describe('Container - hierarchy', () => {

  it('하위 모델정보를 포함해야 한다.', () => {
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