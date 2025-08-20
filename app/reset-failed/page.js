import Link from "next/link";
import styles from "../verify-failed/verified.module.css";
export default function VerifyFailedPage() {
  return (
    <div className={styles.verefied_page}>
      <h1>Reset password failed</h1>
      <p>Something went wrong. Please try again.</p>
      <Link prefetch={true} href="/login">Go to Login</Link>
    </div>
  );
}