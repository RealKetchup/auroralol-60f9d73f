export default function Maintenance() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0f172a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "12px" }}>
        🚧 Maintenance
      </h1>

      <p style={{ fontSize: "1.25rem" }}>
        Aurora is currently undergoing maintenance.
      </p>

      <p style={{ color: "#94a3b8" }}>
        We'll be back online soon.
      </p>
    </div>
  );
}
