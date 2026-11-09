import styles from "./code.module.css";

function Section({ dish }) {
    if (!dish) return null;

    return (
        <div className={styles.dishCard}>
            <div className={styles.dishImageContainer}>
                {dish?.avatar?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={dish.avatar.url} 
                        alt={dish.name || 'Dish'} 
                        className={styles.dishImage}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.dishPlaceholder}>
                        <i className="fas fa-bowl-food"></i>
                    </div>
                )}
                <div className={styles.dishPriceBadge}>
                    <span className={styles.dishPriceNumber}>{dish.price}</span>
                    <span className={styles.dishCurrency}>DA</span>
                </div>
            </div>
            <div className={styles.dishInfo}>
                <h4 className={styles.dishName} title={dish.name}>{dish.name}</h4>
            </div>
        </div>
    );
}

export default Section;
