import Link from "next/link";
import styles from "./verified.module.css";
export default function VerifiedPage() {
  return (
    <div className={styles.verified_page}>
      <h1>Verification Successful</h1>
      <p>Your account has been successfully verified.</p>
      <p>You can now log in to your account.</p>
      <Link prefetch={true} href="/login">Go to Login</Link>
    </div>
  );
}