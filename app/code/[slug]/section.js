import styles from "./code.module.css";
import Image from "next/image";
function Section({dish}) {
    return(
        <div className={styles.section}>
            <img src={dish.avatar.url} alt={dish.name} />
            <p>{dish.name}</p>
            <h5>{dish.price} DA</h5>
        </div>
    )
}
export default Section;