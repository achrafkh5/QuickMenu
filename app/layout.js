import FontAwesomeScript from "./FontAwesomeScript";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <FontAwesomeScript /> {/* Load FA script only on client */}
      </body>
    </html>
  );
}
