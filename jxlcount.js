import { readdir } from 'node:fs/promises'

const files = await readdir("./images");
console.log(`.jxl: ${files.filter(x => x.endsWith('.jxl')).length}`);
console.log(`everything else: ${files.filter(x => !x.endsWith('.jxl') && !x.endsWith('.later')).length}`)
console.log(`.later: ${files.filter(x => x.endsWith('.later')).length}`)
/*for (const file of files) {
	if (skipRegex.test(file)) {
		console.log('webpify: skipping ' + file);
		continue;
	}
	console.log(`webpify: ./images/${file}`);
	if (file.endsWith('.gif')) {
		console.log('webpify: note: using gif2webp')
		await $`gif2webp -mt -m 4 ./images/${file} -o ./images/${file}.webp`;
	} else {
		await $`cwebp -preset drawing -lossless ./images/${file} -o ./images/${file}.webp`;
	}
	await unlink("./images/"+file)
}*/
