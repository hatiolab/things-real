/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import SnapshotTaker from '../../../src/command/snapshot-taker'
import TimeCapsule from '../../../src/command/timecapsule'

import { expect } from 'chai'

describe('(Core) SnapshotTaker', () => {
  var state_holder;
  var timecapsule;
  var snapshot_taker;

  beforeEach(() => {
    state_holder = {
      get state() {
        return new Date().getTime();
      }
    };

    timecapsule = new TimeCapsule(100, state_holder.state);
    snapshot_taker = new SnapshotTaker(state_holder, timecapsule);
  });

  afterEach(() => {
    timecapsule.dispose();
    snapshot_taker.dispose();
  });

  it('변화가 반복되는 경우의 상태는 마지막 Snapshot만을 남긴다.', (done) => {

    for (let i = 0; i < 100; i++)
      snapshot_taker.touch()

    setTimeout(() => {
      expect(timecapsule.length).to.equal(2);
      done();
    }, 1000)
  });

  it('Brake가 잡힌 경우에는 딜레이 시간이 지나도 Snapshot을 찍지 않는다. Brake가 풀린 후에 Snapshot을 찍는다.', (done) => {

    snapshot_taker.brake = true;

    for (let i = 0; i < 100; i++)
      snapshot_taker.touch()

    setTimeout(() => {
      expect(timecapsule.length).to.equal(1);
      snapshot_taker.brake = false;
    }, 500)

    setTimeout(() => {
      expect(timecapsule.length).to.equal(2);
      done();
    }, 1500)
  });

  it('딜레이 시간이 지나지 않은 상황에서 backward()를 하는 경우, 현재 상태를 강제로 snapshot을 남기고, backward()로 상태를 바꾼다.', (done) => {

    var first_state = timecapsule.current;

    setTimeout(() => {
      snapshot_taker.touch()

      var last = timecapsule.backward();

      expect(last).to.equal(first_state);

      var next = timecapsule.forward();
      expect(next).not.to.equal(undefined);

      done();
    }, 1000)
  });

  it('backward()가 여러번 진행된 상황에서, forward()로 상태를 바꾸는 경우, backward 횟수만큼 성공해야 한다.', () => {

    // 강제로 10번의 상태를 저장한다.
    for (let i = 0; i < 10; i++)
      snapshot_taker.take(true)

    // 5번의 backward()를 진행한다.
    for (let i = 0; i < 5; i++)
      timecapsule.backward()

    expect(timecapsule.length).to.equal(11);

    // 5번의 forward()가 성공해야한다.
    for (let i = 0; i < 5; i++)
      expect(timecapsule.forward()).not.to.equal(undefined);

    // 6번째 forward()가 실패해야한다.
    expect(timecapsule.forward()).to.equal(undefined);
    expect(timecapsule.length).to.equal(11);
  });

  it('backward()가 여러번 진행된 상황에서, 상태를 변경하고 딜레이 시간이 지나지 않은 채로 forward()로 상태를 바꾸려고 하면, 실패해야 한다.', () => {

    // 강제로 10번의 상태를 저장한다.
    for (let i = 0; i < 10; i++)
      snapshot_taker.take(true)

    // 5번의 backward()를 진행한다.
    for (let i = 0; i < 5; i++)
      timecapsule.backward()

    expect(timecapsule.length).to.equal(11);

    expect(timecapsule.forward()).not.to.equal(undefined);

    snapshot_taker.touch()

    expect(timecapsule.forward()).to.equal(undefined);
    expect(timecapsule.length).to.equal(8);
  });
});
