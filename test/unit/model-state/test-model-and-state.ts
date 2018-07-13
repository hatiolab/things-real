import { expect } from 'chai';
import { compile } from '../../../src'

describe('ModelAndState', () => {

  it('state 정보가 삭제되면, 동일 속성의 model 정보가 상태값이 된다.', () => {
    const component = compile({
      type: 'component',
      scale: { x: 10, y: 10, z: 10 }
    });

    component.scale = { x: 100, y: 100, z: 100 }; // state
    component.scale.x.should.equal(100);

    component.clearState('scale'); // state
    component.scale.x.should.equal(10);
  });

  it('model 정보가 변경되면, 변경된 속성값이 상태값이 된다.', () => {
    const component = compile({
      type: 'component',
      scale: { x: 1, y: 1, z: 1 }
    });

    component.scale = { x: 100, y: 100, z: 100 }; // state
    component.setModel('scale', { x: 10, y: 10, z: 10 }); // model

    component.scale.x.should.equal(10);
    component.scale.should.equal(component.model.scale);
  });
});