import { JSONRPCServer, type TypedJSONRPCServer } from 'json-rpc-2.0'
import { unlink } from 'node:fs/promises'
import path from 'node:path/posix';
import { $ } from 'bun';
export function safeString(str: string) { //this is broken
    return path.join("./",str)
        .replace(/\\/g, "/")
        .replace(/\.\.|^\/|^[a-zA-Z]:/g, "")
        .replace(/^\//g, "")
        .replace(/\//g, "");
}
export interface EncodeOutput {
    output: string;
    filename: string;
}
export type Methods = {
    delete(params: { filename: string }): boolean;
    encode(params: { args: string, filename: string }): EncodeOutput;
}
//console.log(safeString("../../a"))
// Client will keep track of state
export default function startServer(port: number, uploadFolder = "/tmp/") {
    const rpcServer: TypedJSONRPCServer<Methods> = new JSONRPCServer();
    setupRPCServer(rpcServer, uploadFolder);
    Bun.serve({
        async fetch(req, server) {
          const url = new URL(req.url);
          if (url.pathname === "/upload" && req.method == "POST") {
            const formdata = await req.formData();
            const filename = formdata.get("filename");
            const data = formdata.get("data");
            if (!filename) throw new Error('No filename');
            if (!data) throw new Error('No data');
            if (typeof filename !== "string") throw new Error('filename: wrong type');

            await Bun.write(path.join(uploadFolder, safeString(filename as string)), data);
            return new Response("ok");
          }

          if (url.pathname.startsWith("/file/")) {
            const filename = safeString(url.pathname.slice(6));
            return new Response(Bun.file(path.join(uploadFolder, filename)), {
                headers: {
                    "Content-Type": "application/octet-stream"
                }
            });

          }
          
          // upgrade the request to a WebSocket
          if (server.upgrade(req)) {
            return; // do not return a Response
          }
          return new Response("Upgrade failed", { status: 500 });
        },
        websocket: {
            message(ws, message) {
                if (Buffer.isBuffer(message)) {ws.send("nuh uh"); return};
                rpcServer.receiveJSON(message).then(response => {
                    if (response) {
                        return ws.send(JSON.stringify(response));
                    }
                    ws.send("ok");
                })
            },
        }, // handlers
        port
    });
}

export function setupRPCServer(server: TypedJSONRPCServer<Methods>, uploadFolder: string) {
    server.addMethod("delete", ({ filename }) => {
        return unlink(path.join(uploadFolder, safeString(filename)))
            .then(x => true)
            .catch(x => false);
    })
    server.addMethod("encode", async ({ args, filename }) => {
        const outFilename = "./"+path.join(uploadFolder, filename+".jxl");
        //console.log(path.join(uploadFolder, filename), outFilename, args)
        const output = await $`cjxl ${"./"+path.join(uploadFolder, filename)} ${outFilename} ${{raw: args}}`.quiet();

        return { output: output.stderr.toString('utf-8'), filename: outFilename };
    })
}