import "./globals.css";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        {/* Titre global, toujours visible */}
        <div
          style={{
            position: "fixed",
            top: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            fontFamily:
              "'Poppins', system-ui, -apple-system, Segoe UI, Roboto, Arial",
            fontWeight: 800,
            fontSize: "clamp(22px, 3.2vw, 34px)",
            letterSpacing: 0.6,
            color: "#00e0ff",
            textShadow: "0 0 10px rgba(0,224,255,.35)",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          LeGenerateurDigital
        </div>

        {children}
      </body>
    </html>
  );
}
