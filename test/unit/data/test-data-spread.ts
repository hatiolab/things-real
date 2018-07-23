/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { RootContainer, Container, Component } from '../../../src/component'

import { expect } from 'chai'

const PENDING = 600

describe('(data-binding) data spread', () => {

  var root;

  beforeEach(() => {
    root = new RootContainer({
      width: 100,
      height: 100
    });
  });

  describe('Primitive Value Data Spread', () => {
    it('(key) 타겟을 설정할 수 없다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: '',
          target: '(key)',
          property: 'text',
          rule: 'value'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(() => {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, PENDING)
    })

    it('[property] 타겟을 설정할 수 없다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: '',
          target: '[property]',
          property: 'text',
          rule: 'value'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(() => {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, PENDING)
    })

    it('accessor를 설정할 수 없다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '.spread',
          property: 'text',
          rule: 'value'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(() => {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, PENDING)
    })

    it('새로 생성되는 오브젝트에도 data mapping은 실행되어야 한다.', (done) => {
      var component = new Component({
        type: 'component',
        mappings: [{
          accessor: '',
          target: '.spread',
          property: 'text',
          rule: 'value'
        }]
      });

      root.addComponent(component);

      component.data = 'PRIMITIVE-VALUE';

      var newbee = new Component({
        class: 'spread',
        text: 'NO-VALUE'
      })

      root.addComponent(newbee);

      setTimeout(() => {
        expect(newbee.text).to.equal('PRIMITIVE-VALUE')
        done()
      }, PENDING)
    })
  })

  describe('Object Data Spread', () => {
    it('accessor를 설정할 수 있다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '.spread',
          property: 'data',
          rule: 'value'
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

      setTimeout(() => {
        expect(newbee.data).to.equal('OBJECT-VALUE')
        done()
      }, PENDING)
    })

    it('(key) 타겟을 설정하면, 오브젝트의 key들에 해당하는 id를 가진 컴포넌트들로 스프레드된다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '(key)',
          property: 'text',
          rule: 'value'
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

      setTimeout(() => {
        idxs.forEach(idx => expect(newbees[idx].text).to.equal('value-0' + idx))

        done()
      }, PENDING)
    })

    it('[property] 타겟을 설정할 수 있으며, 오브젝트의 property에 해당하는 id를 가진 컴포넌트로 스프레드된다.(이 경우 타겟 컴포넌트는 하나이다)', (done) => {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '[key-field]',
          property: 'data',
          rule: 'value'
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
          rule: 'value'
        }]
      })

      root.addComponent(newbee)

      setTimeout(() => {
        expect(newbee.text).to.equal('spread-value')

        done()
      }, PENDING)
    })
  })

  describe('Array Data Spread', () => {
    it('index형 accessor를 설정할 수 있다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: '1',
          target: '(self)',
          property: 'text',
          rule: 'value'
        }]
      });

      root.addComponent(component);

      component.data = ['ARRAY-VALUE', 'ARRAY-VALUE-2', 'ARRAY-VALUE-3'];

      setTimeout(() => {
        expect(component.text).to.equal('ARRAY-VALUE-2')

        done()
      }, PENDING)
    })

    it('Array Data Spread 시에는 (key) 타겟을 설정할 수 없다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '(key)',
          property: 'text',
          rule: 'value'
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

      setTimeout(() => {
        expect(newbee.text).to.equal('NO-VALUE')
        done()
      }, PENDING)
    })

    it('[property] 타겟을 설정하면, 각 엘리먼트는 오브젝트 타입이어야 하며, 각 오브젝트의 property에 해당하는 id를 가진 컴포넌트들로 스프레드된다.', (done) => {
      var component = new Component({
        mappings: [{
          accessor: 'result',
          target: '[key-field]',
          property: 'data',
          rule: 'value'
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
          rule: 'value'
        }]
      })

      root.addComponent(template);

      setTimeout(() => {
        [1, 2, 3, 4, 5, 6].forEach(idx => {
          let comp = root.findById('spread-0' + idx)
          expect(comp.text).to.equal('spread-value-0' + idx)
        })
        done()
      }, PENDING)
    })
  })

});
