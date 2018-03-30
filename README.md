# angelscripts-monorepo

angelscripts for monorepo development

## usage

```
$ npm i angelscripts-help --save-dev
$ npm i angelscripts-monorepo --save-dev
$ npx organic-angel help
```

## supported commands

### repo cells -- :cmd

Executes `cmd` on all repo cells found under `dna.cells` namespace.

### repo cell :name -- :cmd

Executes `cmd` on specific repo cell

### repo cellgroup :name -- :cmd

Executes `cmd` on specific repo group of cells. A group of cells has the same value in `dna.cells.{{{cell-name}}}.group` property
