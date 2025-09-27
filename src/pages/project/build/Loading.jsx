import React, { useState, useEffect } from "react";
import {
  artificialIntelligence,
  cloud,
  software,
  file,
  chatLoading,
  Aipoweredmarketingtoolsabstract,
  AITools,
  KeitoFrontPage,
  LiveChatbot,
  SandyLoading,
} from "src/assets/gif";

const gifs = [
  software,
  cloud,
  file,
  Aipoweredmarketingtoolsabstract,
  LiveChatbot,
];

export default function Loading({ currentStep }) {

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4" style={{marginTop: '50px'}}>
      <img
        src={gifs[currentStep]}
        alt="loading"
        style={{ width: "300px", height: "300px" }}
      />
      <p style={{ color: "var(--text)", fontSize: "18px", marginTop: "20px" }}>
        It may take a while, you can exit and come back later.
      </p>
    </div>
  );
}
