import styles from "./main.module.css";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

function Cat({ cats, isSelected, onClick, onDeleteCat, reload, isOperating }) {
    const [showDelete, setShowDelete] = useState(false);
    const [dish, setDish] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 900);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    useEffect(() => {
        const fetchDish = async () => {
            if (!cats?._id) {
                setDish([]);
                return;
            }
            
            try {
                const res = await fetch(`/api/dishes?id=${cats._id}`, {
                    method: "GET",
                    credentials: "include",
                });  
                
                if (!res.ok) {
                    throw new Error("Failed to fetch dishes");
                }
                
                const data = await res.json();
    
                if (Array.isArray(data)) {
                    setDish(data);
                } else {
                    setDish([]);
                }
            } catch (err) {
                console.error("Error fetching dishes:", err);
                setDish([]);
            }
        };
        fetchDish();
    }, [cats, reload]);
    
    return (
        <div 
            className={`${styles.catItem} ${isSelected ? styles.catItemSelected : ''}`}
            onClick={isOperating ? undefined : onClick} 
            onMouseEnter={() => !isOperating && setShowDelete(true)} 
            onMouseLeave={() => setShowDelete(false)} 
            style={isOperating ? { opacity: 0.6, cursor: 'not-allowed' } : { cursor: 'pointer' }}
        >
            <div className={styles.catItemLeft}>
                {cats?.avatar?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={cats.avatar.url} 
                        alt={cats.name || 'Category'} 
                        width={38} 
                        height={38} 
                        className={styles.catItemImg}
                    />
                ) : (
                    <div className={styles.catItemPlaceholder}>
                        <i className="fas fa-utensils"></i>
                    </div>
                )}
                <span className={styles.catItemName}>{cats.name}</span>
            </div>
            <div className={styles.catItemRight}>
                <span className={styles.catItemBadge}>
                    {Array.isArray(dish) ? dish.length : 0}
                </span>
                {(showDelete || isMobile) && !isOperating && (
                    <button
                        type="button"
                        className={styles.catDeleteBtn}
                        onClick={e => { 
                            e.stopPropagation(); 
                            onDeleteCat(); 
                        }}
                        aria-label="Delete category"
                        title="Delete category"
                    >
                        <FaTrash className={styles.trashIcon} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default Cat;