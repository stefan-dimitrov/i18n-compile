# i18n-compile [![Build Status](https://travis-ci.org/stefan-dimitrov/i18n-compile.svg?branch=master)](https://travis-ci.org/stefan-dimitrov/i18n-compile)

NodeJS module for assembling JSON translation files from language-merged YAML input files.

Output files are compatible with [angular-translate](https://angular-translate.github.io/) and [i18next](http://i18next.com/)

## Getting Started

Installation:
```shell
npm install i18n-compile --save-dev
```

Usage as a node module:
```js
var i18n_compile = require('i18n-compile');

i18n_compile(['src/file-1.yaml', 'src/**/*_i18n.yaml'], 'destination/path/translation_[lang].json', {langPlace: '[lang]'});
```

## The translation format

The format is inspired by [grunt-translate-compile](https://www.npmjs.com/package/grunt-translate-compile).

It is intended to greatly reduce the amount of typing needed to translate your app.

The YAML file format is used because it requires less typing compared to JSON - no need to enclose both properties and values in `" "`s,
and nesting is done by indentation instead of blocks of curly braces.

The structure of the translations inside the file is like the following:
```yaml
MENU:
  CART:
    EMPTY:
      en: Empty Cart
      pt: Esvaziar Carrinho
      es: Vaciar Carrito
    CHECKOUT:
      en: Checkout
      pt: Fechar Pedido
      es: Realizar Pedido
  USER:
    LABEL:
      en: User
      pt: Usuário
      es: Usuario
    DROPDOWN:
      EDIT:
        en: Edit
        pt: Editar
        es: Editar
      LOGOUT:
        en: Logout
        pt: Sair
        es: Finalizar la Sesión
```

Notice how the translation values are assigned directly to the language keys.
This way translations for all languages can be described in a single file, which eliminates the need to copy
the translation ids over to other files for each language that you have.

That structure reduces the size of your sources and makes your translations more manageable.

Compiling the above example will result in the following output files:
- *translation_en.json*
  ```json
  {
    "MENU": {
      "CART": {
        "EMPTY": "Empty Cart",
        "CHECKOUT": "Checkout"
      },
      "USER": {
        "LABEL": "User",
        "DROPDOWN": {
          "EDIT": "Edit",
          "LOGOUT": "Logout"
        }
      }
    }
  }

  ```

- *translation_pt.json*
  ```json
  {
    "MENU": {
      "CART": {
        "EMPTY": "Esvaziar Carrinho",
        "CHECKOUT": "Fechar Pedido"
      },
      "USER": {
        "LABEL": "Usuário",
        "DROPDOWN": {
          "EDIT": "Editar",
          "LOGOUT": "Sair"
        }
      }
    }
  }

  ```

- *translation_es.json*
  ```json
  {
    "MENU": {
      "CART": {
        "EMPTY": "Vaciar Carrito",
        "CHECKOUT": "Realizar Pedido"
      },
      "USER": {
        "LABEL": "Usuario",
        "DROPDOWN": {
          "EDIT": "Editar",
          "LOGOUT": "Finalizar la Sesión"
        }
      }
    }
  }

  ```

## Using the module

### Arguments

```
var i18n_compile = require('i18n-compile');

i18n_compile(<file-patterns>, <destination>, [<options>]);
```

- #### File patterns
  Type: `Array` of `String`s
  
  A list of file names or [glob](https://github.com/isaacs/node-glob#glob-primer) patterns. 
  Those are the input files to be compiled.

- #### Destination
  Type: `String`
  
  Destination path for the compile output.

- #### Options
  Type: `Object`

  #### options.langPlace
  Type: `String`
  Default value: `''` *(empty string)*
  
  If specified, and if present in the destination path, the value will be replaced with the language id.
  For example:
  ```
  i18n_compile(..., 'output/path/file-[lang]-i18n.json', {langPlace: '[lang]'});
  
  results in output files(for languages 'en', 'bg', 'pt):
    'output/path/file-en-i18n.json'
    'output/path/file-bg-i18n.json'
    'output/path/file-pt-i18n.json'
  ```
  
  This option only has effect when the `merge` option is `false`.
  
  #### options.merge
  Type: `Boolean`
  Default value: `false`
  
  If `true` the output will be a single file with the translations for all languages merged inside it.

### Usage Examples

#### Default Options
In this example, the compiled translations for each language are written to a separate file

```js
i18n_compile(['src/**/*.yaml'], 'dest/translations-.json');
```
The language id is by default inserted right before the last `.` of the file name. <br>
So if we have the languages `en` and `bg`, the resulting files will be:
```
dest/translations-en.json
dest/translations-bg.json
```

If there is no `.` present then the language id is inserted at the end of the file name:
```js
i18n_compile(['src/**/*.yaml'], 'dest/translations-');
```
```
dest/translations-en
dest/translations-bg
```

#### Placement of language id
In this example, the language id is placed at a custom location in the output file path

```js
i18n_compile(['src/**/*.yaml'], 'dest/path/<lang>-translations.json', {langPlace: '<lang>'});
```

So if we have the languages `en` and `bg`, the resulting files will be
```
dest/path/en-translations.json
dest/path/bg-translations.json
```

#### Merge translations in one file
With `merge` set to `true` the compiled translations for all languages are merged into a single file

```js
i18n_compile(['src/**/*.yaml'], 'dest/translations.json', {merge: true});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality.
