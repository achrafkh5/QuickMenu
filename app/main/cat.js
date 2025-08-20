import styles from "./main.module.css";
import { useEffect,useState } from "react";
import { FaTrash } from "react-icons/fa";
function Cat({cats, isSelected, onClick, onDeleteCat,reload }){
    const display = () =>document.getElementById(cats._id+1).style.visibility = "visible";
    const hide = () =>document.getElementById(cats._id+1).style.visibility = "hidden";
    const [dish,setDish] = useState([]);
    useEffect(()=>{
        const fetchDish = async() => {
            if (!cats || !cats._id) {
                return;
            }
            try{
                const res = await fetch(`/api/dishes?id=${cats._id}`, {
                    method: "GET",
                    credentials: "include", // Send cookies with request
                });  
                const data = await res.json();
    
                if (res.ok) {
                    setDish(data);
                } else {
                    console.error("Error:", data.error);
                }
            } catch (err) {
                console.error("Error connecting to server:", err);
            }
        };
        fetchDish();
    },[cats,reload])
    return(
        <div className={styles.radio} onClick={onClick} onMouseOver={display} onMouseLeave={hide}>
            <input type="radio" name="cats" id={cats._id} style={{display:"none"}} defaultChecked={isSelected}/>
            <label htmlFor={cats._id} className={styles.ster}>
            <div className={styles["ster-left"]}>
                <img src= {cats.avatar.url} alt={cats.name} />
                <p>{cats.name}</p>
              </div>
              <div className={styles["ster-right"]}>
                <p>({Array.isArray(dish) ? dish.length : 0})</p>
                <FaTrash className="trash-icon" id={cats._id+1} style={{visibility:"hidden",marginLeft:"10px",color:"white"}} onClick={e => { e.stopPropagation(); onDeleteCat(); }} />
              </div>
            </label>
        </div>
    )
}
export default Cat;