import FontAwesomeScript from "./FontAwesomeScript";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="./favicon.ico" />
        <title>QuickMenu</title>
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <FontAwesomeScript /> {/* Load FA script only on client */}
      </body>
    </html>
  );
}
