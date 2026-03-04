import EventDisplayButton from "peerpop/react";
import "./App.css";

const EVENT_URL =
  "https://peerpop.io/view/events/wickedhalloweenparty+2025-10-30";

export default function App() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>PeerPop EventDisplayButton</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Click the button to open the event in a modal.
      </p>
      <EventDisplayButton url={EVENT_URL} buttonText="Get Tickets" buttonStyles="my-btn-class" />
    </div>
  );
}
