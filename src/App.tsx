import React, { useState } from "react";
import { SelectStream, Video } from "components";
import logo from "./logo.svg";
import "./App.css";

function App() {
    const [stream, setStream] = useState<null | MediaStream>(null);

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <SelectStream onStreamSelected={s => setStream(s)} onStreamEnded={() => setStream(null)} />

          {stream && (
            <Video width="90%" autoPlay muted controls srcObject={stream} />
          )}
        </header>
      </div>
    );
}

export default App;
