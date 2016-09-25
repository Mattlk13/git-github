// @flow
import type {Context, BranchCommand} from './index';

const commands: Set<BranchCommand> = new Set(['list', 'create', 'delete', 'move']);

export default async function branch(
	context: Context,
	name?: string,
	newName?: string,
	command?: BranchCommand = 'list'
) {
	const {client, state: {owner, repo}} = context;
	const {default_branch} = await client.repos.get({user: owner, repo}); // eslint-disable-line camelcase

	const args = [name, newName].filter(c => c && !commands.has(c));
	const defaultCommand = ['list', 'create'][args.length] || command;

	const cmd = [name, newName]
		.reduce((cmd, arg) => commands.has(arg) ? arg : cmd, defaultCommand);

	if (cmd === 'list') {
		const branches = await client.repos.getBranches({user: owner, repo});

		return branches.map(({name}) => {
			return {
				name,
				default: name === default_branch // eslint-disable-line camelcase
			};
		});
	}

	if (cmd === 'create') {
		const {sha} = await client.repos.getShaOfCommitRef({
			user: owner,
			repo,
			ref: default_branch // eslint-disable-line camelcase
		});

		await client.gitdata.createReference({
			user: owner,
			repo,
			ref: `heads/${name}`,
			sha
		});
	}
}
