import styles from "./main.module.css";
import { useEffect,useState } from "react";
import { FaTrash } from "react-icons/fa";

function Cat({cats, isSelected, onClick, onDeleteCat, reload, isOperating }){
    const [showDelete, setShowDelete] = useState(false);
    const [dish,setDish] = useState([]);
    
    useEffect(()=>{
        const fetchDish = async() => {
            if (!cats?._id) {
                setDish([]);
                return;
            }
            
            try{
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
    },[cats,reload])
    
    return(
        <div 
            className={styles.radio} 
            onClick={isOperating ? undefined : onClick} 
            onMouseEnter={() => !isOperating && setShowDelete(true)} 
            onMouseLeave={() => setShowDelete(false)} 
            style={isOperating ? { opacity: 0.6, cursor: 'not-allowed' } : { cursor: 'pointer' }}
        >
            <div className={styles.ster}>
                <div className={styles["ster-left"]}>
                    {cats?.avatar?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={cats.avatar.url} 
                            alt={cats.name || 'Category'} 
                            width={50} 
                            height={50} 
                            style={{ borderRadius: '8px', objectFit: 'cover' }}
                        />
                    )}
                    <p>{cats.name}</p>
                </div>
                <div className={styles["ster-right"]}>
                    <p>({Array.isArray(dish) ? dish.length : 0})</p>
                    {showDelete && !isOperating && (
                        <FaTrash 
                            className="trash-icon" 
                            style={{
                                marginLeft: "10px",
                                color: "white",
                                cursor: "pointer"
                            }} 
                            onClick={e => { 
                                e.stopPropagation(); 
                                onDeleteCat(); 
                            }} 
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
export default Cat;