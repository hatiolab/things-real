import { expect } from 'chai'
import { info } from '../../../src/api'

describe('API info', () => {

  it('should have version and mode', () => {
    expect(info).contain.keys('version', 'mode');
  });

});