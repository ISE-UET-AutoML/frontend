import React, { useState, useEffect } from "react";
import {
  Aipoweredmarketingtoolsabstract,
  AITools,
  KeitoFrontPage,
  LiveChatbot,
  SandyLoading,
} from "src/assets/gif";

const gifs = [
  Aipoweredmarketingtoolsabstract,
  AITools,
  KeitoFrontPage,
  LiveChatbot,
  SandyLoading,
];

export default function Loading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % gifs.length);
    }, 10000); // đổi mỗi 10 giây
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4" style={{marginTop: '50px'}}>
      <img
        src={gifs[index]}
        alt="loading"
        style={{ width: "300px", height: "300px" }}
      />
      <p style={{ color: "var(--text)", fontSize: "18px", marginTop: "20px" }}>
        It may take a while, you can exit and come back later.
      </p>
    </div>
  );
}
