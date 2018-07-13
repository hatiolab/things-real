import { expect } from 'chai';
import { RootContainer, Component, Container } from '../../../src'

describe('RootContainer', () => {

  it('주어진 모델을 모두 포함하는 최상위 컨테이너가 되어야 한다.', () => {

    const model = {
      components: [{
        type: 'container',
        id: 'parent',
        components: [{
          type: 'component',
          id: 'child'
        }]
      }]
    };

    const root = new RootContainer(model);

    root.components.length.should.equal(1);
    root.components[0].get('type').should.equal('container');
    root.components[0].get('id').should.equal('parent');
  });

});