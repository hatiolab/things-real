/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { RootContainer, Container, Component } from '../../../src/component'

import { expect } from 'chai'

describe('Component Generation Through Template', () => {
  var root;

  beforeEach(() => {
    root = new RootContainer({
      mappings: [{
        accessor: '',
        target: '(key)',
        property: 'data',
        rule: 'value'
      }]
    });
  });

  it('variable name을 가진 컴포넌트가 없고, 템플릿 컴포넌트의 template-prefix에 해당하는 컴포넌트들은 동적으로 추가되어야 한다.', () => {

    var component = new Component({
      type: 'component',
      templatePrefix: 'XXX-'
    });

    root.addComponent(component);
    expect(root.findById('XXX-001')).to.equal(undefined);

    root.setState('data', { 'XXX-001': 'DATA' });

    expect(root.findById('XXX-001').data).to.equal('DATA');

    root.setState('data', { 'XXX-002': 'ANOTHER' });
    var found = root.findById('XXX-002');
    expect(found.data).to.equal('ANOTHER');

  });

  it('variable name을 가진 컴포넌트가 이미 존재하는 경우, 템플릿 컴포넌트의 template-prefix에 해당하는 name일지라도 동적으로 추가되지 않는다.', () => {
    var exist = new Component({
      type: 'component',
      id: 'XXX-001'
    });

    var component = new Component({
      type: 'component',
      templatePrefix: 'XXX-'
    });

    root.addComponent(exist);
    root.addComponent(component);

    root.data = { 'XXX-001': 'DATA' };
    expect(root.findById('XXX-001')).to.equal(exist);
  });

  it('variable name을 가진 컴포넌트가 없고, name에 해당하는 템플릿 컴포넌트가 없는 경우 컴포넌트들은 동적으로 추가되지 않는다.', () => {
    root.data = { 'XXX-001': 'DATA' };
    expect(root.findById('XXX-001')).to.equal(undefined)
  });

});
