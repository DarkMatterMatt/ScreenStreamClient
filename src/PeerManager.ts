import SimplePeer from "simple-peer";

interface ScreenSharePeerOpts {
    /** Maximum audio bandwidth, in kbps. Recommended value range is 40 - 200. */
    audioBandwidth?: number;

    /** Maximum frame rate, in fps. Recommended values are 15, 30, 60. */
    frameRate?: number;

    /** Maximum frame height, in pixels. Recommended values are 480, 720, 1080, 1440, 2560. */
    height?: number;

    /** Called when the stream is starting */
    onStream: (stream: MediaStream) => void;

    /** Called when the stream is ending */
    onStreamEnd?: () => void;

    /** Maximum audio bandwidth, in kbps. Recommended value range is 1000 - 15000+. */
    videoBandwidth?: number;

    /** WebSocket URL for signalling. */
    wsUrl: string;

    /** WebSocket channel for signalling. */
    wsChannel: string;
}

interface Response {
    message: string;
    route: string;
    status: "success" | "error";
}

interface ResponseChannel extends Response {
    numberOfMembers: number;
    route: "joinChannel" | "leaveChannel" | "getChannel";
}

interface ResponseSignal extends Response {
    data: {
        type: "signal";
        signal: SimplePeer.SignalData;
    }
    route: "peer";
}

interface ResponseText extends Response {
    data: {
        type: "text";
        text: string;
    }
    route: "peer";
}

type ResponseAny = ResponseChannel | ResponseSignal | ResponseText;

export default class PeerManager {
    private audioBandwidth?: number;

    private frameRate?: number;

    private height?: number;

    private onStream: (stream: MediaStream) => void;

    private onStreamEnd?: () => void;

    private peer: null | SimplePeer.Instance = null;

    private queuedStream: null | MediaStream = null;

    private videoBandwidth?: number;

    private ws: WebSocket;

    private wsChannel: string;

    constructor(o: ScreenSharePeerOpts) {
        this.audioBandwidth = o.audioBandwidth;
        this.frameRate = o.frameRate;
        this.height = o.height;
        this.onStream = o.onStream;
        this.onStreamEnd = o.onStreamEnd;
        this.videoBandwidth = o.videoBandwidth;
        this.wsChannel = o.wsChannel;

        this.ws = new WebSocket(o.wsUrl);
        this.initWebSocket();
    }

    private initWebSocket(): void {
        // WebSocket is created in constructor

        this.ws.addEventListener("open", () => {
            this.ws.send(JSON.stringify({
                route: "joinChannel",
                channelId: this.wsChannel,
            }));
        });

        this.ws.addEventListener("message", ev => {
            const data: ResponseAny = JSON.parse(ev.data);

            // error result
            if (data.status === "error") {
                console.error("WebSocket", "Received error", data);
                return;
            }

            // got message from peer
            if (data.route === "peer") {
                // got signal
                if (data.data.type === "signal") {
                    if (this.peer == null) {
                        throw new Error("Cannot signal, peer is null.");
                    }

                    console.log("WebSocket", "Received signal", data);
                    this.peer.signal(data.data.signal);
                    return;
                }

                // got text message
                if (data.data.type === "text") {
                    // peer is initializing, we can start :)
                    if (data.data.text === "initializing") {
                        this.initPeer();
                        return;
                    }
                }

                console.log("WebSocket", "Unhandled message from peer", data);
                return;
            }

            // finished joining a channel
            if (data.route === "joinChannel") {
                console.log("WebSocket", "Joined channel", data);

                // we have a peer waiting for us
                if (data.numberOfMembers > 1) {
                    this.initPeer("initiator");

                    // tell peer that we're initializing
                    this.ws.send(JSON.stringify({
                        route: "message",
                        data: {
                            type: "text",
                            text: "initializing",
                        },
                    }));
                    return;
                }

                console.log("WebSocket", "Waiting for peer");
                return;
            }

            console.log("WebSocket", "Unhandled message", data);
        });

        this.ws.addEventListener("close", ev => {
            console.warn("WebSocket", "Closed unexpectedly", ev.code, ev.reason);
        });
    }

    private initPeer(isInitiator?: "initiator") {
        // create peer
        this.peer = new SimplePeer({
            initiator: isInitiator === "initiator",
            sdpTransform: this.sdpTransform_,
            stream: this.queuedStream ?? undefined,
        });
        this.queuedStream = null;

        this.peer.on("signal", signal => {
            this.ws.send(JSON.stringify({
                route: "message",
                data: {
                    type: "signal",
                    signal,
                },
            }));
        });

        this.peer.on("connect", () => {
            if (this.queuedStream != null) {
                this.peer!.addStream(this.queuedStream);
                this.queuedStream = null;
            }
        });

        this.peer.on("stream", s => this.onStream(s));

        this.peer.on("data", raw => {
            const data = JSON.parse(raw);
            if (data.type === "streamEnding") {
                if (this.onStreamEnd != null) {
                    this.onStreamEnd();
                }
                return;
            }

            console.log("WebRTC", "Unhandled message", data);
        });
    }

    private sdpTransform_(sdp: string) {
        // remove existing b=AS: tags
        sdp = sdp.replace(/b=AS([^\r]+\r\n)/g, "");

        // add audio bandwidth constraint
        if (this.audioBandwidth != null) {
            sdp = sdp.replace(/a=mid:audio\r\n/g, `a=mid:audio\r\nb=AS:${this.audioBandwidth}\r\n`);
        }

        // add video bandwidth constraint
        if (this.videoBandwidth != null) {
            sdp = sdp.replace(/a=mid:video\r\n/g, `a=mid:video\r\nb=AS:${this.videoBandwidth}\r\n`);
        }

        return sdp;
    }

    public addStream(stream: MediaStream) {
        if (this.peer == null) {
            this.queuedStream = stream;
            return;
        }

        this.peer.addStream(stream);
    }

    public removeStream(stream: MediaStream) {
        if (this.peer == null) {
            this.queuedStream = null;
            return;
        }

        this.peer.send(JSON.stringify({
            type: "streamEnding",
        }));
        this.peer.removeStream(stream);
    }
}
