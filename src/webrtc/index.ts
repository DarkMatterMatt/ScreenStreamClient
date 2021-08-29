import SimplePeer from "simple-peer";

interface InitiateOpts {
    isInitiator: boolean;
}

export function initiate({ isInitiator }: InitiateOpts): SimplePeer.Instance {
    const p = new SimplePeer({
        initiator: isInitiator,
    });

    return p;
}
