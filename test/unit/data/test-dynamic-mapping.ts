/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { RootContainer, Container, Component } from '../../../src/component'

import { expect } from 'chai'

const DELAY = 1100

describe('(data-mapping)dynamic mapping', function () {
  var root;

  beforeEach(function () {
    root = new RootContainer({});
  });

  it('동적으로 추가되는 컴포넌트도 생성시 바로 매핑이 실행되어야 한다.', function (done) {
    var component = new Component({
      mappings: [{
        accessor: '',
        target: '.dynamic',
        property: 'text',
        rule: 'value'
      }]
    });

    root.addComponent(component);

    component.setState('data', 'TEST-DATA');

    var newbee = new Component({
      class: 'dynamic'
    })

    root.addComponent(newbee);

    setTimeout(function () {
      expect(newbee.text).to.equal('TEST-DATA')
      done()
    }, DELAY)
  });

  it('동적으로 추가되는 컴포넌트의 매핑 정보도 생성시 바로 실행되어야 한다.', function (done) {
    var component = new Component({
      class: 'dynamic'
    });

    root.addComponent(component);

    var newbee = new Component({
      data: 'TEST-DATA',
      mappings: [{
        accessor: '',
        target: '.dynamic',
        property: 'text',
        rule: 'value'
      }]
    })

    root.addComponent(newbee);

    setTimeout(function () {
      expect(component.text).to.equal('TEST-DATA')
      done()
    }, DELAY)
  });

  it('동적으로 class가 변경되는 경우에도 컴포넌트의 매핑 정보도 생성시 바로 실행되어야 한다.', function (done) {
    var component1 = new Component({
      class: 'dynamic1'
    });

    var component2 = new Component({
      data: 'TEST-DATA-1',
      mappings: [{
        accessor: '',
        target: '.dynamic1',
        property: 'text',
        rule: 'value'
      }]
    })

    var component3 = new Component({
      data: 'TEST-DATA-2',
      mappings: [{
        accessor: '',
        target: '.dynamic2',
        property: 'text',
        rule: 'value'
      }]
    })

    root.addComponent(component1);
    root.addComponent(component2);
    root.addComponent(component3);

    component1.setState('class', 'dynamic2')

    setTimeout(function () {
      expect(component1.text).to.equal('TEST-DATA-2')
      done()
    }, DELAY)

  });

  it('동적으로 id가 변경되는 경우에도 컴포넌트의 매핑 정보도 생성시 바로 실행되어야 한다.', function (done) {
    var component1 = new Component({
      id: 'dynamic1'
    });

    var component2 = new Component({
      data: 'TEST-DATA-1',
      mappings: [{
        accessor: '',
        target: '#dynamic1',
        property: 'text',
        rule: 'value'
      }]
    })

    var component3 = new Component({
      data: 'TEST-DATA-2',
      mappings: [{
        accessor: '',
        target: '#dynamic2',
        property: 'text',
        rule: 'value'
      }]
    })

    root.addComponent(component1);
    root.addComponent(component2);
    root.addComponent(component3);

    component1.setState('id', 'dynamic2')

    setTimeout(function () {
      expect(component1.text).to.equal('TEST-DATA-2')
      done()
    }, DELAY)

  });

  it('동적으로 생성되는 경우에도 relative target에 대한 컴포넌트의 매핑도 생성시 바로 반영되어야 한다.', function (done) {
    var component1 = new Component({
      data: 'TEST-DATA-1',
      mappings: [{
        accessor: '',
        target: '(sibling)',
        property: 'text',
        rule: 'value'
      }]
    })

    var component2 = new Component({
    })

    root.addComponent(component1);
    root.addComponent(component2);

    setTimeout(function () {
      expect(component2.text).to.equal('TEST-DATA-1')
      done()
    }, 1000)

  });

});
