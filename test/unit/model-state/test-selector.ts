/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import * as selector from '../../../src/component/model/selector'
import { Component, Container, RootContainer } from '../../../src/component'

describe('Selector', () => {

  describe('match', () => {

    it('should match selector with component type', () => {

      var component = new Component({ type: 'sample' });

      selector.match('sample', component).should.be.true;
      selector.match('simple', component).should.be.false;
    });
  });

  describe('select', () => {

    it('should find components matched with selector', () => {
      var root = new RootContainer({
        width: 100,
        height: 100
      });

      var computer = new Container({ type: 'computer', id: 'id_computer', class: 'white' });
      var folder = new Container({ type: 'folder', id: 'id_folder', class: 'white blue' });
      var file1 = new Component({ type: 'file', id: 'id_file1' });
      var file2 = new Component({ type: 'file', id: 'id_file2', class: 'white' });
      var link = new Component({ type: 'link', id: 'id_link', class: 'blue' });

      root.addComponent(computer);
      computer.addComponent(folder);
      [file1, file2, link].forEach(file => folder.addComponent(file));

      var files = selector.select('file', computer);
      files.length.should.equal(2);
      file1.should.be.oneOf(files);
      file2.should.be.oneOf(files);
      link.should.not.be.oneOf(files);

      var links = selector.select('#id_link', computer);
      links.length.should.equal(1);
      link.should.be.oneOf(links);

      var whites = selector.select('.white', computer);
      whites.length.should.equal(3);
      computer.should.be.oneOf(whites);
      folder.should.be.oneOf(whites);
      file2.should.be.oneOf(whites);
    });

  });

});

