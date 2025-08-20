import Link from "next/link";
import styles from "./verified.module.css";
export default function VerifyFailedPage() {
  return (
    <div className={styles.verefied_page}>
      <h1>Verification failed</h1>
      <p>Something went wrong.</p>
      <p>Please try again.</p>
      <Link prefetch={true} href="/login">Go to Login</Link>
    </div>
  );
}