import styles from "./main.module.css"

function Dish({dish, onDeleteDish, onChangePrice, isOperating}) {
    if (!dish) return null;
    
    return(
        <div className={styles.dish_ster} style={isOperating ? { opacity: 0.6 } : {}}>
            {dish?.avatar?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                    src={dish.avatar.url} 
                    alt={dish.name || 'Dish'} 
                    width={150} 
                    height={150} 
                    style={{ borderRadius: '8px', objectFit: 'cover' }}
                />
            )}
            <p>{dish?.name}</p>
            <p>{dish?.price} DA</p>
            <button className={styles.edit} onClick={onChangePrice} disabled={isOperating} style={isOperating ? { cursor: 'not-allowed' } : {}}>change price</button>
            <button className={styles.delete} onClick={onDeleteDish} disabled={isOperating} style={isOperating ? { cursor: 'not-allowed' } : {}}>delete</button>
        </div>
    );
}
export default Dish