/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { Component, Container, RootContainer } from '../../../src'
import { select, match } from '../../../src/component/model'

describe('Selector', () => {

  describe('match', () => {

    it('should match selector with component type', () => {

      var component = new Component({ type: 'sample' });

      match('sample', component).should.be.true;
      match('simple', component).should.be.false;
    });
  });

  describe('select', () => {

    it('should find components matched with selector', () => {
      var root = new RootContainer({ type: 'root' });

      var computer = new Container({ type: 'computer', id: 'id_computer', class: 'white' });
      var folder = new Container({ type: 'folder', id: 'id_folder', class: 'white blue' });
      var file1 = new Component({ type: 'file', id: 'id_file1' });
      var file2 = new Component({ type: 'file', id: 'id_file2', class: 'white' });
      var link = new Component({ type: 'link', id: 'id_link', class: 'blue' });

      root.addComponent(computer);
      computer.addComponent(folder);
      [file1, file2, link].forEach(component => folder.addComponent(component));

      var files = select('file', computer);
      files.length.should.equal(2);
      file1.should.be.oneOf(files);
      file2.should.be.oneOf(files);
      link.should.not.be.oneOf(files);

      var links = select('#id_link', computer);
      links.length.should.equal(1);
      link.should.be.oneOf(links);

      var whites = select('.white', computer);
      whites.length.should.equal(3);
      computer.should.be.oneOf(whites);
      folder.should.be.oneOf(whites);
      file2.should.be.oneOf(whites);
    });

  });

});

