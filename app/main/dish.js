import styles from "./main.module.css";

function Dish({ dish, onDeleteDish, onChangePrice, isOperating }) {
    if (!dish) return null;
    
    return (
        <div className={styles.dishCard} style={isOperating ? { opacity: 0.6 } : {}}>
            <div className={styles.dishImageContainer}>
                {dish?.avatar?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={dish.avatar.url} 
                        alt={dish.name || 'Dish'} 
                        className={styles.dishImage}
                    />
                ) : (
                    <div className={styles.dishPlaceholder}>
                        <i className="fas fa-utensils"></i>
                    </div>
                )}
                <div className={styles.dishPriceBadge}>
                    <span className={styles.dishPriceValue}>{dish?.price}</span>
                    <span className={styles.dishPriceUnit}>DA</span>
                </div>
            </div>
            
            <div className={styles.dishBody}>
                <h4 className={styles.dishName} title={dish?.name}>{dish?.name}</h4>
                <div className={styles.dishCardActions}>
                    <button 
                        className={styles.dishEditBtn} 
                        onClick={onChangePrice} 
                        disabled={isOperating} 
                        style={isOperating ? { cursor: 'not-allowed' } : {}}
                        title="Change price"
                    >
                        <i className="fas fa-pen"></i>
                        <span>Price</span>
                    </button>
                    <button 
                        className={styles.dishDeleteBtn} 
                        onClick={onDeleteDish} 
                        disabled={isOperating} 
                        style={isOperating ? { cursor: 'not-allowed' } : {}}
                        title="Delete dish"
                    >
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dish;