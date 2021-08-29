import SimplePeer from "simple-peer";

interface ScreenSharePeerOpts {
    audioBandwidth?: number;
    peerOpts?: Omit<SimplePeer.Options, "sdpTransform">;
    sdpTransform?: (sdp: string) => string;
    videoBandwidth?: number;
}

export default class PeerManager {
    private audioBandwidth?: number;

    private peer: SimplePeer.Instance;

    private sdpTransform?: (sdp: string) => string;

    private videoBandwidth?: number;

    constructor(o: ScreenSharePeerOpts) {
        const peerOpts: SimplePeer.Options = o.peerOpts ?? {};
        peerOpts.trickle ??= true;
        peerOpts.sdpTransform = this.sdpTransform_;

        this.peer = new SimplePeer(peerOpts);

        this.peer.on("signal", ev => {
            console.log("signal", ev);
        });
    }

    private sdpTransform_(sdp: string) {
        if (this.audioBandwidth != null) {
            sdp = sdp.replace(/a=mid:audio\r\n/g, `a=mid:audio\r\nb=AS:${this.audioBandwidth}\r\n`);
        }
        if (this.videoBandwidth != null) {
            sdp = sdp.replace(/a=mid:video\r\n/g, `a=mid:video\r\nb=AS:${this.videoBandwidth}\r\n`);
        }
        if (this.sdpTransform != null) {
            sdp = this.sdpTransform(sdp);
        }
        return sdp;
    }

    public startSharing(stream: MediaStream) {
        this.peer.addStream(stream);
    }
}
