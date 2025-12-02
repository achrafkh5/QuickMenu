"use client";

import styles from "./main.module.css"
import { useState,useEffect,useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";
import Cat from "./cat";
import Dish from "./dish";
import QRCodeDownload from "@/lib/QRCodeDownload";

function Main() {
    const[cat,setCat]=useState([]);
    const[dish,setDish]=useState([]);
    const[catin,setCatin]=useState("");
    const[dishPrice,setDishPrice]=useState("");
    const[dishin,setDishin]=useState("");
    const[file,setFile]=useState(null);
    const[avatar,setAvatar]=useState([])
    const[dishPhoto,setDishPhoto]=useState(null);
    const[pop,setPop]=useState(false);
    const[popDish,setPopDish]=useState(false);
    const[selectedProduct,setSelectedProduct]=useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [newPrice,setNewPrice] = useState("");
    const [popPrice,setPopPrice] = useState(false);
    const [slug,setSlug] = useState("");
    const [user,setUser] = useState(null);
    const [signout,setSignout] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [userId,setUserId]= useState("");
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isOperating, setIsOperating] = useState(false);
    const hasInitialized = useRef(false);

    const router = useRouter();

useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const res = await fetch("/api/auth/get", {
                method: "GET",
                credentials: "include"
            });  

            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/login");
                    return;
                }
                throw new Error("Failed to fetch user data");
            }

            const data = await res.json();
            
            if (data?.user?._id && data?.user?.slug) {
                setUserId(data.user._id);
                setSlug(data.user.slug);
                setUser(data.user);
            } else {
                throw new Error("Invalid user data received");
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            setError("Failed to load user data. Please refresh the page.");
            
            // Retry logic
            if (retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [retryCount, router]);

useEffect(()=>{
    const fetchCat = async() => {
        if(!userId) return;
        
        try{
            const res = await fetch(`/api/categories?id=${userId}`, {
                method: "GET",
                credentials: "include"
            });  

            if (!res.ok) {
                throw new Error("Failed to fetch categories");
            }

            const data = await res.json();
            
            if (Array.isArray(data)) {
                setCat(data);
            } else {
                setCat([]);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            setCat([]);
        }
    };
    fetchCat();
},[userId])

// Auto-select first category after categories are loaded and component is stable
useEffect(() => {
    if (cat.length > 0 && !selectedProduct && !hasInitialized.current && !loading) {
        hasInitialized.current = true;
        // Use a microtask to defer the selection
        Promise.resolve().then(() => {
            setSelectedProduct(cat[0]);
        });
    }
}, [cat, selectedProduct, loading]);

useEffect(()=>{
    const fetchDish = async() => {
        if (!selectedProduct?._id) {
            setDish([]);
            return;
        }
        
        try{
            const res = await fetch(`/api/dishes?id=${selectedProduct._id}`, {
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
},[selectedProduct])

    const handle = () =>setPop(true);
    const cancel = () =>{setPop(false); setCatin(""); setFile(null)};
    const cancelDish = () =>{setPopDish(false); setDishin(""); setDishPhoto(null); setDishPrice("")}
    const addDish = () =>setPopDish(true);


    const submit = async () => {
  setLoadingModal(true);
  setIsOperating(true);
  
  try {
    // Validation
    if (!catin?.trim()) {
      alert("Please enter a category name");
      return;
    }
    
    if (!file) {
      alert("Please select an image");
      return;
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Upload image
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const uploadData = await uploadRes.json();
      throw new Error(uploadData.error || "Image upload failed");
    }

    const uploadData = await uploadRes.json();
    
    if (!uploadData?.avatar) {
      throw new Error("Invalid upload response");
    }

    // Create category
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: catin.trim(),
        userId,
        avatar: uploadData.avatar,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Category creation failed");
    }

    const data = await res.json();
    
    if (!data?.category) {
      throw new Error("Invalid response from server");
    }

    // Use function-based setState for consistency
    setCat((prev) => {
      const newCat = [...prev, data.category];
      // If this is the first category, select it
      if (prev.length === 0) {
        setSelectedProduct(data.category);
      }
      return newCat;
    });
    
    // Close modal and reset form
    setPop(false);
    setFile(null);
    setCatin("");
    
    console.log("✅ Category created successfully");
  } catch (error) {
    console.error("Error creating category:", error);
    alert(error.message || "Failed to create category. Please try again.");
  } finally {
    setLoadingModal(false);
    setIsOperating(false);
  }
};


    const submitDish = async () => {
    setLoadingModal(true);
    setIsOperating(true);

    try {
        // Validation
        if (!selectedProduct?._id) {
            alert("Please select a category first");
            return;
        }

        if (!dishin?.trim()) {
            alert("Please enter a dish name");
            return;
        }

        if (!dishPhoto) {
            alert("Please select an image");
            return;
        }

        if (!dishPrice || isNaN(dishPrice) || parseFloat(dishPrice) <= 0) {
            alert("Please enter a valid price greater than 0");
            return;
        }

        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(dishPhoto.type)) {
            alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
            return;
        }

        // Validate file size (5MB max)
        if (dishPhoto.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
        }

        // Upload image
        const formData = new FormData();
        formData.append("file", dishPhoto);

        const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!uploadRes.ok) {
            const uploadData = await uploadRes.json();
            throw new Error(uploadData.error || "Image upload failed");
        }

        const uploadData = await uploadRes.json();
        
        if (!uploadData?.avatar) {
            throw new Error("Invalid upload response");
        }

        // Create dish
        const response = await fetch("/api/dishes", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: dishin.trim(),
                price: parseFloat(dishPrice),
                userId,
                categoryId: selectedProduct._id,
                avatar: uploadData.avatar,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to create dish");
        }

        const data = await response.json();
        
        if (!data?.dish) {
            throw new Error("Invalid response from server");
        }

        // Use function-based setState for consistency
        setDish(prev => [...prev, data.dish]);
        setReload(prev => !prev);
        
        // Close modal and reset form
        setPopDish(false);
        setDishin("");
        setDishPhoto(null);
        setDishPrice("");
        
        console.log("✅ Dish created successfully");
    } catch (error) {
        console.error("Error creating dish:", error);
        alert(error.message || "Failed to create dish. Please try again.");
    } finally {
        setLoadingModal(false);
        setIsOperating(false);
    }
};

    // Delete handlers
    const handleDeleteCat = (cat) => {
        setDeleteTarget(cat);
        setDeleteType('cat');
        setConfirmDelete(true);
    };
    const handleDeleteDish = (dish) => {
        setDeleteTarget(dish);
        setDeleteType('dish');
        setConfirmDelete(true);
    };

    
    // Confirm delete
   const confirmDeleteAction = async () => {
  if (!deleteTarget?._id) return;

  setLoadingModal(true);
  setIsOperating(true);
  
  try {
    if (deleteType === 'cat') {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget._id }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete category");
      }
      
      const updatedCat = cat.filter(c => c._id !== deleteTarget._id);
      setCat(updatedCat);
      
      // Update selected product
      if (selectedProduct?._id === deleteTarget._id) {
        setSelectedProduct(updatedCat[0] || null);
      }
      
      console.log("✅ Category deleted successfully");
    } else if (deleteType === 'dish') {
      const res = await fetch("/api/dishes", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget._id }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete dish");
      }
      
      setDish(prev => prev.filter(d => d._id !== deleteTarget._id));
      setReload(prev => !prev);
      
      console.log("✅ Dish deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting:", error);
    alert(error.message || "Failed to delete. Please try again.");
  } finally {
    setConfirmDelete(false);
    setDeleteTarget(null);
    setDeleteType(null);
    setLoadingModal(false);
    setIsOperating(false);
  }
};


    const changePrice = (dish) => {
        setDeleteTarget(dish);
        setPopPrice(true)
    }

    const ConfirmPrice = async() => {
        setLoadingModal(true);
        setIsOperating(true);
        
        try {
            // Validation
            if (!deleteTarget?._id) {
                alert("No dish selected");
                return;
            }
            
            if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) {
                alert("Please enter a valid price greater than 0");
                return;
            }

            const res = await fetch("/api/dishes", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    id: deleteTarget._id,
                    price: parseFloat(newPrice)
                }),
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update price");
            }

            setDish((prev) =>
                prev.map((dish) =>
                    dish._id === deleteTarget._id
                        ? { ...dish, price: parseFloat(newPrice) }
                        : dish
                )
            );
            
            setNewPrice("");
            setPopPrice(false);
            
            console.log("✅ Price updated successfully");
        } catch(error) {
            console.error("Error updating price:", error);
            alert(error.message || "Failed to update price. Please try again.");
        } finally {
            setLoadingModal(false);
            setIsOperating(false);
        }
    }
    
    const confirmSignOut = async() => {
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            
            if (!res.ok) {
                console.error("Logout failed, but redirecting anyway");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            router.push("/login");
        }
    };
    
    // Loading screen
    if (loading) {
        return (
            <div className={styles.body} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <FaSpinner className={styles.spinner} style={{ fontSize: '3em' }} />
                <p style={{ marginLeft: '1em' }}>Loading...</p>
            </div>
        );
    }

    // Error screen
    if (error && !userId) {
        return (
            <div className={styles.body} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '2em' }}>
                <p style={{ color: 'red', marginBottom: '1em' }}>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.submit}>Retry</button>
            </div>
        );
    }

    return(
        <div className={styles.body} >
            <div className={styles.logout} onClick={() => setSignout(true)}>
                <i className="fas fa-sign-out-alt" style={{color:"white"}}></i>
            </div>
            {signout && (
  <div className={styles["modal-overlay"]}>
    <div className={styles["modal-center"]}>
      <div className={styles.pop_dish}>
        <p>Are you sure you want to <b>SIGN OUT</b></p>
        <div className={styles["modal-actions"]}>
          <button className={styles.submit} onClick={confirmSignOut}>Yes</button>
          <button className={styles.cancel} onClick={() => setSignout(false)}>No</button>
        </div>
      </div>
    </div>
  </div>
)}
            <div className={styles.left}>
                <h4>Sidebar: Categories</h4>
                {user && user.avatar?.url ? (
                    <div className={styles.logo}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={user.avatar.url} 
                            alt={user.username || 'User'} 
                            width={100} 
                            height={100} 
                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <h3>{user.username?.toUpperCase()}</h3>
                    </div>
                ) : (
                    <div className={styles.logo} style={{ textAlign: 'center', padding: '1em' }}>
                        <i className="fas fa-user-circle" style={{ fontSize: '3em', marginBottom: '0.5em', color: '#666' }}></i>
                        <h3>Welcome!</h3>
                    </div>
                )}
                <button onClick={handle} className={styles.addcat} disabled={isOperating}><span><b>+</b></span> add categorie</button>
                {!loading && pop && (
                    <div className={styles["modal-overlay"]}>
                <div className={styles["modal-center"]}>
      <div className={styles["modal-title"]}>Add New Category</div>
      <div className={styles["modal-form"]}>
        <input className={styles.citib} id="catin" type="text" placeholder="Enter the name of the category" value={catin} onChange={(e) => setCatin(e.target.value)}/>
        <div className={styles.inside_photo}>
            <label className={styles.fileLabel} htmlFor="catphoto">Upload a photo</label>
            <input className={styles.catphoto} id="catphoto" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])}/>
            {file && <span className={styles.fileName}>{file.name}</span>}
        </div>
        <div className={styles["modal-actions"]}>
          <button className={styles.submit} onClick={submit} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
            {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8, fontSize: '1.2em', verticalAlign: 'middle' }} /> : null}
            Add
          </button>
          <button className={styles.cancel} onClick={cancel} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
                )}
                <div className={styles.cat}>
                        {Array.isArray(cat) && cat.length > 0 ? (
                            <div className={styles.cat_filter}>
                                {cat.map((category, index) => (
                            <Cat 
                                key={category?._id || `cat-${index}`} 
                                cats={category} 
                                reload={reload} 
                                setReload={setReload} 
                                onClick={() => {
                                    setSelectedProduct(category);
                                }}
                                isSelected={selectedProduct?._id === category._id}
                                onDeleteCat={() => handleDeleteCat(category)}
                                isOperating={isOperating}
                            />
                        ))}
                            </div>
                        ) : (
                    <div style={{ textAlign: 'center', padding: '2em 1em', color: '#888' }}>
                        <i className="fas fa-folder-open" style={{ fontSize: '4em', marginBottom: '0.3em', color: '#999' }}></i>
                        <h3 style={{ margin: '0.5em 0', color: '#666' }}>No Categories Yet</h3>
                        <p style={{ fontSize: '0.9em', margin: '0.5em 0' }}>Start by creating your first category</p>
                        <p style={{ fontSize: '0.85em', marginTop: '1em' }}><i className="fas fa-arrow-up"></i> Click &ldquo;add categorie&rdquo; above</p>
                    </div>
                )}
                </div>
            </div>

            <div className={styles.right}>
                <h4>Main Panel: Dishes in Selected Category</h4>
            
                {selectedProduct && selectedProduct.avatar?.url ? (
                    <div className={styles.left_center}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={selectedProduct.avatar.url} 
                        alt={selectedProduct.name || 'Category'} 
                        width={100} 
                        height={100} 
                        style={{ borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <h4>Product: {selectedProduct.name}</h4>
                </div>
                ): cat.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2em', color: '#888' }}>
                        <i className="fas fa-utensils" style={{ fontSize: '3em', marginBottom: '0.5em', color: '#999' }}></i>
                        <h3 style={{ color: '#666' }}>Build Your Menu</h3>
                        <p style={{ fontSize: '0.9em' }}>Create categories to organize your dishes</p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2em', color: '#888' }}>
                        <i className="fas fa-hand-point-left" style={{ fontSize: '3em', marginBottom: '0.5em', color: '#999' }}></i>
                        <p style={{ fontSize: '0.95em', color: '#666' }}>Select a category from the sidebar</p>
                    </div>
                )}
                {selectedProduct && Array.isArray(dish) && dish.length > 0 ? (
                    <div className={styles.dishes}>
                        {dish.map((dishItem, index) => (
                            <Dish 
                                key={dishItem?._id || `dish-${index}`} 
                                dish={dishItem} 
                                onDeleteDish={() => handleDeleteDish(dishItem)} 
                                onChangePrice={() => changePrice(dishItem)} 
                                isOperating={isOperating}
                            />
                        ))}
                    </div>
                ): selectedProduct && dish?.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2em', color: '#888' }}>
                        <i className="fas fa-pizza-slice" style={{ fontSize: '3.5em', marginBottom: '0.5em', color: '#999' }}></i>
                        <h3 style={{ margin: '0.5em 0', color: '#666' }}>No Dishes Yet</h3>
                        <p style={{ fontSize: '0.9em' }}>Add your first dish to this category</p>
                        <p style={{ fontSize: '0.85em', marginTop: '1em' }}><i className="fas fa-arrow-down"></i> Click &ldquo;Add new Dish&rdquo; below</p>
                    </div>
                ) : null}
                
                
                {selectedProduct && <button className={styles.add} onClick={addDish} disabled={isOperating}>Add new Dish</button>}
                <div className={styles.west}>
                    {slug && cat.length > 0 && (
                        <>
                            <QRCodeDownload className={styles.qr} restaurantUrl={`https://quick-menu.vercel.app/code/${slug}`} />
                            <Link href={`/code/${slug}`} prefetch={true}><button className={styles.show}>see menu <i className="fas fa-book-open"></i></button></Link>
                        </>
                    )}
                </div>
                {!loading && popDish && (
  <div className={styles["modal-overlay"]}>
    <div className={styles["modal-center"]}>
      <div className={styles["modal-title"]}>Add New Dish</div>
      <div className={styles["modal-form"]}>
        <input className={styles.citib} id="catin" type="text" placeholder="Enter the name of the dish" value={dishin} onChange={(e) => setDishin(e.target.value)}/>
        <div className={styles.inside_photo}>
            <label className={styles.fileLabel} htmlFor="dishphoto">Upload a photo</label>
            <input className={styles.catphoto} id="dishphoto" type="file" accept="image/*" onChange={(e) => setDishPhoto(e.target.files[0])}/>
            {dishPhoto && <span className={styles.fileName}>{dishPhoto.name}</span>}
        </div>
        <input className={styles.citib} id="catin" type="number" placeholder="Enter the price" value={dishPrice} onChange={(e) => setDishPrice(e.target.value)}/>
        <div className={styles["modal-actions"]}>
          <button className={styles.submit} onClick={submitDish} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
            {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8, fontSize: '1.2em', verticalAlign: 'middle' }} /> : null}
            Add
          </button>
          <button className={styles.cancel} onClick={cancelDish} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}
{confirmDelete && (
  <div className={styles["modal-overlay"]}>
    <div className={styles["modal-center"]}>
      <div className={styles.pop_dish}>
        <p>Are you sure you want to delete this {deleteType === 'cat' ? 'category' : 'dish'}?</p>
        {deleteType === 'cat' && <p style={{ fontSize: '0.9em', color: '#ff6b6b', marginTop: '0.5em' }}>⚠️ This will also delete all dishes in this category and their images</p>}
        <div className={styles["modal-actions"]}>
          <button className={styles.submit} onClick={confirmDeleteAction} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
            {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8, fontSize: '1.2em', verticalAlign: 'middle' }} /> : null}
            Yes
          </button>
          <button className={styles.cancel} onClick={() => setConfirmDelete(false)} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>No</button>
        </div>
      </div>
    </div>
  </div>
)}
{popPrice && (
  <div className={styles["modal-overlay"]}>
    <div className={styles["modal-center"]}>
      <div className={styles.pop_dish}>
        <p>Enter new price for <b>{deleteTarget?.name}</b>:</p>
        <input
          className={styles.citib}
          type="number"
          placeholder="New price"
          value={newPrice}
          onChange={e => setNewPrice(e.target.value)}
        />
        <div className={styles["modal-actions"]}>
          <button className={styles.submit} onClick={ConfirmPrice} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
            {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8, fontSize: '1.2em', verticalAlign: 'middle' }} /> : null}
            Change
          </button>
          <button className={styles.cancel} onClick={() => {setPopPrice(false);setNewPrice("");}} disabled={loadingModal || isOperating} style={(loadingModal || isOperating) ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>Cancel</button>
        </div>
      </div>
    </div>
  </div>
)}
            </div>

        </div>
    )
}
export default Main;