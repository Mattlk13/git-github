// @flow
import type {Context, BranchCommands} from './index';

const COMMANDS: { [key: BranchCommands]: BranchCommands } = {
	LIST: 'LIST',
	CREATE: 'CREATE',
	DELETE: 'DELETE',
	MOVE: 'MOVE'
};

export default async function branch(
	context: Context,
	name?: string,
	newName?: string,
	command?: BranchCommands = 'LIST'
) {
	const {client, state: {owner, repo}} = context;

	const {default_branch} = await client.repos.get({user: owner, repo});
	const branches = await client.repos.getBranches({user: owner, repo});

	return branches.map(({name}) => {
		return {
			name,
			default: name === default_branch
		};
	});
}
