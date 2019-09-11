# angelscripts-monorepo-cells

angelscripts for monorepo development of cells

## usage

```
$ npm i organic-angel
$ npm i angelscripts-monorepo-cells
$ npx angel help cell
```

## commands

### cells -- :cmd

Executes `cmd` on all repo cells found under `dna.cells` namespace.

### cell :name -- :cmd

Executes `cmd` on specific repo cell found under `dna.cells` namespace.

### cells :name -- :cmd

Executes `cmd` on specific repo group of cells. A group of cells has the same value in `dna.cells.{{{cell-name}}}.group` property || contained in `dna.cells.{{{cell-name}}}.groups` array

### cells

Lists all found cells under repo

### cells.json

Returns JSON list of found cells
