# git-github

Git CLI-like semantics on the github API

## Installation

Grab it from npm

```shell
npm install git-github
```

## Usage

```js
const Git = require('git-github');
const git = new Git();
git.branch().then(branches => console.log(branches));
```

## API

```javascript
type Commit = string; // sha
type Tag = string; // name of a tag
type Branch = string; // name of a branch
type Ref = Commit|Tag|Branch|'HEAD'; // anything that can be checked-out
type Path = string;
type File = {
  path: Path;
  content: Buffer;
};
```
- `git.add(Array<File>)`
  - Add file contents to the index.
- `git.branch()`
  - list all branches.
- `git.branch(name: string, [command: 'create'|'delete' = 'create'])`
  - create or delete a branch.
  - when creating a branch it starts from current `index`.
- `git.branch(name: Branch, newName: string, command: 'move')`
  - rename a branch.
- `git.checkout(ref: Ref)`
  - Switch branches (sets `index` to `ref`).
- `git.commit(message: string)`
  - Record changes to the repository.
- `git.mv(source: Path, destination: Path)`
  - Move or rename a file, a directory, or a symlink.
  - TODO: add `force` option to overwrite destination?
- `git.rebase(upstream: Branch, [branch: Branch = HEAD])`
  - Reapply commits on top of another base tip.
- `git.revert(Array<Commit>)`
  - Revert some existing commits.
  - TODO: should we include `mainline` parent number to revert merges?
- `git.rm(Array<Path>)`
  - Remove files from the index.
  - TODO: should we allow recursive removal through options?
- `git.tag()`
  - List all tags.
- `git.tag(name: Tag, [command: 'create'|'delete' = 'create'])`
  - Create or delete a tag.

---
Built by (c) nerdlabs. Released under the MIT license.
