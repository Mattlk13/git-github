import test from 'ava';
import stubPromise from 'sinon-stub-promise';
import sinon from 'sinon';
import GitHub from 'github';
import branch from './branch';

stubPromise(sinon);

test.beforeEach(t => {
	const client = new GitHub();

	client.repos.getBranches = sinon
		.stub(client.repos, 'getBranches')
		.returnsPromise()
		.resolves([
			{name: 'master', commit: {sha: 'abcd1234'}},
			{name: 'feature/git-github', commit: {sha: 'efgh5678'}}
		]);

	client.repos.get = sinon
		.stub(client.repos, 'get')
		.returnsPromise()
		.resolves({default_branch: 'master'}); // eslint-disable-line camelcase

	client.repos.getShaOfCommitRef = sinon
		.stub(client.repos, 'getShaOfCommitRef')
		.returnsPromise()
		.resolves({sha: 'abcd1234'});

	client.gitdata.getReference = sinon
		.stub(client.gitdata, 'getReference')
		.returnsPromise()
		.resolves({object: {sha: 'efgh5678'}});

	client.gitdata.createReference = sinon
		.stub(client.gitdata, 'createReference')
		.returnsPromise()
		.resolves({});

	client.gitdata.deleteReference = sinon
		.stub(client.gitdata, 'deleteReference')
		.returnsPromise()
		.resolves({});

	t.context.client = client;
});

test.afterEach(t => {
	t.context.client.repos.get.restore();
	t.context.client.repos.getBranches.restore();
	t.context.client.repos.getShaOfCommitRef.restore();
	t.context.client.gitdata.getReference.restore();
	t.context.client.gitdata.createReference.restore();
	t.context.client.gitdata.deleteReference.restore();
});

test('listing branches', async t => {
	const context = {
		client: t.context.client,
		state: {owner: 'nerdlabs', repo: 'git-github'}
	};

	const actual = await branch(context);

	{
		const actualNames = actual.map(a => a.name);
		const expectedNames = ['master', 'feature/git-github'];
		t.deepEqual(actualNames, expectedNames, 'should list all branches');
	}
	{
		const expected = [
			{name: 'master', default: true},
			{name: 'feature/git-github', default: false}
		];
		t.deepEqual(actual, expected, 'should find the default branch');
	}
});

test('creating a branch', async t => {
	const client = t.context.client;
	const context = {
		client,
		state: {owner: 'nerdlabs', repo: 'git-github', HEAD: 'master'}
	};

	await branch(context, 'my_new_branch');

	{
		const actual = client.gitdata.createReference.firstCall.args[0].ref;
		const expected = 'heads/my_new_branch';

		t.is(actual, expected, 'should create a new branch with the correct ref');
	}
	{
		const actual = client.gitdata.createReference.firstCall.args[0].sha;
		const expected = 'abcd1234';

		t.is(actual, expected, 'should branch off of HEAD');
	}
});

test('deleting a branch', async t => {
	const client = t.context.client;
	const context = {
		client,
		state: {owner: 'nerdlabs', repo: 'git-github', HEAD: 'master'}
	};

	await branch(context, 'my_new_branch', 'delete');
	const actual = client.gitdata.deleteReference.firstCall.args[0].ref;
	const expected = 'heads/my_new_branch';

	t.is(actual, expected, 'should delete the specified branch');
});

test('renaming a branch', async t => {
	const client = t.context.client;
	const context = {
		client,
		state: {owner: 'nerdlabs', repo: 'git-github', HEAD: 'master'}
	};

	await branch(context, 'feature/git-github', 'git-github', 'move');

	{
		const actual = client.gitdata.createReference.firstCall.args[0].ref;
		const expected = 'heads/git-github';

		t.is(actual, expected, 'should create a new branch with the provided name');
	}
	{
		const actual = client.gitdata.createReference.firstCall.args[0].sha;
		const expected = 'efgh5678';

		t.is(actual, expected, 'should branch off of the old branch\s sha');
	}
	{
		const actual = client.gitdata.deleteReference.firstCall.args[0].ref;
		const expected = 'heads/feature/git-github';

		t.is(actual, expected, 'should delete the old branch');
	}
});
