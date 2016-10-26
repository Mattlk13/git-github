// @flow
import type {Context, BranchCommand, BranchDescriptor} from './index';

const commands: Set<BranchCommand|string> = new Set(['list', 'create', 'delete', 'move']);

export default async function branch(
	context: Context,
	name?: string,
	newName?: string,
	command?: BranchCommand = 'list'
): Promise<?Array<BranchDescriptor>> {
	const {client, state: {owner, repo}} = context;
	const {default_branch} = await client.repos.get({user: owner, repo}); // eslint-disable-line camelcase

	const args = [name, newName].filter(c => c && !commands.has(c));
	const defaultCommand = ['list', 'create'][args.length] || command;

	const cmd = [name, newName]
		.reduce((cmd, arg) => arg && commands.has(arg) ? arg : cmd, defaultCommand);

	if (cmd === 'list') {
		const branches = await client.repos.getBranches({user: owner, repo});

		return branches.map(({name}) => {
			return {
				name,
				default: name === default_branch // eslint-disable-line camelcase
			};
		});
	}

	if (cmd === 'create' && typeof name === 'string') {
		// TODO: use newName as start-point if set (branch, sha, tag)
		const {sha} = await client.repos.getShaOfCommitRef({
			user: owner,
			repo,
			// TODO: use HEAD
			ref: default_branch // eslint-disable-line camelcase
		});

		await client.gitdata.createReference({
			user: owner,
			repo,
			ref: `heads/${name}`,
			sha
		});
	}

	if (cmd === 'delete' && typeof name === 'string') {
		await client.gitdata.deleteReference({
			user: owner,
			repo,
			ref: `heads/${name}`
		});
	}

	if(cmd === 'move' && typeof name === 'string' && typeof newName === 'string') {
		const {object: {sha}} = await client.gitdata.getReference({
			user: owner,
			repo,
			ref: `heads/${name}`
		});

		await client.gitdata.createReference({
			user: owner,
			repo,
			ref: `heads/${newName}`,
			sha
		});

		await branch(context, name, 'delete');
	}

	return null;
}
