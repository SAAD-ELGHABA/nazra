import React, { useRef, useEffect, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const GlassesTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [glassesImg, setGlassesImg] = useState(null);

  // Load a default glasses image
  useEffect(() => {
    const img = new Image();
    img.src = "/glasses.png"; // put your glasses image in public folder
    img.onload = () => setGlassesImg(img);
  }, []);

  useEffect(() => {
    if (!glassesImg) return;

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

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];

        // Eyes corners (left 33, right 263 in FaceMesh indexes)
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        const x1 = leftEye.x * canvas.width;
        const y1 = leftEye.y * canvas.height;
        const x2 = rightEye.x * canvas.width;
        const y2 = rightEye.y * canvas.height;

        const glassesWidth = Math.hypot(x2 - x1, y2 - y1) * 2; // scale
        const glassesHeight = glassesWidth / 2; // adjust ratio

        const angle = Math.atan2(y2 - y1, x2 - x1);

        ctx.save();
        ctx.translate((x1 + x2) / 2, (y1 + y2) / 2); // center between eyes
        ctx.rotate(angle);
        ctx.drawImage(
          glassesImg,
          -glassesWidth / 2,
          -glassesHeight / 2,
          glassesWidth,
          glassesHeight
        );
        ctx.restore();
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
  }, [glassesImg]);

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} className="hidden" playsInline />
      <canvas ref={canvasRef} width={640} height={480} className="rounded-xl shadow-lg" />
      <p className="mt-2 text-gray-600">Try on glasses in real time 👓</p>
    </div>
  );
};

export default GlassesTryOn;
