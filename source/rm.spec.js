import test from 'ava';
import rm from './rm';

import type {Context, Path} from './index';

const fileOne = {path: 'path', content: new Buffer('content')};
const fileTwo = {path: 'existingPath', content: new Buffer('existing Buffer')};

test('calling rm with invalid arguments', t => {
	const context: Context = {state: {index: {files: [fileTwo]}}};

	t.throws(() => rm(context, null), Error, 'should throw an Error');
	t.deepEqual(context.state.index.files, [fileTwo], 'should keep the index');
});

test('calling rm with files that are not staged', t => {
	const context: Context = {state: {index: {files: [fileTwo]}}};

	rm(context, ['unrelatedPath']);

	t.deepEqual(context.state.index.files, [fileTwo], 'should keep the index');
});

test('removing a file from the index', t => {
	const context: Context = {state: {index: {files: [fileOne, fileTwo]}}};

	rm(context, ['path']);

	t.deepEqual(context.state.index.files, [fileTwo], 'should remove one file');
});
