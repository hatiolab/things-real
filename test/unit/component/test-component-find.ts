/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import { expect } from 'chai';
import { RootContainer, Component, Container } from '../../../src'

describe('Component', () => {

  describe('findAll', () => {

    it('select에 매칭되는 컴포넌트를 찾을 수 있다.', () => {
      var root = new RootContainer({ type: 'root', id: 'root', class: 'top' });

      var computer = new Container({ type: 'computer', id: 'id_computer', class: 'white' });
      var folder = new Container({ type: 'folder', id: 'id_folder', class: 'white blue' });
      var file1 = new Component({ type: 'file', id: 'id_file1' });
      var file2 = new Component({ type: 'file', id: 'id_file2', class: 'white' });
      var link = new Component({ type: 'link', id: 'id_link', class: 'blue' });

      root.addComponent(computer);
      computer.addComponent(folder);
      folder.addComponent(file1);
      folder.addComponent(file2);
      folder.addComponent(link);

      var files = root.findAll('file', computer);
      files.length.should.equal(2);
      file1.should.be.oneOf(files);
      file2.should.be.oneOf(files);
      link.should.not.be.oneOf(files);

      var links = root.findAll('#id_link');
      links.length.should.equal(1);
    });

  });

});

