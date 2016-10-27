// @flow
import type {Context, File} from './index';

export default function add(context: Context, files: Array<File>): void {
	if (!Array.isArray(files)) {
		throw new Error('Parameter files must be an array.');
	}
	context.state.index.files = files;
}
