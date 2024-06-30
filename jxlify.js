import { $ } from 'bun'
import { readdir, unlink } from 'node:fs/promises'

const files = await readdir("./images");
const skipRegex = /\.(webp|webm|jxl|later)$/;
const altTreatment = /\.(gif)$/;
const canUseREEN = process.env.REEN_SERVER != null;
const forceREEN = false;
for (const file of files) {
	if (skipRegex.test(file)) {
		//console.log('jxlify: skipping ' + file);
		continue;
	}
	console.log(`jxlify: ./images/${file}`);
	if (altTreatment.test(file)) {
		console.log('jxlify: note: using alternate treatment')
		try {
			if (forceREEN) throw '';
			await $`cjxl ./images/${file} ./images/${file}.jxl`;
		} catch(err) {
			console.error('Caught error: ', err);
			if (!canUseREEN) throw err;
			console.log('jxlify: invoking REEN')
			await $`bun ./reen/index.ts cjxl ./images/${file} ./images/${file}.jxl`;
		}
	} else {
		try {
			if (forceREEN) throw '';
			await $`cjxl ./images/${file} ./images/${file}.jxl --distance 2.0`;
		} catch(err) {
			console.error('Caught error: ', err);
			if (!canUseREEN) throw err;
			console.log('jxlify: invoking REEN')
			await $`bun ./reen/index.ts cjxl ./images/${file} ./images/${file}.jxl`
		}
	}
	await unlink("./images/"+file)
}
