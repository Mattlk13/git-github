import test from 'ava';
import add from './add';

import type {Context, File} from './index';

const fileOne = {path: 'path', content: new Buffer('content')};
const fileTwo = {path: 'existingPath', content: new Buffer('existing Buffer')};

test('adding files to the index', t => {
	const context: Context = {state: {index: {files: []}}};
	add(context, [fileOne]);

	t.deepEqual(context.state.index.files, [fileOne],
		'should set index.files to files');
});

test('adding files to an index with existing files', t => {
	const context: Context = {state: {index: {files: [fileTwo]}}};
	add(context, [fileOne]);

	t.deepEqual(context.state.index.files, [fileOne], 'should overwrite index');
});

test('adding an empty array', t => {
	const context: Context = {state: {index: {files: [fileTwo]}}};
	add(context, []);

	t.deepEqual(context.state.index.files, [], 'should clear the index');
});

test('adding an invalid value', t => {
	const context: Context = {state: {index: {files: [fileTwo]}}};

	t.throws(() => add(context, null), Error, 'should throw an Array');
	t.deepEqual(context.state.index.files, [fileTwo], 'should keep the index');
});
