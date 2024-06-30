import { $ } from 'bun'
import { readdir, unlink } from 'node:fs/promises'

const files = await readdir("./images");
const skipRegex = /\.(webp|webm)$/
for (const file of files) {
	if (skipRegex.test(file)) {
		console.log('webpify: skipping ' + file);
		continue;
	}
	console.log(`webpify: ./images/${file}`);
	if (file.endsWith('.gif')) {
		console.log('webpify: note: using gif2webp')
		await $`gif2webp -mt -m 4 ./images/${file} -o ./images/${file}.webp`;
	} else {
		await $`cwebp -preset drawing -mt -lossless ./images/${file} -o ./images/${file}.webp`;
	}
	await unlink("./images/"+file)
}
