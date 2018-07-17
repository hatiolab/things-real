import { expect } from 'chai';
import { Component, Container, compile } from '../../../src'

describe('Container', () => {

  it('자식 컴포넌트들의 container 속성은 부모 컨테이너를 가리켜야 한다.', () => {
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

    child.parent.should.equal(parent);
  });

});