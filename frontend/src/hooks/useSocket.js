import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
    if (!token) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }
    const instance = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true
    });
    setSocket(instance);
    return () => {
      instance.disconnect();
    };
  }, [token]);

  return socket;
};
