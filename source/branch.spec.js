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
		.resolves([{name: 'master'}, {name: 'feature/git-github'}]);

	client.repos.get = sinon
		.stub(client.repos, 'get')
		.returnsPromise()
		.resolves({default_branch: 'master'}); // eslint-disable-line camelcase

	client.repos.getShaOfCommitRef = sinon
		.stub(client.repos, 'getShaOfCommitRef')
		.returnsPromise()
		.resolves({sha: 'abcd1234'});

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
	t.context.client.gitdata.createReference.restore();
	t.context.client.gitdata.deleteReference.restore();
});

test('calling without parameters', async t => {
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

test('calling with one parameter (branch name)', async t => {
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

test('calling with two parameters (branch name + "delete")', async t => {
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
