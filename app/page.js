import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.pageWrapper}>
      {/* Subtle ambient lighting */}
      <div className={styles.ambientGlowTop}></div>
      <div className={styles.ambientGlowBottom}></div>

      {/* Modern Navigation Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon}>
              <i className="fas fa-qrcode"></i>
            </span>
            <span className={styles.brandText}>QuickMenu</span>
          </Link>

          <nav className={styles.navActions}>
            <Link href="/login" prefetch={true} className={styles.loginLink}>
              Log in
            </Link>
            <Link href="/signup" prefetch={true} className={styles.signupButton}>
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            <span>Digital QR Menu Platform</span>
          </div>

          <h1 className={styles.heroTitle}>
            The Easiest Way to Create &amp; Share Your Restaurant Menu
          </h1>

          <p className={styles.heroSubtitle}>
            Build a sleek, mobile-friendly digital menu in minutes. Generate custom QR
            codes for your tables and update your dishes and prices instantly without reprinting.
          </p>

          <div className={styles.ctaGroup}>
            <Link href="/signup" prefetch={true} className={styles.primaryCta}>
              <span>Create Your Menu Free</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className={styles.trustRow}>
            <span><i className="fas fa-check"></i> Free forever plan</span>
            <span className={styles.trustDot}>•</span>
            <span><i className="fas fa-check"></i> No credit card required</span>
            <span className={styles.trustDot}>•</span>
            <span><i className="fas fa-check"></i> Setup in 2 minutes</span>
          </div>
        </section>

        {/* Live Product Showcase Preview */}
        <section className={styles.showcaseSection}>
          <div className={styles.showcaseGrid}>
            {/* Phone / Menu Preview */}
            <div className={styles.menuDevice}>
              <div className={styles.deviceHeader}>
                <div className={styles.restaurantMeta}>
                  <div className={styles.restaurantAvatar}>
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div>
                    <h3 className={styles.restaurantName}>Bistro Lumière</h3>
                    <span className={styles.restaurantStatus}>
                      <span className={styles.liveIndicator}></span> Open • Table 04
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample category pills */}
              <div className={styles.categoryPills}>
                <span className={`${styles.pill} ${styles.pillActive}`}>Popular</span>
                <span className={styles.pill}>Starters</span>
                <span className={styles.pill}>Mains</span>
                <span className={styles.pill}>Drinks</span>
              </div>

              {/* Sample dishes */}
              <div className={styles.sampleDishes}>
                <div className={styles.dishCard}>
                  <div className={styles.dishInfo}>
                    <span className={styles.dishTitle}>Truffle Beef Carpaccio</span>
                    <span className={styles.dishDesc}>
                      Thinly sliced beef tenderloin, aged parmesan, white truffle oil, baby arugula.
                    </span>
                  </div>
                  <div className={styles.dishPrice}>$18.50</div>
                </div>

                <div className={styles.dishCard}>
                  <div className={styles.dishInfo}>
                    <span className={styles.dishTitle}>Wild Mushroom Risotto</span>
                    <span className={styles.dishDesc}>
                      Creamy arborio rice, sautéed chanterelles &amp; porcini, thyme, parmesan crisp.
                    </span>
                  </div>
                  <div className={styles.dishPrice}>$16.00</div>
                </div>

                <div className={styles.dishCard}>
                  <div className={styles.dishInfo}>
                    <span className={styles.dishTitle}>Artisan Berry Pavlova</span>
                    <span className={styles.dishDesc}>
                      Crispy meringue nest, Chantilly vanilla cream, seasonal berries coulis.
                    </span>
                  </div>
                  <div className={styles.dishPrice}>$9.50</div>
                </div>
              </div>
            </div>

            {/* QR Stand Card */}
            <div className={styles.qrCard}>
              <div className={styles.qrBadge}>Instant Dine-In Access</div>
              <div className={styles.qrSvgWrapper}>
                <svg
                  width="140"
                  height="140"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.qrSvg}
                >
                  <rect width="120" height="120" rx="16" fill="#ffffff" />
                  {/* Corner 1: Top-Left */}
                  <rect x="14" y="14" width="30" height="30" rx="7" fill="#501C29" />
                  <rect x="20" y="20" width="18" height="18" rx="4" fill="#ffffff" />
                  <rect x="25" y="25" width="8" height="8" rx="2" fill="#501C29" />

                  {/* Corner 2: Top-Right */}
                  <rect x="76" y="14" width="30" height="30" rx="7" fill="#501C29" />
                  <rect x="82" y="20" width="18" height="18" rx="4" fill="#ffffff" />
                  <rect x="87" y="25" width="8" height="8" rx="2" fill="#501C29" />

                  {/* Corner 3: Bottom-Left */}
                  <rect x="14" y="76" width="30" height="30" rx="7" fill="#501C29" />
                  <rect x="20" y="82" width="18" height="18" rx="4" fill="#ffffff" />
                  <rect x="25" y="87" width="8" height="8" rx="2" fill="#501C29" />

                  {/* QR Matrix Elements */}
                  <rect x="52" y="16" width="7" height="7" rx="1.5" fill="#7C4855" />
                  <rect x="63" y="16" width="7" height="7" rx="1.5" fill="#652838" />
                  <rect x="52" y="27" width="7" height="7" rx="1.5" fill="#501C29" />
                  <rect x="63" y="27" width="7" height="7" rx="1.5" fill="#7C4855" />

                  <rect x="16" y="52" width="7" height="7" rx="1.5" fill="#7C4855" />
                  <rect x="27" y="52" width="7" height="7" rx="1.5" fill="#501C29" />
                  <rect x="16" y="63" width="7" height="7" rx="1.5" fill="#652838" />
                  <rect x="27" y="63" width="7" height="7" rx="1.5" fill="#7C4855" />

                  <rect x="49" y="49" width="22" height="22" rx="5" fill="#652838" />
                  <rect x="55" y="55" width="10" height="10" rx="2.5" fill="#ffffff" />

                  <rect x="78" y="52" width="8" height="8" rx="2" fill="#501C29" />
                  <rect x="90" y="52" width="8" height="8" rx="2" fill="#7C4855" />
                  <rect x="78" y="64" width="8" height="8" rx="2" fill="#652838" />
                  <rect x="90" y="78" width="8" height="8" rx="2" fill="#501C29" />
                  <rect x="64" y="78" width="8" height="8" rx="2" fill="#7C4855" />
                  <rect x="78" y="90" width="8" height="8" rx="2" fill="#652838" />
                  <rect x="90" y="90" width="8" height="8" rx="2" fill="#501C29" />
                  <rect x="52" y="90" width="8" height="8" rx="2" fill="#7C4855" />
                </svg>
              </div>
              <h4 className={styles.qrTitle}>Scan with any camera</h4>
              <p className={styles.qrDesc}>
                Guests point their phone camera to instantly view dishes, descriptions, and dietary info without installing an app.
              </p>
              <div className={styles.featureTags}>
                <span className={styles.featureTag}>
                  <i className="fas fa-bolt"></i> Fast Loading
                </span>
                <span className={styles.featureTag}>
                  <i className="fas fa-mobile-alt"></i> Mobile Optimized
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Step Workflow */}
        <section className={styles.workflowSection}>
          <div className={styles.sectionHeading}>
            <span className={styles.sectionSubtitle}>Simple Process</span>
            <h2 className={styles.sectionTitle}>How QuickMenu Works</h2>
          </div>

          <div className={styles.workflowGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepIcon}>
                <i className="fas fa-list-ul"></i>
              </div>
              <h3 className={styles.stepTitle}>Organize Your Menu</h3>
              <p className={styles.stepText}>
                Create categories, add mouthwatering descriptions, prices, and high-quality dish photos in your clean dashboard.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepIcon}>
                <i className="fas fa-qrcode"></i>
              </div>
              <h3 className={styles.stepTitle}>Print Your QR Code</h3>
              <p className={styles.stepText}>
                Download crisp, high-resolution QR codes ready to place on table stands, tent cards, or counter displays.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepIcon}>
                <i className="fas fa-sync-alt"></i>
              </div>
              <h3 className={styles.stepTitle}>Update in Real Time</h3>
              <p className={styles.stepText}>
                Need to change a price, run out of an item, or add a special? Update your menu instantly with zero reprint costs.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className={styles.bottomCtaSection}>
          <div className={styles.bottomCtaCard}>
            <div className={styles.bottomCtaContent}>
              <h2 className={styles.bottomCtaTitle}>
                Ready to elevate your restaurant menu?
              </h2>
              <p className={styles.bottomCtaDesc}>
                Get your digital menu live today. Simple setup, zero fuss.
              </p>
            </div>
            <Link href="/signup" prefetch={true} className={styles.bottomCtaBtn}>
              <span>Start Free Now</span>
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </section>
      </main>

      {/* Clean Modern Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.footerIcon}>
              <i className="fas fa-qrcode"></i>
            </span>
            <span className={styles.footerBrandText}>QuickMenu</span>
          </div>

          <p className={styles.footerCopyright}>
            &copy; {new Date().getFullYear()} QuickMenu. Built for modern dining.
          </p>

          <div className={styles.footerLinks}>
            <Link href="/login" className={styles.footerLink}>
              Log in
            </Link>
            <Link href="/signup" className={styles.footerLink}>
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
