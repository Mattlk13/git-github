// @flow
import assert from 'assert';
import GitHub from 'github';

import add from './add';
import branch from './branch';
import checkout from './checkout';
// import commit from './commit';
// import mv from './mv';
// import rebase from './rebase';
// import revert from './revert';
import rm from './rm';
import tag from './tag';

/** sha of a commit */
export type Commit = string;
/** name of a tag */
export type Tag = string;
/** name of a branch */
export type Branch = string;
/** anything that can be checked-out (commit, tag, branch) */
export type Ref = Commit|Tag|Branch;
/** path to a file */
export type Path = string;
/** an object describing a file */
export type File = {
  path: Path;
  content: Buffer;
	permissions: string;
};
/** all commands that `git.branch` accepts */
export type BranchCommand = 'list'|'create'|'delete'|'move';
/** all commands that `git.tag` accepts */
export type TagCommand = 'list'|'create'|'delete';

export type GitHubAuth =
		{ type: 'basic', username: string, password: string }
	| { type: 'oauth', key: string, secret: string }
	| { type: 'oauth', token: string };

export type GitHubOptions = {
	owner: string;
	repo: string;
	auth?: GitHubAuth;
	client?: GitHub;
	debug?: boolean;
	protocol?: 'https'|'http'|string;
	host?: string;
	pathPrefix?: string;
	headers?: { [key: string]: string };
	Promise?: typeof Promise;
	followRedirects?: boolean;
	timeout?: number;
};

export type GitIndex = {
	files: Array<File>;
};

export type GitHead = {
	ref?: string;
	commit?: string;
};

export type GitState = {
	owner: string;
	repo: string;
	HEAD: ?Promise<GitHead>;
	index: GitIndex;
};

export type Context = {
	client: GitHub;
	state: GitState;
};

export type BranchDescriptor = {
	name: string;
	default: boolean;
};

export type TagDescriptor = {
  name: string;
};

const context = new WeakMap();

export default class Git {
	constructor(options: GitHubOptions = {owner: '', repo: ''}) {
		assert(options.owner !== '', '`options.owner` is required.');
		assert(options.repo !== '', '`options.repo` is required.');

		const {auth, ...githubOptions} = options;

		const client = options.client || new GitHub(githubOptions);
		if (auth) {
			client.auth(auth);
		}

		const state: GitState = {
			owner: options.owner,
			repo: options.repo,
			HEAD: null,
			index: {
				files: [],
			},
		};

		context.set(this, {client, state});

		this.branch().then(branches => {
      if (branches) {
        const branch = branches.find(branch => branch.default);
        if (branch) {
          this.checkout(branch.name);
        }
      }
    });
	}

	getContext() {
		return context.get(this);
	}

	/** Add file contents to the index. */
	async add(files: Array<File>): Promise<void> {
		return add(context.get(this), files);
	}

	/** Create, list or delete branches. */
	async branch(
		name?: string,
		newName?: string,
		command?: BranchCommand = 'list'
	): Promise<?Array<BranchDescriptor>> {
		return branch(context.get(this), name, newName, command);
	}

	/** Switch branches or checkout a specific tag or commit. */
	async checkout(ref: Ref): Promise<void> {
		return checkout(context.get(this), ref);
	}

	// /** Record changes to the repository. */
	// async commit(message: string) {
	// 	return commit(context.get(this), message);
	// }
	//
	// /** Move or rename a file, a directory or a symlink. */
	// async mv(source: Path, destination: Path) {
	// 	return mv(context.get(this), source, destination);
	// }
	//
	// /** Reapply commits on top of another base tip. */
	// async rebase(upstream: Branch, branch: Branch = 'HEAD') {
	// 	return rebase(context.get(this), upstream, branch);
	// }
	//
	// /** Revert some existing commits. */
	// async revert(commits: Array<Commit>) {
	// 	return revert(context.get(this), commits);
	// }
	//
	/** Remove files from the index */
	async rm(files: Array<Path>): Promise<void> {
		return rm(context.get(this), files);
	}

	/** Create, list or delete tags. */
  async tag(
    name?: Tag,
    command: TagCommand = 'list'
  ): Promise<?Array<TagDescriptor>> {
		return tag(context.get(this), name, command);
	}
}
