import React, { useEffect, useState } from "react";
import { SelectStream, Video } from "components";
import "./App.css";
import PeerManager from "PeerManager";
import env from "env";
import logo from "./logo.svg";

let pm: PeerManager;

function App() {
    const [stream, setStream] = useState<null | MediaStream>(null);

    // set up PeerManager
    useEffect(() => {
        pm = new PeerManager({
            onStream: setStream,
            onStreamEnd: () => setStream(null),
            wsUrl: env.WS_URL,
            wsChannel: window.location.hash || "test",
        });
    }, ["once"]);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <SelectStream onStreamSelected={s => pm.addStream(s)} onStreamEnded={s => pm.removeStream(s)} />

          {stream && (
            <Video width="90%" autoPlay muted controls srcObject={stream} />
          )}
        </header>
      </div>
    );
}

export default App;
