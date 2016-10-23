'use strict';

var fse = require('fs-extra');
var glob = require('glob');
var _ = require('lodash');
var yaml = require('js-yaml');

/**
 * Compile files to json.
 *
 * @param {String[]} files - files to compile
 * @param {String} destination - where to write the compiled results
 * @param {*} [options] - compiling options
 */
module.exports = function (filePatterns, destination, options) {

  options = options || {};
  var matchedFiles = _.map(filePatterns, function (pattern) {
    return glob.sync(pattern);
  });

  var files = _.uniq(_.flatten(matchedFiles));

  var srcList = files.filter(function (filepath) {
    // Warn on and remove invalid source files (if nonull was set).
    try {
      fse.accessSync(filepath);
      return true;
    } catch (e) {
      console.warn('Source file "' + filepath + '" not found.');
      return false;
    }
  }).map(function (filepath) {
    // Read YAML file.
    var content = yaml.safeLoad(fse.readFileSync(filepath, 'utf8'), {
      filename: filepath,
      schema: yaml.JSON_SCHEMA
    });

    return {
      filePath: filepath,
      content: content
    };
  });

  var compiled = compileTranslations(srcList);

  // Handle options.
  if (options.merge) {
    // Write the (single) destination file.
    fse.outputFileSync(destination, JSON.stringify(compiled));

    // Print a success message.
    console.log('File "' + destination + '" created.');

    return;
  }

  // Write the destination files.
  for (var lang in compiled) {
    var fileDest = langFileDest(destination, lang, options.langPlace);
    fse.outputFileSync(fileDest, JSON.stringify(compiled[lang]));

    // Print a success message.
    console.log('File "' + fileDest + '" created.');
  }
};

function compileTranslations(srcList) {
  var compiled = {};

  var result = [];
  for (var i in srcList) {
    var rawScr = srcList[i];

    try {
      var tempResult = recurseObject(rawScr.content);
      result = result.concat(tempResult);
    } catch (e) {
      throw new Error(e.message + ' in "' + rawScr.filePath + '" at ' + e.atProperty);
    }
  }

  // Merge result chains
  for (i = 0; i < result.length; i++) {
    var lang = result[i][0];
    if (!compiled[lang]) {
      compiled[lang] = {};
    }
    _.merge(compiled[lang], result[i][1]);
  }
  return compiled;
}

function recurseObject(subObject) {
  var resultList = [];
  var hasValues = false;
  var hasChildren = false;

  for (var property in subObject) {
    // Get the language key and the translation value
    if (!_.isPlainObject(subObject[property])) {
      hasValues = true;
      checkHierarchy(hasValues, hasChildren, property);
      resultList.push([property, subObject[property]]);
      continue;
    }

    // Go deeper and build the result chain
    hasChildren = true;
    checkHierarchy(hasValues, hasChildren, property);
    var result = recurseObject(subObject[property]);
    for (var i = 0; i < result.length; i++) {
      var tmp = {};
      tmp[property] = result[i][1];
      resultList.push([result[i][0], tmp]);
    }
  }

  return resultList;
}

function checkHierarchy(hasValues, hasChildren, property) {
  if (hasValues && hasChildren) {
    var error = new Error('Bad hierarchy format');
    error.atProperty = property;
    throw error;
  }
}

function langFileDest(destination, lang, langPlace) {
  if (langPlace && destination.indexOf(langPlace) >= 0) {

    var matching = new RegExp(_.escapeRegExp(langPlace), 'g');
    return destination.replace(matching, lang);
  }

  // Default - place language id before last '.'
  var parts = destination.split(/([.][^.\/]+$)/i, 2);

  if (parts.length > 1) {
    return parts[0] + lang + parts[1];
  }

  return parts[0] + lang;
}
