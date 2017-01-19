#!/usr/bin/env node

var i18n_compile = require('..');
var program = require('commander');

program.arguments('<files...>')
  .option('-o, --out <dest>', 'Output file path. May contain language placement token (--lang-place)')
  .option('-m, --merge', 'Whether to merge all languages into a single file')
  .option('-l, --lang-place [token]', 'Placeholder for the language name in the output file path. Only applicable if the --merge option is not used')
  .action(function (files) {

    if (program.out) {
      i18n_compile(files, program.out, {merge: program.merge, langPlace: program.langPlace});

    } else {
      program.help(function (txt) {
        return 'Missing output file path.' + txt;
      });
    }

  }).parse(process.argv);
