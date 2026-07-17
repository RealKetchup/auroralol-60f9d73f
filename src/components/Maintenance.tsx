export default function Maintenance() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #2b1550 0%, #0b0b14 45%, #050507 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <audio autoPlay loop>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      <div
        style={{
          width: "100%",
          maxWidth: "650px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "48px",
          textAlign: "center",
          boxShadow: "0 0 60px rgba(179,82,255,.18)",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "3.3rem",
            fontWeight: 800,
            color: "#d46dff",
            textShadow: "0 0 18px rgba(212,109,255,.55)",
          }}
        >
          aurora.lol
        </h1>

        <div
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "8px 18px",
            borderRadius: "999px",
            background: "rgba(168,85,247,.15)",
            border: "1px solid rgba(168,85,247,.4)",
            color: "#d8b4fe",
            fontWeight: 600,
          }}
        >
          🚧 Scheduled Maintenance
        </div>

        <h2
          style={{
            marginTop: "30px",
            color: "#fff",
            fontSize: "2rem",
          }}
        >
          We'll be back soon.
        </h2>

        <p
          style={{
            color: "#a1a1aa",
            lineHeight: 1.7,
            fontSize: "1.05rem",
          }}
        >
          Aurora is currently undergoing maintenance while we improve
          performance, stability, and add new features.
          <br />
          Thank you for your patience.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "30px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#11111c",
              padding: "12px 18px",
              borderRadius: "12px",
              color: "#fff",
            }}
          >
            ⚡ Faster
          </div>

          <div
            style={{
              background: "#11111c",
              padding: "12px 18px",
              borderRadius: "12px",
              color: "#fff",
            }}
          >
            🔒 Secure
          </div>

          <div
            style={{
              background: "#11111c",
              padding: "12px 18px",
              borderRadius: "12px",
              color: "#fff",
            }}
          >
            ✨ New Features
          </div>
        </div>

        <p
          style={{
            marginTop: "40px",
            color: "#71717a",
          }}
        >
          © {new Date().getFullYear()} Aurora
        </p>
      </div>
    </div>
  );
}
