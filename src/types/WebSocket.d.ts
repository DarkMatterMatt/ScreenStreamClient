interface ResponseBase {
    message: string;
    route: string;
    status: "success" | "error";
}

interface ResponseChannel extends ResponseBase {
    channelId: string;
    numberOfMembers: number;
    route: "getChannel" | "joinChannel" | "leaveChannel";
}

interface ResponseMessage extends ResponseBase {
    route: "message";
    channelId: string;
    numberOfMembers: number;
}

interface ResponsePing extends ResponseBase {
    route: "ping";
}

interface ResponseSignal extends ResponseBase {
    data: {
        type: "signal";
        signal: SimplePeer.SignalData;
    }
    route: "peer";
}

interface ResponseText extends ResponseBase {
    data: {
        type: "text";
        text: string;
    }
    route: "peer";
}

type ResponseAny = ResponseChannel | ResponseMessage | ResponsePing | ResponseSignal | ResponseText;
