"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./forget.module.css";
import { useRouter } from "next/navigation";

function Forget() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const forgett = async () => {
    if (!email) return alert("You need to enter an email");

    // Clear previous error
    const oldErr = document.getElementById("err-mail");
    if (oldErr) oldErr.remove();
    document.getElementById("forget-email").style.border = "solid 1px grey";

    try {
      const res = await fetch("/api/auth/forget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Reset email sent");
        router.push("/login");
      } else if (data.message === "user not found") {
        const par = document.getElementById("imail");
        const err = document.createElement("p");
        err.id = "err-mail";
        err.style.color = "red";
        err.innerText = "User not found";
        par.appendChild(err);
        document.getElementById("forget-email").style.border = "solid 2px red";
      } else {
        console.log(data.error || "Sending failed");
      }
    } catch (err) {
      alert("Error connecting to server");
      console.log(err);
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.c1}></div>
      <div className={styles.c2}></div>
      <div className={styles.c3}></div>
      <div className={styles.c4}></div>
      <div className={styles.c5}></div>

      <div className={styles.container}>
        <h1>Update password</h1>
        <div className={styles.all}>
          <div className={styles.email}>
            <p>We will send you an email with instructions on how to reset your password.</p>
            <input
              type="email"
              id="forget-email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "15px",background: "lightGrey", border: "solid 1px black" }}
            />
            <div id="imail"></div>
          </div>
          <div className={styles.actions}>
            <button className={styles.but} onClick={forgett}>Enter</button>
            <Link href="/login" prefetch={true} className={styles.back}>Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forget;
