// @flow
import type {Context, Path} from './index';

export default function rm(context: Context, files: Array<Path>): void {
	if (!Array.isArray(files)) {
		throw new Error('Parameter files must be an array.');
	}

	context.state.index.files = context.state.index.files.filter(file => {
		return !files.includes(file.path);
	});
}
