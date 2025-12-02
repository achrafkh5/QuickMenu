"use client";

import styles from "./main.module.css"
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";
import Cat from "./cat";
import Dish from "./dish";
import Image from "next/image";
import QRCodeDownload from "@/lib/QRCodeDownload";

function Main() {
    const[cat,setCat]=useState([]);
    const[dish,setDish]=useState([]);
    const[catin,setCatin]=useState("");
    const[dishPrice,setDishPrice]=useState("");
    const[dishin,setDishin]=useState("");
    const[file,setFile]=useState("");
    const[avatar,setAvatar]=useState([])
    const[dishPhoto,setDishPhoto]=useState("");
    const[pop,setPop]=useState(false);
    const[popDish,setPopDish]=useState(false);
    const[selectedProduct,setSelectedProduct]=useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [newPrice,setNewPrice] = useState("");
    const [popPrice,setPopPrice] = useState(false);
    const [slug,setSlug] = useState("");
    const [signout,setSignout] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [userId,setUserId]= useState("");
    const [reload, setReload] = useState(false);
    const [loadingCat, setLoadingCat] = useState(true);
    const [loadingDish, setLoadingDish] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const router = useRouter();

    // Prevent state updates after component unmount
    const isActive = useRef(true);
    useEffect(() => {
        isActive.current = true;
        return () => { isActive.current = false; };
    }, []);

useEffect(() => {
    const fetchData = async () => {
        
        try {
            const res = await fetch("/api/auth/get", {
                method: "GET",
                credentials: "include" // Send cookies with request
            });  
            const data = await res.json();

            if (res.ok && isActive.current) {
                setUserId(data.user._id);
                setSlug(data.user);
            } else {
                console.error("Error:", data.error || "Failed to fetch user");
            }
        } catch (err) {
            console.error("Error connecting to server:", err);
        }   
    };

    fetchData();
}, []); // [] makes sure it runs only once after mount

useEffect(()=>{
    const fetchCat = async() => {
        if(!userId) return;
        setLoadingCat(true);
        try{
            const res = await fetch(`/api/categories?id=${userId}`, {
                method: "GET",
                credentials: "include" // Send cookies with request
            });  
            const data = await res.json();

            if (res.ok && isActive.current) {
                const categories = Array.isArray(data) ? data : [];
                setCat(categories);
                setSelectedProduct(categories.length > 0 ? categories[0] : null);
            } else if (data?.error) {
                console.error("Error:", data.error);
                setCat([]);
                setSelectedProduct(null);
            }
        } catch (err) {
            console.error("Error connecting to server:", err);
        } finally {
            if (isActive.current) {
                setLoadingCat(false);
            }
        }
    };
    fetchCat();
},[userId])

useEffect(()=>{
    const fetchDish = async() => {
        if (!selectedProduct || !selectedProduct._id) {
            setDish([]);
            setLoadingDish(false);
            return;
        }
        setLoadingDish(true);
        try{
            const res = await fetch(`/api/dishes?id=${selectedProduct._id}`, {
                method: "GET",
                credentials: "include", // Send cookies with request
            });  
            const data = await res.json();

            if (res.ok && isActive.current) {
                setDish(Array.isArray(data) ? data : []);
            } else if (data?.error) {
                console.error("Error:", data.error);
            }
        } catch (err) {
            console.error("Error connecting to server:", err);
        } finally {
            if (isActive.current) {
                setLoadingDish(false);
            }
        }
    };
    fetchDish();
},[selectedProduct, isActive]);

    const handle = () =>setPop(true);
    const cancel = () =>{setPop(false); setCatin(""); setFile("")};
    const cancelDish = () =>{setPopDish(false); setDishin(""); setDishPhoto(""); setDishPrice("")}
    const addDish = () =>setPopDish(true);


    const submit = async () => {
  setLoadingModal(true);
  try {
    if (!catin || !file) {
      alert("you need to fill the inputs");
      setLoadingModal(false);
      return;
    }

    // First: upload image
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    const respond = await fetch("/api/upload", {
      method: "POST",
      body: uploadForm,
    });

    const uploadData = await respond.json();

    if (!respond.ok) {
      throw new Error(uploadData.error || "Image upload failed");
    }


    // Second: create category (JSON body)
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: catin,
        userId,
        avatar:uploadData.avatar,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Category creation failed");
    }

    setCat((prev) => Array.isArray(prev) ? [...prev, data.category] : [data.category]);
    
    // Select new category only if nothing selected yet
    setSelectedProduct(prev => prev ? prev : data.category);
    console.log("✅ category created successfully");
    if (isActive.current) {
      setFile("");
      setCatin("");
      setPop(false);
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (isActive.current) {
      setLoadingModal(false);
    }
  }
};


    const submitDish = async () => {
    setLoadingModal(true);

    if (!selectedProduct || !selectedProduct._id) {
        console.log("there is no selected product");
        setLoadingModal(false);
        return;
    }

    if (!dishin || !dishPhoto || !dishPrice) {
        alert("you need to fill the inputs");
        setLoadingModal(false);
        return;
    }

    try {
        const formData = new FormData();
        formData.append("file", dishPhoto);

    const respond = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await respond.json();

    if (!respond.ok) {
      throw new Error(uploadData.error || "Image upload failed");
    }


        const response = await fetch("/api/dishes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                name: dishin,
                price: dishPrice,
                userId,
                categoryId: selectedProduct._id,
                avatar: uploadData.avatar,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Error from server:", data.error || data);
            throw new Error("Network response was not ok");
        }

        console.log("Dish created successfully");
        setDish(prev => Array.isArray(prev) ? [...prev, data.dish] : [data.dish]);
        setReload(prev => !prev);
        if (isActive.current) {
            setDishin("");
            setDishPhoto("");
            setDishPrice("");
            setPopDish(false);
        }
    } catch (error) {
        console.error("Error creating dish:", error);
    } finally {
        if (isActive.current) {
            setLoadingModal(false);
        }
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
  if (!deleteTarget) return;

  setLoadingModal(true);
  try {
    if (deleteType === 'cat') {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("error deleting category", data.error);
      } else {
        setSelectedProduct(null);
        setCat(prev => prev.filter(d => d._id !== deleteTarget._id));
        setSelectedProduct(cat[0] || []);
      }
    } else if (deleteType === 'dish') {
      const res = await fetch("/api/dishes", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("error deleting dish", data.error);
      } else {
        console.log("category deleted with success");
        setDish(prev => prev.filter(d => d._id !== deleteTarget._id));
        setReload(prev => !prev);
      }
    }
  } catch (error) {
    console.log("error deleting", error);
  } finally {
    // Reset delete UI state here — runs once after the attempt (success or fail)
    if (isActive.current) {
      setConfirmDelete(false);
      setDeleteTarget(null);
      setDeleteType(null);
      setLoadingModal(false);
    }
  }
};


    const changePrice = (dish) => {
        setDeleteTarget(dish);
        setPopPrice(true)
    }

    const ConfirmPrice = async() => {
        setLoadingModal(true);
        try{
            const res = await fetch("/api/dishes", {
                method: "PUT",
                credentials:"include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id:deleteTarget._id,price:newPrice }),
            })
            
            const data = await res.json();

        if(data.error){
            console.log("error changing the price:",data.error);
            setLoadingModal(false);
            return;
        }
        setDish((prev) =>
            prev.map((dish) =>
                dish._id === deleteTarget._id
                    ? { ...dish, price: newPrice }
                    : dish
            )
        );
    }
        catch(error){
            console.log("error changing the price:",error);
            if (isActive.current) {
                setLoadingModal(false);
            }
            return;
        }
        
        if (isActive.current) {
            setNewPrice("");
            setPopPrice(false);
            setLoadingModal(false);
        }
    }
    
    const confirmSignOut = async() => {
        await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
        router.push("/login");
    };
    return(
        <div className={styles.body} >
            <button 
                className={styles.hamburger} 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
            >
                <i className={`${sidebarOpen ? 'fas fa-times' : 'fas fa-bars'}`}></i>
            </button>
            
            <div className={`${styles.logout} ${sidebarOpen ? styles.sidebarOpen : ''}`} onClick={() => setSignout(true)}>
                <i className="fas fa-sign-out-alt" style={{color:"white"}}></i>
            </div>
            
            {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>}
            
            <div className={`${styles.left} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <h4>Sidebar: Categories</h4>
                {slug && (
                    <div className={styles.logo}>
                    <img src={slug.avatar.url} alt={slug.username} />
                    <h3>{slug.username?.toUpperCase()}</h3>
                </div>)}
                <button onClick={handle} className={styles.addcat}><span><b>+</b></span> add categorie</button>
                <div className={styles.cat}>
                  <div className={styles.cat_filter}>
                    {loadingCat ? (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        padding: '3em 0',
                        color: '#667eea'
                      }}>
                        <FaSpinner className="fa-spin" style={{ fontSize: '2.5em' }} />
                      </div>
                    ) : cat.length > 0 ? (
                      cat.map(cats => (
                        <Cat
                          key={cats._id}
                          cats={cats}
                          reload={reload}
                          setReload={setReload}
                          onClick={() => { setSelectedProduct(cats); setSidebarOpen(false); }}
                          isSelected={selectedProduct?._id === cats._id}
                          onDeleteCat={() => handleDeleteCat(cats)}
                        />
                      ))
                    ) : null}
                  </div>
                </div>
                
                  {!loadingCat && cat?.length === 0 && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2em 1em',
                        margin: '1em 0'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto 1em',
                            background: '#f0f0f0',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="fas fa-folder-plus" style={{ 
                                fontSize: '2em', 
                                color: '#999'
                            }}></i>
                        </div>
                        <h3 style={{ 
                            margin: '0 0 0.5em 0', 
                            color: '#333',
                            fontSize: '1.2em',
                            fontWeight: '500'
                        }}>No Categories</h3>
                        <p style={{ 
                            fontSize: '0.9em', 
                            margin: '0',
                            color: '#666'
                        }}>Add a category to get started</p>
                    </div>
                  )}
            </div>

            <div className={styles.right}>
                <h4>Main Panel: Dishes in Selected Category</h4>
                
                {/* Always render a container to maintain stable DOM */}
                <div className={styles.categoryHeader}>
                    {selectedProduct?.avatar?.url && (
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
                    )}
                    
                    {!selectedProduct && cat.length === 0 && !loadingCat && (
                        <div style={{ textAlign: 'center', padding: '2em', color: '#888' }}>
                            <i className="fas fa-utensils" style={{ fontSize: '3em', marginBottom: '0.5em', color: '#999' }}></i>
                            <h3 style={{ color: '#666' }}>Build Your Menu</h3>
                            <p style={{ fontSize: '0.9em' }}>Create categories to organize your dishes</p>
                        </div>
                    )}
                    
                    {!selectedProduct && cat.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '2em', color: '#888' }}>
                            <i className="fas fa-hand-point-left" style={{ fontSize: '3em', marginBottom: '0.5em', color: '#999' }}></i>
                            <p style={{ fontSize: '0.95em', color: '#666' }}>Select a category from the sidebar</p>
                        </div>
                    )}
                </div>

                <div className={styles.dishes}>
                  {loadingDish ? (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      width: '100%',
                      padding: '5em 0',
                      color: '#ff6b6b'
                    }}>
                      <FaSpinner className="fa-spin" style={{ fontSize: '3em' }} />
                    </div>
                  ) : dish?.length > 0 ? (
                    dish.map(dish => (
                      <Dish
                        key={dish?._id}
                        dish={dish}
                        onDeleteDish={() => handleDeleteDish(dish)}
                        onChangePrice={() => changePrice(dish)}
                      />
                    ))
                  ) : null}
                </div>
                
                  {!loadingDish && (!dish || dish.length === 0) && selectedProduct && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '4em 2em',
                        color: '#888',
                        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                        borderRadius: '16px',
                        margin: '2em 0',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <i className="fas fa-pizza-slice" style={{ 
                            fontSize: '5em', 
                            marginBottom: '0.5em', 
                            color: '#ff6b6b',
                            opacity: 0.8
                        }}></i>
                        <h3 style={{ 
                            margin: '0.5em 0', 
                            color: '#2d3748',
                            fontSize: '1.8em',
                            fontWeight: '600'
                        }}>No Dishes Yet</h3>
                        <p style={{ 
                            fontSize: '1.1em',
                            margin: '1em 0',
                            color: '#4a5568',
                            lineHeight: '1.6'
                        }}>Start building your menu by adding delicious dishes to this category</p>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5em',
                            marginTop: '1.5em',
                            padding: '0.75em 1.5em',
                            background: '#ff6b6b',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '0.95em',
                            fontWeight: '500'
                        }}>
                            <i className="fas fa-arrow-down"></i>
                            <span>Click &ldquo;Add new Dish&rdquo; below</span>
                        </div>
                    </div>
                  )}
                
                {selectedProduct && (
                  <button className={styles.add} onClick={addDish}>Add new Dish</button>
                )}
                
                {cat.length > 0 && (
                  <div className={styles.west}>
                      <QRCodeDownload className={styles.qr} restaurantUrl={`https://quick-menu.vercel.app/code/${slug.slug}`} />
                      <Link href={`/code/${slug.slug}`} prefetch={true}><button className={styles.show}>see menu <i className="fas fa-book-open"></i></button></Link>
                  </div>
                )}
            </div>

            {/* Modal Root - All modals render here to prevent DOM reconciliation conflicts */}
            <div className={styles.modalRoot}>
                {/* Sign Out Confirmation Modal */}
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

                {/* Add Category Modal */}
                {pop && (
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
                                    <button className={styles.submit} onClick={submit} disabled={loadingModal} style={loadingModal ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
                                        {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8, fontSize: '1.2em', verticalAlign: 'middle' }} /> : null}
                                        Add
                                    </button>
                                    <button className={styles.cancel} onClick={cancel} disabled={loadingModal} style={loadingModal ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Dish Modal */}
                {popDish && (
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
                                    <button className={styles.submit} onClick={submitDish} disabled={loadingModal} style={loadingModal ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
                                        {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8, fontSize: '1.2em', verticalAlign: 'middle' }} /> : null}
                                        Add
                                    </button>
                                    <button className={styles.cancel} onClick={cancelDish} disabled={loadingModal} style={loadingModal ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {confirmDelete && (
                    <div className={styles["modal-overlay"]}>
                        <div className={styles["modal-center"]}>
                            <div className={styles.pop_dish}>
                                <p>Are you sure you want to delete this {deleteType === 'cat' ? 'category' : 'dish'}?</p>
                                <div className={styles["modal-actions"]}>
                                    <button className={styles.submit} onClick={confirmDeleteAction}>Yes</button>
                                    <button className={styles.cancel} onClick={() => setConfirmDelete(false)}>No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Price Modal */}
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
                                    <button className={styles.submit} onClick={ConfirmPrice} disabled={loadingModal} style={loadingModal ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
                                        {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8, fontSize: '1.2em', verticalAlign: 'middle' }} /> : null}
                                        Change
                                    </button>
                                    <button className={styles.cancel} onClick={() => {setPopPrice(false);setNewPrice("");}} disabled={loadingModal} style={loadingModal ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>Cancel</button>
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