const WS_URL =
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/websocket`;

export default { WS_URL }