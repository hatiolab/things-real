import { expect } from 'chai'
import { info } from '../../../src'

describe('API info', () => {

  it('should have version and mode', () => {
    expect(info).contain.keys('version', 'mode');
  });

});