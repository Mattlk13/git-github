import test from 'ava';
import stubPromise from 'sinon-stub-promise';
import sinon from 'sinon';
import GitHub from 'github';
import tag from './tag';

stubPromise(sinon);

test.beforeEach(t => {
	const client = new GitHub();

	client.gitdata.getTags = sinon.stub(client.gitdata, 'getTags')
		.returnsPromise().resolves([
			{ref: 'refs/tags/v0.1.0'},
			{ref: 'refs/tags/v0.2.0'}
		]);
	client.gitdata.createReference = sinon.stub(client.gitdata, 'createReference')
		.returnsPromise().resolves({});

	client.gitdata.deleteReference = sinon.stub(client.gitdata, 'deleteReference')
		.returnsPromise().resolves({});

	t.context.client = client;
});

test.afterEach(t => {
	t.context.client.gitdata.getTags.restore();
	t.context.client.gitdata.createReference.restore();
	t.context.client.gitdata.deleteReference.restore();
});

test('listing tags', async t => {
	const context = {
		client: t.context.client,
		state: {owner: 'nerdlabs', repo: 'git-github'}
	};

	const actual = await tag(context);
	const expected = [
		{ref: 'refs/tags/v0.1.0'},
		{ref: 'refs/tags/v0.2.0'}
	];

	t.deepEqual(actual, expected, 'should find all the tags');
});

test('creating a tag', async t => {
	const client = t.context.client;
	const context = {
		client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: Promise.resolve({ref: 'heads/master', commit: 'abcd1234'})
		}
	};

	await tag(context, 'newTag');

	t.is(client.gitdata.createReference.callCount, 1, 'should create a reference');

	const {ref, sha} = client.gitdata.createReference.firstCall.args[0];
	t.is(ref, 'tags/newTag', 'should create a ref with correct name');
	t.is(sha, 'abcd1234', 'should set the correct sha hash');
});

test('creating a tag that already exists', async t => {
	const client = t.context.client;
	client.gitdata.createReference.restore();
	client.gitdata.createReference = sinon.stub(client.gitdata, 'createReference')
		.returnsPromise().rejects({});

	const context = {
		client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: Promise.resolve({ref: 'heads/master', commit: 'abcd1234'})
		}
	};

	t.throws(tag(context, 'newTag'));
});

test('deleting a tag', async t => {
	const client = t.context.client;
	const context = {
		client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: Promise.resolve({ref: 'heads/master', commit: 'abcd1234'})
		}
	};

	await tag(context, 'newTag', 'delete');

	t.is(client.gitdata.deleteReference.callCount, 1, 'should delete a reference');
	const {ref} = client.gitdata.deleteReference.firstCall.args[0];
	t.is(ref, 'tags/newTag', 'should delete the ref for specified tag');
});

test('deleting a tag that does not exist', async t => {
	const client = t.context.client;
	client.gitdata.deleteReference.restore();
	client.gitdata.deleteReference = sinon.stub(client.gitdata, 'deleteReference')
		.returnsPromise().rejects({});
	const context = {
		client,
		state: {
			owner: 'nerdlabs',
			repo: 'git-github',
			HEAD: Promise.resolve({ref: 'heads/master', commit: 'abcd1234'})
		}
	};

	t.throws(tag(context, 'newTag', 'delete'));
});
