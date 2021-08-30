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

    /** Maximum audio bandwidth, in kbps. Recommended value range is 1000 - 5000+. */
    videoBandwidth?: number;

    /** WebSocket URL for signalling. */
    wsUrl: string;

    /** WebSocket channel for signalling. */
    wsChannel: string;
}

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

    /**
     * Initialize websocket connection via server, add event handlers.
     */
    private initWebSocket(): void {
        // WebSocket is created in constructor

        let interval: undefined | ReturnType<typeof setInterval>;

        // on connect, join channel, start heartbeats
        this.ws.addEventListener("open", () => {
            this.ws.send(JSON.stringify({
                route: "joinChannel",
                channelId: this.wsChannel,
            }));

            // send a heartbeat to avoid being disconnected
            interval = setInterval(() => {
                this.ws.send(JSON.stringify({
                    route: "ping",
                }));
            }, 5000);
        });

        // on close, stop heartbeats
        this.ws.addEventListener("close", ev => {
            console.warn("WebSocket", "Closed unexpectedly", ev.code, ev.reason);

            if (interval != null) {
                clearInterval(interval);
            }
        });

        // handle messages from the server (may or may not be from peer)
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

                    console.log("WebSocket", "Received signal", data.data.signal);
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
                console.log("WebSocket", "Joined channel", data.channelId);

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

            // ignore pongs & message send receipts
            if (data.route === "ping" || data.route === "message") {
                return;
            }

            console.log("WebSocket", "Unhandled message", data);
        });
    }

    /**
     * Initialize peer WebRTC connection, add event handlers.
     */
    private initPeer(isInitiator?: "initiator") {
        // create peer
        this.peer = new SimplePeer({
            initiator: isInitiator === "initiator",
            sdpTransform: this.sdpTransform_,
            stream: this.queuedStream ?? undefined,
        });
        this.queuedStream = null;

        // on signal, send via websocket
        this.peer.on("signal", signal => {
            this.ws.send(JSON.stringify({
                route: "message",
                data: {
                    type: "signal",
                    signal,
                },
            }));
        });

        let interval: undefined | ReturnType<typeof setInterval>;

        // on connect, start any queued stream, start heartbeats
        this.peer.on("connect", () => {
            if (this.queuedStream != null) {
                this.peer!.addStream(this.queuedStream);
                this.queuedStream = null;
            }

            // start heartbeat, initiator waits 2500ms before first beat
            setTimeout(() => {
                interval = setInterval(() => {
                    this.peer!.send(JSON.stringify({
                        type: "ping",
                    }));
                }, 5000);
            }, isInitiator ? 2500 : 0);
        });

        // on close, stop heartbeats
        this.peer.on("close", () => {
            console.warn("WebRTC", "Closed unexpectedly");

            if (interval != null) {
                clearInterval(interval);
            }
        });

        // when stream starts, notify someone
        this.peer.on("stream", s => this.onStream(s));

        // act on data received from peer
        this.peer.on("data", raw => {
            const data = JSON.parse(raw);

            // stream ending, notify someone
            if (data.type === "streamEnding") {
                if (this.onStreamEnd != null) {
                    this.onStreamEnd();
                }
                return;
            }

            // reply to pings
            if (data.type === "ping") {
                this.peer!.send(JSON.stringify({
                    type: "pong",
                }));
                return;
            }

            // ignore pongs
            if (data.type === "pong") {
                return;
            }

            console.log("WebRTC", "Unhandled message", data);
        });
    }

    /**
     * Handles bandwidth limiting.
     */
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

    /**
     * Begin streaming to peer.
     */
    public addStream(stream: MediaStream) {
        if (this.peer == null) {
            this.queuedStream = stream;
            return;
        }

        this.peer.addStream(stream);
    }

    /**
     * Stop streaming to peer.
     */
    public removeStream(stream: MediaStream) {
        if (this.peer == null) {
            this.queuedStream = null;
            return;
        }

        // notify peer
        this.peer.send(JSON.stringify({
            type: "streamEnding",
        }));
        this.peer.removeStream(stream);
    }
}
