import test from 'ava';
import sinon from 'sinon';
import stubPromise from 'sinon-stub-promise';
import GitHub from 'github';
import checkout from './checkout';

stubPromise(sinon);

test.beforeEach(t => {
	const client = new GitHub();

	client.gitdata.getReference = sinon
		.stub(client.gitdata, 'getReference')
		.returnsPromise()
		.resolves({object: {sha: 'abcd1234'}});
	client.gitdata.getCommit = sinon
		.stub(client.gitdata, 'getCommit')
		.returnsPromise()
		.resolves({sha: 'aceg1357'});

		t.context.client = client;
});

test.afterEach(t => {
	t.context.client.gitdata.getReference.restore();
	t.context.client.gitdata.getCommit.restore();
});

test('checking out an existing branch', async t => {
	const context = {
		client: t.context.client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: null
		}
	};

	await checkout(context, 'master');

	const head = await context.state.HEAD;
	t.deepEqual(head, {ref: 'heads/master', sha: 'abcd1234'});
});

test('checking out a non-existing branch', async t => {
	t.context.client.gitdata.getReference.returns(Promise.reject({error: 'foo'}));
	t.context.client.gitdata.getCommit.returns(Promise.reject({error: 'foo'}));
	const context = {
		client: t.context.client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: Promise.resolve({ref: 'heads/master', sha: 'abcd1234'})
		}
	};

	t.throws(checkout(context, 'unknown'));

	const head = await context.state.HEAD;
	t.deepEqual(head, {ref: 'heads/master', sha: 'abcd1234'},
		'should not modify current HEAD');
});

test('checking out an existing tag', async t => {
	t.context.client.gitdata.getReference.restore();
	t.context.client.gitdata.getReference = sinon
		.stub(t.context.client.gitdata, 'getReference');
	t.context.client.gitdata.getReference
		.onCall(0).returns(Promise.reject({error: 'foo'}));
	t.context.client.gitdata.getReference
		.onCall(1).returns(Promise.resolve({object: {sha: 'defg1234'}}));

	const context = {
		client: t.context.client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: null
		}
	};

	await checkout(context, 'v0.0.1');

	const {ref, sha} = await context.state.HEAD;
	const expectedRef = 'tags/v0.0.1';
	const expectedSha = 'defg1234';

	t.is(ref, expectedRef);
	t.is(sha, expectedSha);
});

test('checking out a specific commit id', async t => {
	t.context.client.gitdata.getReference.restore();
	t.context.client.gitdata.getReference = sinon
		.stub(t.context.client.gitdata, 'getReference');
	t.context.client.gitdata.getReference
		.onCall(0).returns(Promise.reject({error: 'foo'}));
	t.context.client.gitdata.getReference
		.onCall(1).returns(Promise.resolve({error: 'bar'}));

	const context = {
		client: t.context.client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: null
		}
	};

	await checkout(context, 'aceg1357');

	const {ref, sha} = await context.state.HEAD;
	const expectedRef = null;
	const expectedSha = 'aceg1357';

	t.is(ref, expectedRef);
	t.is(sha, expectedSha);
});
