# angelscripts-monorepo

angelscripts for monorepo development

## usage

```
$ npm i organic-angel
$ npm i angelscripts-monorepo
$ npx angel help repo
```

## commands

### repo cells -- :cmd

Executes `cmd` on all repo cells found under `dna.cells` namespace.

### repo cell :name -- :cmd

Executes `cmd` on specific repo cell found under `dna.cells` namespace.

### repo cellgroup :name -- :cmd

Executes `cmd` on specific repo group of cells. A group of cells has the same value in `dna.cells.{{{cell-name}}}.group` property || contained in `dna.cells.{{{cell-name}}}.groups` array
