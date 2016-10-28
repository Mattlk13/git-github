// @flow
import type {Context, TagCommand, TagDescriptor} from './index';

const commands: Set<TagCommand|string> = new Set(['list', 'create', 'delete']);

export default async function tag(
	context: Context,
	name?: string,
	command?: TagCommand = 'list'
): Promise<?Array<TagDescriptor>> {
	const {client, state: {owner, repo, HEAD}} = context;

	if (typeof name !== 'undefined') {
		if (command === 'delete') {
			const ref = `tags/${name}`;
			return await client.gitdata.deleteReference({owner, repo, ref});
		} else {
			// create tag
			if (!HEAD) {
				throw new Error('HEAD is not set - aborting.')
			}

			const {commit: sha} = await HEAD;
			const ref = `tags/${name}`;
			return await client.gitdata.createReference({owner, repo, ref, sha});
		}
	} else {
		// list tags
		return await client.gitdata.getTags({owner, repo});
	}
}
