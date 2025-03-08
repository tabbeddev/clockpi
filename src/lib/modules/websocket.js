export default function connectWebSocket(url) {
  return new Promise((resolve, reject) => {
    try {
      const socket = new WebSocket(url);

      socket.addEventListener("open", () => {
        // Connection successful, return WebSocket-Client
        resolve(socket);
      });

      socket.onerror = (error) => {
        reject(error);
      };

      socket.onclose = () => {
        if (!socket.readyState || socket.readyState !== WebSocket.OPEN) {
          reject(new Error("WebSocket closed unexpected"));
        }
      };
    } catch (err) {
      reject(err);
    }
  });
}
