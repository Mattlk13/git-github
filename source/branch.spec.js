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

	t.context.client = client;
});

test.afterEach(t => {
	t.context.client.repos.get.restore();
	t.context.client.repos.getBranches.restore();
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
});
