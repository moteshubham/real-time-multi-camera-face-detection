import CameraFeed from "../components/CameraFeed";
import AlertBox from "../components/AlertBox";

const cameras = [
  "http://localhost:5000/camera1",
  "http://localhost:5000/camera2"
];

function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1>Camera Dashboard</h1>
      {cameras.map((url, idx) => (
        <CameraFeed key={idx} cameraURL={url} />
      ))}
      <AlertBox message="Face detected!" type="warning" />
    </div>
  );
}

export default Home;
