// @flow
import assert from 'assert';
import GitHub from 'github';

import add from './add';
// import branch from './branch';
// import checkout from './checkout';
// import commit from './commit';
// import mv from './mv';
// import rebase from './rebase';
// import revert from './revert';
// import rm from './rm';
// import tag from './tag';

import type {
	GitHubOptions,
	BranchCommands,
	Ref,
	Path,
	Branch,
	Commit,
	Tag,
	TagCommands
} from './index';

function getHead(branches: ?Array<{ name: string, default: boolean }>) {
	const defaultBranch = branches ? branches.find(b => b.default) : null;
	return defaultBranch ? defaultBranch.name : 'DETACHED';
}

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

		const state = {
			owner: options.owner,
			repo: options.repo,
			// HEAD: this.branch().then(getHead).catch(() => 'DETACHED'),
			HEAD: 'DETACHED',
			index: {
				files: [],
			},
		};

		context.set(this, {client, state});
	}

	/** Add file contents to the index. */
	async add(files: Array<File>) {
		return add(context.get(this), files);
	}

	// /** Create, list or delete branches. */
	// async branch(
	// 	name?: string,
	// 	newName?: string,
	// 	command?: BranchCommands = 'LIST'
	// ): Promise<Array<{ name: string, default: boolean }>|void> {
	// 	return branch(context.get(this), name, newName, command);
	// }
	//
	// /** Switch branches or checkout a specific tag or commit. */
	// async checkout(ref: Ref) {
	// 	return checkout(context.get(this), ref);
	// }
	//
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
	// /** Remove files from the index */
	// async rm(files: Array<Path>) {
	// 	return rm(context.get(this), files);
	// }
	//
	// /** Create, list or delete tags. */
	// async tag(name?: Tag, command: TagCommands = 'LIST') {
	// 	return tag(context.get(this), name, command);
	// }
}
