import { Html5Qrcode } from "html5-qrcode";
import React, { useState, useEffect } from "react";
import "./App.css";
import dingSound from "./ding.mp3";

function App() {
  const [isEnabled, setEnabled] = useState(true); // Изначально отключено
  const [qrMessage, setQrMessage] = useState("");
  const [playSound, setPlaySound] = useState(false);
  const [scannedSuccessfully, setScannedSuccessfully] = useState(false);

  const tg = window.Telegram.WebApp;
  tg.ready()
  const queryId =  tg.initDataUnsafe?.query_id;

  var initData = tg.initData || '';
  var initDataUnsafe = tg.initDataUnsafe || {};
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const playDingSound = () => {
    const audioSource = audioContext.createBufferSource();
    const audioRequest = new XMLHttpRequest();

    audioRequest.open("GET", dingSound, true);
    audioRequest.responseType = "arraybuffer";

    audioRequest.onload = () => {
      const audioData = audioRequest.response;

      audioContext.decodeAudioData(audioData, (buffer) => {
        audioSource.buffer = buffer;
        audioSource.connect(audioContext.destination);
        audioSource.start();
      });
    };

    audioRequest.send();
  };


  

  useEffect(() => {

    const config = { fps: 10, qrbox: { width: 350, height: 250 } };

    const html5QrCode = new Html5Qrcode("qrCodeContainer");

    const qrCodeSuccess = (decodedText) => {
      const with_webview = true
      setQrMessage(decodedText);
      setScannedSuccessfully(true);
      setPlaySound(true);
      tg.HapticFeedback.impactOccurred("rigid")
      tg.sendData(decodedText)
      setTimeout(() => {
        setScannedSuccessfully(false);
        setPlaySound(false);
      }, 1000);
    };

    const qrScanerStop = () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then((ignore) => console.log("Scanner stop"))
          .catch((err) => console.log("Scanner error"));
      }
    };

    if (isEnabled) {
      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccess);
      setQrMessage("");
    } else {
      qrScanerStop();
    }

    return () => {
      qrScanerStop();
    };
  }, [isEnabled]);

  return (
    <div className="scanner">
      <div id="qrCodeContainer" />
          {scannedSuccessfully && <div className="qr-message">Успешно отсканировано</div>}
          {playSound && <audio src={dingSound} autoPlay />}
    </div>
  );
}

export default App;
