import { expect } from 'chai';
import { create, Mode } from '../../../src/api'

describe('API create', () => {

  it('should ...', async () => {
    const scene = await create({
      mode: Mode.VIEW,
      targetEl: 'scene',
      model: {
        width: 800,
        height: 600
      }
    });

    expect(scene).contain.keys('mode');
  });

});