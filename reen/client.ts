import { JSONRPCClient, type TypedJSONRPCClient } from 'json-rpc-2.0'
import type { Methods } from './server'

export default class Client {
    private client: TypedJSONRPCClient<Methods>;
    private ws: WebSocket;
    constructor(public server: string) {
        this.ws = new WebSocket(this.server);
        this.client = new JSONRPCClient((jrpcRequest) => {
            this.ws.send(JSON.stringify(jrpcRequest));
        })
        this.ws.addEventListener('message', ev => {
            const data = ev.data;
            const jrpc = JSON.parse(data);
            this.client.receive(jrpc);
        })
    }
    delete(filename: string) {
        return this.client.request("delete", { filename });
    }
    encode(filename: string, args: string) {
        return this.client.request("encode", { filename, args });
    }
    upload(filename: string, file: Blob) {
        const fd = new FormData();
        fd.set('filename', filename);
        fd.set('data', file);
        return fetch(`${this.server}/upload`, {
            method: 'POST',
            body: fd
        })
    }
    download(filename: string) {
        return fetch(`${this.server}/file/${filename}`)
    }
    close() {
        this.ws.close();

    }
}