// @flow
import type {Context, Ref} from './index';

export default async function checkout(context: Context, ref: Ref): Promise<void> {
	const {client, state} = context;
	const {owner, repo} = state;

	try {
		const {object: {sha: branchSha}} = await client.gitdata.getReference({
			owner,
			repo,
			ref: `heads/${ref}`
		});

		state.HEAD = Promise.resolve({ref: `heads/${ref}`, sha: branchSha});
		return;
	} catch (error) {
		// noop
	}

	try {
		const {object: {sha: tagSha}} = await client.gitdata.getReference({
			owner,
			repo,
			ref: `tags/${ref}`
		});

		state.HEAD = Promise.resolve({ref: `tags/${ref}`, sha: tagSha});
		return;
	} catch (error) {
		// noop
	}

	try {
		const {sha: commitSha} = await client.gitdata.getCommit({
			owner,
			repo,
			sha: ref
		});

		state.HEAD = Promise.resolve({ref: null, sha: ref});
		return;
	} catch (error) {
		// noop
	}

	throw new Error(`Pathspec '${ref}' did not match anything known to git.`);
}
