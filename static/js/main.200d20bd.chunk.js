(this.webpackJsonpscreenstream=this.webpackJsonpscreenstream||[]).push([[0],{38:function(e,t,n){},41:function(e,t,n){},66:function(e,t){},68:function(e,t){},81:function(e,t,n){"use strict";n.r(t);var i=n(1),r=n.n(i),a=n(27),o=n.n(a),s=(n(38),n(3)),c=n(14),d=n.n(c),l=n(28),u=n(0);function h(e){if(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia)return navigator.mediaDevices.getDisplayMedia(e);if(navigator.getDisplayMedia)return navigator.getDisplayMedia(e);throw new Error("getDisplayMedia is not available.")}function v(e){if(!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia||navigator.getDisplayMedia))return Object(u.jsx)("div",{children:"Not supported"});var t=Object(i.useState)("initial"),n=Object(s.a)(t,2),r=n[0],a=n[1],o=function(){var t=Object(l.a)(d.a.mark((function t(){var n,i,r,o;return d.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,h({video:e.constraints||!0});case 3:n=t.sent,e.onStreamSelected&&e.onStreamSelected(n),a("selected"),i=n.getVideoTracks(),r=Object(s.a)(i,1),(o=r[0]).addEventListener("ended",(function(){e.onStreamEnded&&e.onStreamEnded(n),a("ended")})),console.log("video",o),t.next=15;break;case 11:t.prev=11,t.t0=t.catch(0),console.error(t.t0),a("error");case 15:case"end":return t.stop()}}),t,null,[[0,11]])})));return function(){return t.apply(this,arguments)}}();return"selected"===r?Object(u.jsx)("div",{children:"Stream selected"}):Object(u.jsxs)(u.Fragment,{children:["error"===r&&Object(u.jsx)("div",{children:"Error"}),Object(u.jsx)("button",{onClick:o,type:"button",children:"Select screen to share"})]})}var m=n(32),S=n(33),p=["srcObject"];function f(e){var t=e.srcObject,n=Object(S.a)(e,p),r=Object(i.useRef)(null);return Object(i.useEffect)((function(){if(r.current){var e=r.current;"srcObject"in e?e.srcObject=t:e.src=URL.createObjectURL(t)}}),[t]),Object(u.jsx)("video",Object(m.a)({ref:r},n))}n(41);var g=n(29),b=n(30),j=n(31),O=n.n(j),w=function(){function e(t){Object(g.a)(this,e),this.audioBandwidth=void 0,this.frameRate=void 0,this.height=void 0,this.onStream=void 0,this.onStreamEnd=void 0,this.peer=null,this.queuedStream=null,this.videoBandwidth=void 0,this.ws=void 0,this.wsChannel=void 0,this.audioBandwidth=t.audioBandwidth,this.frameRate=t.frameRate,this.height=t.height,this.onStream=t.onStream,this.onStreamEnd=t.onStreamEnd,this.videoBandwidth=t.videoBandwidth,this.wsChannel=t.wsChannel,this.ws=new WebSocket(t.wsUrl),this.initWebSocket()}return Object(b.a)(e,[{key:"initWebSocket",value:function(){var e=this;this.ws.addEventListener("open",(function(){e.ws.send(JSON.stringify({route:"joinChannel",channelId:e.wsChannel}))})),this.ws.addEventListener("message",(function(t){var n=JSON.parse(t.data);if("error"!==n.status){if("peer"===n.route){if("signal"===n.data.type){if(null==e.peer)throw new Error("Cannot signal, peer is null.");return console.log("WebSocket","Received signal",n),void e.peer.signal(n.data.signal)}return"text"===n.data.type&&"initializing"===n.data.text?void e.initPeer():void console.log("WebSocket","Unhandled message from peer",n)}if("joinChannel"===n.route)return console.log("WebSocket","Joined channel",n),n.numberOfMembers>1?(e.initPeer("initiator"),void e.ws.send(JSON.stringify({route:"message",data:{type:"text",text:"initializing"}}))):void console.log("WebSocket","Waiting for peer");console.log("WebSocket","Unhandled message",n)}else console.error("WebSocket","Received error",n)})),this.ws.addEventListener("close",(function(e){console.warn("WebSocket","Closed unexpectedly",e.code,e.reason)}))}},{key:"initPeer",value:function(e){var t,n=this;this.peer=new O.a({initiator:"initiator"===e,sdpTransform:this.sdpTransform_,stream:null!==(t=this.queuedStream)&&void 0!==t?t:void 0}),this.queuedStream=null,this.peer.on("signal",(function(e){n.ws.send(JSON.stringify({route:"message",data:{type:"signal",signal:e}}))})),this.peer.on("connect",(function(){null!=n.queuedStream&&(n.peer.addStream(n.queuedStream),n.queuedStream=null)})),this.peer.on("stream",(function(e){return n.onStream(e)})),this.peer.on("data",(function(e){var t=JSON.parse(e);"streamEnding"!==t.type?console.log("WebRTC","Unhandled message",t):null!=n.onStreamEnd&&n.onStreamEnd()}))}},{key:"sdpTransform_",value:function(e){return e=e.replace(/b=AS([^\r]+\r\n)/g,""),null!=this.audioBandwidth&&(e=e.replace(/a=mid:audio\r\n/g,"a=mid:audio\r\nb=AS:".concat(this.audioBandwidth,"\r\n"))),null!=this.videoBandwidth&&(e=e.replace(/a=mid:video\r\n/g,"a=mid:video\r\nb=AS:".concat(this.videoBandwidth,"\r\n"))),e}},{key:"addStream",value:function(e){null!=this.peer?this.peer.addStream(e):this.queuedStream=e}},{key:"removeStream",value:function(e){null!=this.peer?(this.peer.send(JSON.stringify({type:"streamEnding"})),this.peer.removeStream(e)):this.queuedStream=null}}]),e}(),E=n(9),y=Object(E.makeValidator)((function(e){return Object(E.str)({choices:["development","test","production"]})._parse(e)})),k=Object.entries(Object({NODE_ENV:"production",PUBLIC_URL:"",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0,REACT_APP_WS_URL:"wss://screenstreamserver.mattm.win:2096/v1/websocket"})).reduce((function(e,t){var n=Object(s.a)(t,2),i=n[0],r=n[1];return e[i=i.replace(/^REACT_APP_/i,"")]=r,e}),{}),x=Object(E.cleanEnv)(k,{NODE_ENV:y({default:"development"}),WS_URL:Object(E.url)()}),C=n.p+"static/media/logo.6ce24c58.svg";var _=function(){var e,t=Object(i.useState)(null),n=Object(s.a)(t,2),r=n[0],a=n[1];return Object(i.useEffect)((function(){e=new w({onStream:a,wsUrl:x.WS_URL,wsChannel:window.location.hash||"test"})}),["once"]),Object(u.jsx)("div",{className:"App",children:Object(u.jsxs)("header",{className:"App-header",children:[Object(u.jsx)("img",{src:C,className:"App-logo",alt:"logo"}),Object(u.jsx)(v,{onStreamSelected:function(t){return e.addStream(t)},onStreamEnded:function(t){return e.removeStream(t)}}),r&&Object(u.jsx)(f,{width:"90%",autoPlay:!0,muted:!0,controls:!0,srcObject:r})]})})},D=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,82)).then((function(t){var n=t.getCLS,i=t.getFID,r=t.getFCP,a=t.getLCP,o=t.getTTFB;n(e),i(e),r(e),a(e),o(e)}))};o.a.render(Object(u.jsx)(r.a.StrictMode,{children:Object(u.jsx)(_,{})}),document.getElementById("root")),D()}},[[81,1,2]]]);
//# sourceMappingURL=main.200d20bd.chunk.js.map