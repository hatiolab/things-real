import { expect } from 'chai';
import { create } from '../../../src/api'

describe('API create', () => {

  it('should ...', async () => {
    const scene = await create({ mode: 'modeler' });
    expect(scene).contain.keys('mode');
  });

});