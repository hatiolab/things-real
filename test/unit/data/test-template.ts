/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { RootContainer, Container, Component } from '../../../src/component'

import { expect } from 'chai'

describe('Template Component', () => {
  describe('findTemplateFor(id)', () => {
    var root;

    beforeEach(() => {
      root = new RootContainer({
        width: 100,
        height: 100
      });
    });

    it('모델에 templatePrefix가 설정된 컴포넌트가 추가되는 경우 템플릿 레퍼런스 맵에 추가되어야 한다.', () => {
      var component = new Component({
        templatePrefix: 'XXX-'
      });

      root.addComponent(component);

      expect(root.findTemplateFor('XXX-123')).to.equal(component)
    });

    it('모델에 templatePrefix가 설정된 컴포넌트가 삭제되는 경우 템플릿 레퍼런스 맵에서 제거되어야 한다.', () => {
      var component = new Component({
        templatePrefix: 'XXX-'
      });

      root.removeComponent(component);

      expect(root.findTemplateFor('XXX-123')).to.equal(undefined)
    });

    it('컴포넌트 모델의 templatePrefix 속성이 변경되는 경우 템플릿 레퍼런스 맵에서도 변경되어야 한다.', () => {
      var component = new Component({
        templatePrefix: 'XXX-'
      });

      root.addComponent(component);

      expect(root.findTemplateFor('XXX-123')).to.equal(component)

      component.set('templatePrefix', 'YYY-');

      expect(root.findTemplateFor('XXX-123')).to.equal(undefined)
      expect(root.findTemplateFor('YYY-123')).to.equal(component)
    });

    it('findTemplateFor(id) ID와 매칭되는 templatePrefix를 가진 템플릿중에서 가장 긴 템플릿부터 적용된다.', () => {
      var component1 = new Component({
        templatePrefix: 'XXX-'
      });

      var component2 = new Component({
        templatePrefix: 'XXX--'
      });

      root.addComponent(component1);
      root.addComponent(component2);

      expect(root.findTemplateFor('XXX--123')).to.equal(component2)

      component1.set('templatePrefix', 'XXX--1');

      expect(root.findTemplateFor('XXX--123')).to.equal(component1)
    });
  })
});
