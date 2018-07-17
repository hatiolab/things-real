/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { RootContainer, Container, Component } from '../../../src/component'

import { expect } from 'chai'

describe('(data-mapping)relative target', () => {

  var root;

  beforeEach(() => {
    root = new RootContainer({});
  });

  it('컴포넌트의 데이타 매핑정보에 (self) 타겟이 있는 경우, data가 변경되면 컴포넌트 자신의 속성이 변경되어야 한다.', () => {
    var component = new Component({
      mappings: [{
        accessor: '',
        target: '(self)',
        property: 'text',
        rule: 'value'
      }]
    });

    root.addComponent(component);

    component.data = 'TEST-DATA';

    expect(component.text).to.equal('TEST-DATA')
  });

  it('컴포넌트의 데이타 매핑정보에 (parent) 타겟이 있는 경우, data가 변경되면 컴포넌트 부모의 속성이 변경되어야 한다.', () => {
    var component = new Component({
      mappings: [{
        accessor: '',
        target: '(parent)',
        property: 'text',
        rule: 'value'
      }]
    });

    root.addComponent(component);

    component.data = 'TEST-DATA';

    expect(root.text).to.equal('TEST-DATA')
  });

  it('컴포넌트의 데이타 매핑정보에 (child) 타겟이 있는 경우, data가 변경되면 컴포넌트 자식들의 속성이 변경되어야 한다.', () => {
    var parent = new Container({
      mappings: [{
        accessor: '',
        target: '(child)',
        property: 'text',
        rule: 'value'
      }]
    });

    root.addComponent(parent);

    [1, 2, 3].forEach(function (id) {
      parent.addComponent(new Component({
        id: String(id)
      }));
    })

    parent.setState('data', 'TEST-DATA');

    parent.components.forEach(function (child) {
      expect(child.text).to.equal('TEST-DATA')
    })
  });

  it('컴포넌트의 데이타 매핑정보에 (sibling) 타겟이 있는 경우, data가 변경되면 컴포넌트 형제들의 속성이 변경되어야 한다.', () => {
    var brother = new Container({
      mappings: [{
        accessor: '',
        target: '(sibling)',
        property: 'text',
        rule: 'value'
      }]
    });

    root.addComponent(brother);

    [1, 2, 3].forEach(function (id) {
      root.addComponent(new Component({
        id: String(id)
      }));
    })

    brother.setState('data', 'TEST-DATA');

    root.components.forEach(function (child) {
      if (child === brother)
        expect(child.text).not.to.equal('TEST-DATA')
      else
        expect(child.text).to.equal('TEST-DATA')
    })
  });
});
