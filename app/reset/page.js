"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import styles from "./reset.module.css";

export default function Reset() {
  const [password, setPassword] = useState("");
  const [conf, setConf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passRef = useRef(null);

  const router = useRouter(); // App Router version
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Redirect immediately if token is missing
  useEffect(() => {
    if (!token) {
      router.push("/reset-failed");
    }
  }, [token, router]);

  // Auto-focus first input
  useEffect(() => {
    passRef.current?.focus();
  }, []);

  const handleReset = async () => {
    setError("");

    if (!password || !conf) {
      return setError("Please fill all fields");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    if (password !== conf) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch(
        "/api/auth/reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        router.push("/login");
      } else {
        setError(data.error || "Reset failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.c1}></div>
      <div className={styles.c2}></div>
      <div className={styles.c3}></div>
      <div className={styles.c4}></div>
      <div className={styles.c5}></div>

      <div className={styles.conf} id="confirmation">
        <h1>Reset Password</h1>
        <input
          type="password"
          placeholder="New password"
          id="forget-pass"
          ref={passRef}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirm password"
          id="forget-conf"
          value={conf}
          onChange={(e) => setConf(e.target.value)}
          disabled={loading}
        />
        {error && <p style={{ color: "red", marginTop: 5 }}>{error}</p>}
        <button
          className={styles.but}
          onClick={handleReset}
          disabled={loading || !password || !conf}
          style={loading ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        >
          {loading ? <FaSpinner className={styles.spinner} /> : "Reset Password"}
        </button>
      </div>
    </div>
  );
}
