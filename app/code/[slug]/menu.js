"use client";

import styles from "./code.module.css";
import Section from "./section";

function Menu({ cats, dishes, id }) {
    const categoryDishes = Array.isArray(dishes) ? dishes : [];

    if (categoryDishes.length === 0) {
        return null;
    }

    return (
        <section id={id} className={styles.categorySection}>
            <div className={styles.categoryHeader}>
                <div className={styles.categoryHeaderLeft}>
                    {cats?.avatar?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={cats.avatar.url} 
                            alt={cats.name || 'Category'} 
                            className={styles.categoryHeaderImg}
                        />
                    ) : (
                        <div className={styles.categoryPlaceholder}>
                            <i className="fas fa-utensils"></i>
                        </div>
                    )}
                    <div className={styles.categoryHeaderDetails}>
                        <h3 className={styles.categoryTitle}>{cats?.name}</h3>
                        <span className={styles.categoryCount}>
                            {categoryDishes.length} {categoryDishes.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.dishesGrid}>
                {categoryDishes.map((dish) => (
                    <Section key={dish._id} dish={dish} />
                ))}
            </div>
        </section>
    );
}

export default Menu;
