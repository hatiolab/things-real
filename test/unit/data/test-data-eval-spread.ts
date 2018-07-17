/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { RootContainer, Container, Component } from '../../../src/component'

import { expect } from 'chai'

const DELAY = 1100

describe('(data-binding) evaluated data spread', function () {
  var root;

  beforeEach(function () {
    root = new RootContainer({});
  });

  describe('Primitive Value Data Spread', function () {
    it('Primitive Value Data Spread 시에는 (key) 타겟을 설정할 수 없다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: '',
          target: '(key)',
          property: 'text',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(function () {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, DELAY)
    })

    it('Primitive Value Data Spread 시에는 [property] 타겟을 설정할 수 없다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: '',
          target: '[property]',
          property: 'text',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(function () {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, DELAY)
    })

    it('Primitive Value Data Spread 시에는 accessor를 설정할 수 없다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '.spread',
          property: 'text',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(function () {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, DELAY)
    })

    it('Primitive Value Data Spread', function (done) {
      var component = new Component({
        mappings: [{
          accessor: '',
          target: '.spread',
          property: 'text',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(function () {
        expect(newbee.text).to.equal('PRIMITIVE-VALUE')
        done()
      }, DELAY)
    })
  })

  describe('Object Data Spread', function () {
    it('Object Data Spread : accessor를 설정할 수 있다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '.spread',
          property: 'data',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = {
        result: 'OBJECT-VALUE'
      };

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(function () {
        expect(newbee.data).to.equal('OBJECT-VALUE')
        done()
      }, DELAY)
    })

    it('Object Data Spread : (key) 타겟을 설정하면, 오브젝트의 key들에 해당하는 id를 가진 컴포넌트들로 스프레드된다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '(key)',
          property: 'text',
          rule: 'eval',
          param: 'return targets[0].get("id") + " : " + value;'
        }]
      });

      root.addComponent(component);

      component.data = {
        result: {
          'key-00': 'value-00',
          'key-01': 'value-01',
          'key-02': 'value-02',
          'key-03': 'value-03',
          'key-04': 'value-04',
          'key-05': 'value-05'
        }
      };

      var idxs = [0, 1, 2, 3, 4, 5];
      var newbees = idxs.map(idx => {
        let newbee = new Component({
          id: 'key-0' + idx,
          text: 'NO-VALUE'
        })
        root.addComponent(newbee)

        return newbee
      })

      setTimeout(function () {
        idxs.forEach(idx => {
          let component = newbees[idx]
          let text = component.get('id') + ' : ' + 'value-0' + idx

          expect(newbees[idx].text).to.equal(text)
        })

        done()
      }, DELAY)
    })

    it('Object Data Spread : [property] 타겟을 설정할 수 있으며, 오브젝트의 property에 해당하는 id를 가진 컴포넌트로 스프레드된다.(이 경우 타겟 컴포넌트는 하나이다)', function (done) {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '[key-field]',
          property: 'data',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = {
        result: {
          'key-field': 'spread-id',
          'value-field': 'spread-value'
        }
      };

      var newbee = new Component({
        id: 'spread-id',
        text: 'NO-VALUE',
        mappings: [{
          accessor: 'value-field',
          target: '(self)',
          property: 'text',
          rule: 'eval',
          param: 'return value;'
        }]
      })

      root.addComponent(newbee)

      setTimeout(function () {
        expect(newbee.text).to.equal('spread-value')

        done()
      }, DELAY)
    })
  })

  describe('Array Data Spread', function () {
    it('Array Data Spread : index형 accessor를 설정할 수 있다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: '1',
          target: '(self)',
          property: 'text',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = ['ARRAY-VALUE', 'ARRAY-VALUE-2', 'ARRAY-VALUE-3'];

      setTimeout(function () {
        expect(component.text).to.equal('ARRAY-VALUE-2')

        done()
      }, DELAY)
    })

    it('Array Data Spread 시에는 (key) 타겟을 설정할 수 없다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '(key)',
          property: 'text',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = {
        result: ['ARRAY-VALUE', 'ARRAY-VALUE-2', 'ARRAY-VALUE-3']
      }

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(function () {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, DELAY)
    })

    it('Array Data Spread : [property] 타겟을 설정하면, 각 엘리먼트는 오브젝트 타입이어야 하며, 각 오브젝트의 property에 해당하는 id를 가진 컴포넌트들로 스프레드된다.', function (done) {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '[key-field]',
          property: 'data',
          rule: 'eval',
          param: 'return value;'
        }]
      });

      root.addComponent(component);

      component.data = {
        result: [{
          'key-field': 'spread-01',
          'value-field': 'spread-value-01'
        }, {
          'key-field': 'spread-02',
          'value-field': 'spread-value-02'
        }, {
          'key-field': 'spread-03',
          'value-field': 'spread-value-03'
        }, {
          'key-field': 'spread-04',
          'value-field': 'spread-value-04'
        }, {
          'key-field': 'spread-05',
          'value-field': 'spread-value-05'
        }, {
          'key-field': 'spread-06',
          'value-field': 'spread-value-06'
        }]
      }

      var template = new Component({
        type: 'component',
        templatePrefix: 'spread-',
        text: 'NO-VALUE',
        mappings: [{
          accessor: 'value-field',
          target: '(self)',
          property: 'text',
          rule: 'eval',
          param: 'return targets[0].get("id") + " : " + value;'
        }]
      })

      root.addComponent(template);

      setTimeout(function () {
        [1, 2, 3, 4, 5, 6].forEach(idx => {
          let comp = root.findById('spread-0' + idx)
          let text = comp.get('id') + ' : ' + 'spread-value-0' + idx

          expect(comp.text).to.equal(text)
        })
        done()
      }, DELAY)
    })
  })

});
