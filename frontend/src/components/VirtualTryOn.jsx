import React, { useEffect, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const VirtualTryOn = ({ glassesImage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiFaceLandmarks?.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        const left = landmarks[127];
        const right = landmarks[356];
        const nose = landmarks[168]; 

        const glasses = new Image();
        glasses.src = glassesImage;
        glasses.onload = () => {
          const faceWidth = Math.abs(right.x - left.x) * canvas.width * 1.2;
          const x = left.x * canvas.width - faceWidth * 0.1;
          const y = nose.y * canvas.height - faceWidth * 0.3;

          ctx.drawImage(glasses, x, y, faceWidth, faceWidth / 2.5);
        };
      }
    });

    if (typeof videoRef.current !== "undefined" && videoRef.current !== null) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [glassesImage]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        className="hidden"
        width="640"
        height="480"
        autoPlay
        playsInline
      />
      <canvas ref={canvasRef} width="640" height="480" className="rounded-lg shadow-lg"></canvas>
    </div>
  );
};

export default VirtualTryOn;
