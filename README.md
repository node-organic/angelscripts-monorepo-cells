# angelscripts-monorepo-cells

angelscripts for monorepo development of cells based on [organic-stem-skeleton 3.0](https://github.com/node-organic/organic-stem-skeleton)

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

### create cell

Enters in intercative mode asking for cell to be created with cellName, cellGroup and cellKind properties.

#### create cell :name

Scaffold a monorepo cell or converts existing folder to a cell.

### rename cell

Enters in intercative mode asking for cell name to be renamed.

#### rename cell :oldName :newName

Renames existing cell from oldName to newName. This moves the cell's source code as well.

### delete cell

Enters in intercative mode asking for cell name to be deleted.

#### delete cell :cellName :cellNameAgain

Removes existing cell. This removes the cell's source code as well.