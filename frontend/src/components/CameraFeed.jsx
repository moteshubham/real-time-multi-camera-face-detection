import { useEffect, useRef, useState } from "react";

function CameraFeed({ cameraURL }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    if (!cameraURL) return;

    const video = videoRef.current;
    video.src = cameraURL;  // URL from Go worker stream
    video.autoplay = true;
    video.muted = true;     // mute audio if any

    // Simulate face detection alerts
    const interval = setInterval(() => {
      // Example: randomly trigger an alert
      if (Math.random() < 0.05) setAlert(true);
      else setAlert(false);
    }, 1000);

    video.onloadeddata = () => setLoading(false);

    return () => clearInterval(interval);
  }, [cameraURL]);

  return (
    <div style={{ margin: "20px", border: "1px solid #ccc", padding: "10px" }}>
      {loading && <p>Loading camera feed...</p>}
      <video
        ref={videoRef}
        width={320}
        height={240}
        style={{ display: loading ? "none" : "block" }}
      ></video>
      {alert && (
        <div style={{ color: "red", marginTop: "5px", fontWeight: "bold" }}>
          Face Detected!
        </div>
      )}
    </div>
  );
}

export default CameraFeed;
