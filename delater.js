import { rename, readdir } from 'node:fs/promises'

const dir = await readdir("./images")
const laterd = dir.filter(x => x.endsWith('.later'))

for (const file of laterd) {
	await rename("./images/"+file, "./images/"+file.replace(/\.later/g, ""));
}
