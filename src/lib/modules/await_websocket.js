export default function awaitMessage(socket, message) {
    return new Promise((resolve) => {
        socket.send(message);

        socket.addEventListener('message', (ev) => {
            resolve(ev.data);
        });
     });
  }
  