/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from "../component";

export default interface LifeCycleCallback {
  /**
   * created
   * 하위 자식 컴포넌트까지 다 생성한 후에 호출된다.
   */
  created(): void;

  /**
   * added
   * 부모 컨테이너에 추가된 후에 호출된다.
   */
  added(parent: Component): void;

  /**
   * removed
   * 부모 컨테이너에서 제거된 후에 호출된다.
   */
  removed(parent: Component): void;

  /**
   * ready
   * 전체 모델이 만들어지고, 동작준비가 완료된 상태에서 호출됨. 단 한번만 호출됨.
   */
  ready(): void;

  /**
   * dispose
   * 컴포넌트가 완전히 해체되면 호출된다.
   */
  disposed(): void;
}
