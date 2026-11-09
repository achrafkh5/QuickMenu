"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./code.module.css";
import Menu from "./menu";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaSpinner } from "react-icons/fa";

function Code() {
    const { slug } = useParams();
    const [cat, setCat] = useState([]);
    const [dish, setDish] = useState([]);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/menu?slug=${slug}`, {
                    method: "GET"
                });  
                const data = await res.json();
                if (!res.ok) {
                    setError(data?.error || "Menu not found");
                    return;
                }

                if (res.ok) {
                    setRestaurant(data.user);
                    setCat(data.categories || []);
                    setDish(data.dishes || []);
                }
            } catch (err) {
                console.error("Error connecting to server:", err);
                setError("Failed to load menu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    // Dishes filtered by search query
    const filteredDishes = useMemo(() => {
        if (!searchQuery.trim()) return dish;
        const q = searchQuery.toLowerCase().trim();
        return dish.filter(d => d.name?.toLowerCase().includes(q));
    }, [dish, searchQuery]);

    // Categories to display
    const visibleCategories = useMemo(() => {
        if (activeCategory === "all") return cat;
        return cat.filter(c => String(c._id) === String(activeCategory));
    }, [cat, activeCategory]);

    // Smooth scroll to category or activate filter
    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        if (catId === "all") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            const element = document.getElementById(`cat-${catId}`);
            if (element) {
                const yOffset = -140; // offset for sticky search/pill bar
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
            }
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingCard}>
                    <FaSpinner className={styles.spinner} />
                    <p>Loading digital menu...</p>
                </div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className={styles.body}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>
                        <i className="fas fa-utensils"></i>
                    </div>
                    <h2>Menu Not Found</h2>
                    <p>
                        The menu for &ldquo;{slug}&rdquo; is currently unavailable or does not exist.
                    </p>
                    <Link href="/" className={styles.homeLink}>
                        <i className="fas fa-arrow-left"></i>
                        <span>Go to QuickMenu</span>
                    </Link>
                </div>
            </div>
        );
    }

    // Check if any category has dishes matching the query
    const hasAnyResults = cat.some(category => 
        filteredDishes.some(d => String(d.categoryId) === String(category._id))
    );

    return (
        <div className={styles.body}>
            {/* Top Brand Bar */}
            <div className={styles.topBrandBar}>
                <Link href="/" className={styles.brandBadge}>
                    <i className="fas fa-qrcode"></i>
                    <span>QuickMenu</span>
                </Link>
            </div>

            {/* Restaurant Hero Card */}
            <header className={styles.restaurantHero}>
                <div className={styles.restaurantHeaderContent}>
                    {restaurant.avatar?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={restaurant.avatar.url} 
                            alt={restaurant.username || 'Restaurant'} 
                            className={styles.restaurantAvatar}
                        />
                    ) : (
                        <div className={styles.restaurantAvatarPlaceholder}>
                            <i className="fas fa-store"></i>
                        </div>
                    )}
                    <div className={styles.restaurantInfo}>
                        <span className={styles.menuBadge}>DIGITAL MENU</span>
                        <h1 className={styles.restaurantTitle}>{restaurant.username}</h1>
                        <p className={styles.restaurantMeta}>
                            {cat.length} {cat.length === 1 ? 'Category' : 'Categories'} &bull; {dish.length} {dish.length === 1 ? 'Dish' : 'Dishes'}
                        </p>
                    </div>
                </div>
            </header>

            {/* Sticky Navigation: Search & Category Pills */}
            <div className={styles.stickyBar}>
                <div className={styles.stickyInner}>
                    {/* Search Bar */}
                    <div className={styles.searchWrap}>
                        <i className={`fas fa-search ${styles.searchIcon}`}></i>
                        <input
                            type="text"
                            placeholder="Search dishes in menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchQuery && (
                            <button 
                                className={styles.clearSearchBtn}
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>

                    {/* Category Navigation Pills */}
                    {cat.length > 0 && (
                        <div className={styles.categoryPills}>
                            <button
                                className={`${styles.pill} ${activeCategory === 'all' ? styles.pillActive : ''}`}
                                onClick={() => handleCategoryClick('all')}
                            >
                                <span>All Items</span>
                                <span className={styles.pillCount}>{dish.length}</span>
                            </button>
                            {cat.map((category) => {
                                const count = dish.filter(d => String(d.categoryId) === String(category._id)).length;
                                return (
                                    <button
                                        key={category._id}
                                        className={`${styles.pill} ${activeCategory === category._id ? styles.pillActive : ''}`}
                                        onClick={() => handleCategoryClick(category._id)}
                                    >
                                        {category.avatar?.url && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={category.avatar.url}
                                                alt=""
                                                className={styles.pillThumb}
                                            />
                                        )}
                                        <span>{category.name}</span>
                                        <span className={styles.pillCount}>{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Menu Content */}
            <main className={styles.menuContainer}>
                {cat.length === 0 ? (
                    <div className={styles.emptyMenuCard}>
                        <i className="fas fa-utensils"></i>
                        <h3>Menu is being prepared</h3>
                        <p>This restaurant has not added any categories yet. Check back soon!</p>
                    </div>
                ) : !hasAnyResults && searchQuery ? (
                    <div className={styles.emptySearchCard}>
                        <i className="fas fa-search"></i>
                        <h3>No dishes found</h3>
                        <p>No items match &ldquo;{searchQuery}&rdquo;. Try another search term.</p>
                        <button className={styles.clearFilterBtn} onClick={() => setSearchQuery("")}>
                            Clear Search
                        </button>
                    </div>
                ) : (
                    visibleCategories.map((category) => {
                        const categoryDishes = filteredDishes.filter(
                            d => String(d.categoryId) === String(category._id)
                        );
                        return (
                            <Menu 
                                key={category._id} 
                                id={`cat-${category._id}`} 
                                cats={category} 
                                dishes={categoryDishes}
                            />
                        );
                    })
                )}
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerBrand}>
                        <i className="fas fa-qrcode"></i>
                        <span>QuickMenu</span>
                    </div>
                    <p className={styles.footerText}>
                        Digital QR Menu Experience
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Code;
