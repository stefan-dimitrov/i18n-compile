'use strict';

var fse = require('fs-extra');
var chai = require('chai');
var expect = chai.expect;
var i18n_compile = require('../');

describe('i18n-compile', function () {
  before(function () {
    fse.removeSync('tmp');
  });

  var compiled_en = 'file_per_lang/translations_en.json';
  var compiled_pt = 'file_per_lang/translations_pt.json';
  var compiled_es = 'file_per_lang/translations_es.json';

  it('compile with default options', function () {
    i18n_compile(getFixtures('menu_i18n.yaml', 'country_i18n.yaml'), 'tmp/file_per_lang/translations_.json');

    var actual_en = readActual('file_per_lang/translations_en.json');
    var actual_pt = readActual('file_per_lang/translations_pt.json');
    var actual_es = readActual('file_per_lang/translations_es.json');
    var expected_en = readExpected(compiled_en);
    var expected_pt = readExpected(compiled_pt);
    var expected_es = readExpected(compiled_es);


    expect(actual_en).to.equal(expected_en);
    expect(actual_pt).to.equal(expected_pt);
    expect(actual_es).to.equal(expected_es);
  });

  it('merge all languages in one file', function () {
    i18n_compile(getFixtures('menu_i18n.yaml', 'country_i18n.yaml'), 'tmp/merge_langs.json',
      {merge: true});

    var actual = readActual('merge_langs.json');
    var expected = readExpected('merge_langs.json');

    expect(actual).to.equal(expected);
  });

  it('get files by glob pattern', function () {
    i18n_compile(getFixtures('menu_*.yaml', 'menu_*.yaml', 'country_*.yaml'), 'tmp/from_glob.json', {merge: true});

    var actual = readActual('from_glob.json');
    var expected = readExpected('merge_langs.json');

    expect(actual).to.equal(expected);
  });

  it('place language id at pattern', function () {
    i18n_compile(getFixtures('menu_i18n.yaml', 'country_i18n.yaml'),
      'tmp/filename_lang_placing/i18n-[lang]-file.json',
      {langPlace: '[lang]'}
    );

    var actual_en = readActual('filename_lang_placing/i18n-en-file.json');
    var actual_pt = readActual('filename_lang_placing/i18n-pt-file.json');
    var actual_es = readActual('filename_lang_placing/i18n-es-file.json');
    var expected_en = readExpected(compiled_en);
    var expected_pt = readExpected(compiled_pt);
    var expected_es = readExpected(compiled_es);

    expect(actual_en).to.equal(expected_en);
    expect(actual_pt).to.equal(expected_pt);
    expect(actual_es).to.equal(expected_es);
  });

  it('place language id missing pattern', function () {
    i18n_compile(getFixtures('menu_i18n.yaml', 'country_i18n.yaml'),
      'tmp/filename_lang_placing/missing/i18n-file_.json',
      {langPlace: '[lang]'}
    );

    var actual_en = readActual('filename_lang_placing/missing/i18n-file_en.json');
    var actual_pt = readActual('filename_lang_placing/missing/i18n-file_pt.json');
    var actual_es = readActual('filename_lang_placing/missing/i18n-file_es.json');
    var expected_en = readExpected(compiled_en);
    var expected_pt = readExpected(compiled_pt);
    var expected_es = readExpected(compiled_es);

    expect(actual_en).to.equal(expected_en);
    expect(actual_pt).to.equal(expected_pt);
    expect(actual_es).to.equal(expected_es);
  });

  it('place language id at multiple places', function () {
    i18n_compile(getFixtures('menu_i18n.yaml', 'country_i18n.yaml'),
      'tmp/filename_lang_placing/{lang}/i18n_{lang}_file.json',
      {langPlace: '{lang}'}
    );

    var actual_en = readActual('filename_lang_placing/en/i18n_en_file.json');
    var actual_pt = readActual('filename_lang_placing/pt/i18n_pt_file.json');
    var actual_es = readActual('filename_lang_placing/es/i18n_es_file.json');
    var expected_en = readExpected(compiled_en);
    var expected_pt = readExpected(compiled_pt);
    var expected_es = readExpected(compiled_es);

    expect(actual_en).to.equal(expected_en);
    expect(actual_pt).to.equal(expected_pt);
    expect(actual_es).to.equal(expected_es);
  });

  it('list values', function () {
    i18n_compile(getFixtures('templates_i18n.yaml'), 'tmp/lists_merged.json',
      {merge: true}
    );

    var actual = readActual('lists_merged.json');
    var expected = readExpected('templates_merged.json');

    expect(actual).to.equal(expected);
  });

  it('sibling values and children', function (done) {
    try {
      i18n_compile(getFixtures('sibling_values_and_children_i18n.yaml'),
        'tmp/sibling_values_and_children.json',
        {merge: true}
      );
      done('should throw error');
    } catch (e) {
      expect(e).to.match(/Error: Bad hierarchy format in "test\/fixtures\/sibling_values_and_children_i18n[.]yaml"/i);
    }
    done();
  });

  it('bad indentation', function (done) {
    try {
      i18n_compile(getFixtures('bad_indentation_i18n.yaml'),
        'tmp/bad_indentation.json',
        {merge: true}
      );
      done('should throw error');
    } catch (e) {
      expect(e.toString()).to.match(/YAMLException: bad indentation[\w\s]+?in "test\/fixtures\/bad_indentation_i18n[.]yaml/i);
    }
    done();
  });


  function getFixtures(fileNames) {
    var argsArray = Array.prototype.slice.apply(arguments);
    return argsArray.map(function (each) {
      return 'test/fixtures/' + each;
    });
  }

  function readExpected(filePath) {
    return fse.readFileSync('test/expected/' + filePath, 'utf8');
  }

  function readActual(filePath) {
    return fse.readFileSync('tmp/' + filePath, 'utf8');
  }

});
