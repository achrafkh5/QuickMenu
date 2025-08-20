import dynamic from "next/dynamic";

// Import the client Reset component dynamically with SSR disabled
const Reset = dynamic(() => import("./Reset"), { ssr: false });

export default function Page() {
  return <Reset />;
}
