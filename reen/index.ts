#!/usr/bin/env bun
import Client from "./client";
import startServer, { safeString } from "./server";
const REEN_SERVER = process.env.REEN_SERVER;
const argv = process.argv.slice(2);
function purefilename(str: string) {
    return str.replace(/\.*\//g, "");
}
switch (argv[0]) {
    case "serve": {
        const PORT = parseInt(process.env.PORT || "3106") || 3106;
        const uploadFolder = argv[1];
        startServer(PORT, uploadFolder);
        break;
    }
    case "cjxl": {
        if (!REEN_SERVER) { throw new Error('No server specified!') };
        const client = new Client(REEN_SERVER);
        const fileu = argv[1];
        const fileout = argv[2];
        const eargs = argv.slice(3);
        console.log('uploading...');
        const resp = await client.upload(purefilename(fileu), Bun.file(fileu));
        console.log("status " + resp.status);
        const output = await client.encode(purefilename(fileu), eargs.join(' '));
        console.log("remote: " + output.output);
        console.log('saving as ' + fileout);
        const download = await client.download(purefilename(fileu)+".jxl");
        if (download.status !== 200) {
            console.error('wrong status code! ' + download.status);
            console.error(download.text());
            break;
        }
        await Bun.write(fileout, download);
        console.log('deleting original on remote...');
        if (await client.delete(purefilename(fileu))) {
            console.log('done')
        } else {
            console.log('delete failed');
        }
        console.log('deleting jxl on remote...')
        if (await client.delete(purefilename(fileu)+".jxl")) {
            console.log('done')
        } else {
            console.log('delete failed');
        }
        client.close();
        break;
    }
}