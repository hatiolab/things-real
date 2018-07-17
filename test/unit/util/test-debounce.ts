/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { debounce } from 'lodash'

import { expect } from 'chai'

describe('(Core) debounce', () => {
  const DELAY = 1000;

  var counter = 0;
  var debouncer = debounce(() => {
    ++counter;
  }, DELAY);

  beforeEach(() => {
    counter = 0
  });

  it('딜레이 전에는 실행되지 않아야 하며, 딜레이 후에 실행되어야 한다.', (done) => {
    debouncer();

    setTimeout(() => {
      expect(counter).to.equal(0);
    }, DELAY * 0.5)

    setTimeout(() => {
      expect(counter).to.equal(1);
      done();
    }, DELAY * 1.5)
  });

  it('딜레이 전에는 한번도 실행되지 않아야 하며, 딜레이 후에 꼭 1번만 실행되어야 한다.', (done) => {
    for (let i = 0; i < 100; i++)
      debouncer();

    setTimeout(() => {
      expect(counter).to.equal(0);
    }, DELAY * 0.5)

    setTimeout(() => {
      expect(counter).to.equal(1);
      done();
    }, DELAY * 1.5)
  });
})
