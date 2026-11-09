"use client";

import styles from "./main.module.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";
import Cat from "./cat";
import Dish from "./dish";
import QRCodeDownload from "@/lib/QRCodeDownload";

function Main() {
    const [cat, setCat] = useState([]);
    const [dish, setDish] = useState([]);
    const [catin, setCatin] = useState("");
    const [dishPrice, setDishPrice] = useState("");
    const [dishin, setDishin] = useState("");
    const [file, setFile] = useState("");
    const [dishPhoto, setDishPhoto] = useState("");
    const [pop, setPop] = useState(false);
    const [popDish, setPopDish] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    const [popPrice, setPopPrice] = useState(false);
    const [slug, setSlug] = useState("");
    const [signout, setSignout] = useState(false);
    const [loadingModal, setLoadingModal] = useState(false);
    const [userId, setUserId] = useState("");
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
    }, []);

    useEffect(() => {
        const fetchCat = async () => {
            if (!userId) return;
            setLoadingCat(true);
            try {
                const res = await fetch(`/api/categories?id=${userId}`, {
                    method: "GET",
                    credentials: "include"
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
    }, [userId]);

    useEffect(() => {
        const fetchDish = async () => {
            if (!selectedProduct || !selectedProduct._id) {
                setDish([]);
                setLoadingDish(false);
                return;
            }
            setLoadingDish(true);
            try {
                const res = await fetch(`/api/dishes?id=${selectedProduct._id}`, {
                    method: "GET",
                    credentials: "include",
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
    }, [selectedProduct]);

    const handle = () => setPop(true);
    const cancel = () => { setPop(false); setCatin(""); setFile(""); };
    const cancelDish = () => { setPopDish(false); setDishin(""); setDishPhoto(""); setDishPrice(""); };
    const addDish = () => setPopDish(true);

    const submit = async () => {
        setLoadingModal(true);
        try {
            if (!catin || !file) {
                alert("you need to fill the inputs");
                setLoadingModal(false);
                return;
            }

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

            const res = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: catin,
                    userId,
                    avatar: uploadData.avatar,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Category creation failed");
            }

            setCat((prev) => Array.isArray(prev) ? [...prev, data.category] : [data.category]);
            setSelectedProduct(prev => prev ? prev : data.category);

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

    const handleDeleteCat = (catItem) => {
        setDeleteTarget(catItem);
        setDeleteType('cat');
        setConfirmDelete(true);
    };

    const handleDeleteDish = (dishItem) => {
        setDeleteTarget(dishItem);
        setDeleteType('dish');
        setConfirmDelete(true);
    };

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
                    const remaining = cat.filter(d => d._id !== deleteTarget._id);
                    setCat(remaining);
                    setSelectedProduct(remaining.length > 0 ? remaining[0] : null);
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
                    setDish(prev => prev.filter(d => d._id !== deleteTarget._id));
                    setReload(prev => !prev);
                }
            }
        } catch (error) {
            console.log("error deleting", error);
        } finally {
            if (isActive.current) {
                setConfirmDelete(false);
                setDeleteTarget(null);
                setDeleteType(null);
                setLoadingModal(false);
            }
        }
    };

    const changePrice = (dishItem) => {
        setDeleteTarget(dishItem);
        setNewPrice(dishItem?.price || "");
        setPopPrice(true);
    };

    const ConfirmPrice = async () => {
        setLoadingModal(true);
        try {
            const res = await fetch("/api/dishes", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: deleteTarget._id, price: newPrice }),
            });
            
            const data = await res.json();

            if (data.error) {
                console.log("error changing the price:", data.error);
                setLoadingModal(false);
                return;
            }

            setDish((prev) =>
                prev.map((dishItem) =>
                    dishItem._id === deleteTarget._id
                        ? { ...dishItem, price: newPrice }
                        : dishItem
                )
            );
        } catch (error) {
            console.log("error changing the price:", error);
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
    };

    const confirmSignOut = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
        });
        router.push("/login");
    };

    return (
        <div className={styles.body}>
            {/* Mobile Hamburger Toggle */}
            <button 
                className={styles.hamburger} 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
            >
                <i className={sidebarOpen ? "fas fa-times" : "fas fa-bars"}></i>
            </button>
            
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>
            )}
            
            {/* Left Sidebar */}
            <aside className={`${styles.left} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                {/* Brand Logo */}
                <div className={styles.brandHeader}>
                    <div className={styles.brandLogo}>
                        <i className="fas fa-qrcode"></i>
                        <span>QuickMenu</span>
                    </div>
                </div>

                {/* Restaurant Profile Card */}
                {slug && (
                    <div className={styles.restaurantCard}>
                        {slug.avatar?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={slug.avatar.url} alt={slug.username || 'Restaurant'} className={styles.restaurantAvatar} />
                        ) : (
                            <div className={styles.restaurantAvatarPlaceholder}>
                                <i className="fas fa-store"></i>
                            </div>
                        )}
                        <div className={styles.restaurantInfo}>
                            <span className={styles.restaurantBadge}>RESTAURANT</span>
                            <h3 className={styles.restaurantName}>{slug.username?.toUpperCase()}</h3>
                        </div>
                    </div>
                )}

                {/* Categories Section Header */}
                <div className={styles.categoriesHeader}>
                    <span className={styles.categoriesSectionTitle}>CATEGORIES</span>
                    <button onClick={handle} className={styles.addcat} title="Add new category">
                        <i className="fas fa-plus"></i>
                        <span>New</span>
                    </button>
                </div>

                {/* Categories List */}
                <div className={styles.cat}>
                    <div className={styles.cat_filter}>
                        {loadingCat ? (
                            <div className={styles.loadingSidebar}>
                                <FaSpinner className={styles.spinner} />
                                <span>Loading categories...</span>
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

                    {!loadingCat && cat?.length === 0 && (
                        <div className={styles.emptyCategories}>
                            <div className={styles.emptyCategoriesIcon}>
                                <i className="fas fa-folder-plus"></i>
                            </div>
                            <h4>No Categories Yet</h4>
                            <p>Add a category to start building your restaurant menu.</p>
                            <button onClick={handle} className={styles.emptyAddBtn}>
                                <i className="fas fa-plus"></i>
                                <span>Add Category</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Footer with Sign Out */}
                <div className={styles.sidebarFooter}>
                    <button className={styles.signoutBtn} onClick={() => setSignout(true)}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Right Main Panel */}
            <main className={styles.right}>
                {/* Top Bar with actions */}
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        <h1 className={styles.dashboardTitle}>Menu Dashboard</h1>
                        <p className={styles.dashboardSubtitle}>
                            Manage and organize your categories and dishes for your live menu
                        </p>
                    </div>

                    {slug?.slug && (
                        <div className={styles.topBarRight}>
                            <QRCodeDownload 
                                className={styles.qr} 
                                restaurantUrl={`https://quick-menu.vercel.app/code/${slug.slug}`} 
                            />
                            <Link 
                                href={`/code/${slug.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                prefetch={true} 
                                className={styles.liveMenuLink}
                            >
                                <button className={styles.show}>
                                    <i className="fas fa-book-open"></i>
                                    <span>View Live Menu</span>
                                </button>
                            </Link>
                        </div>
                    )}
                </header>

                {/* Category Banner */}
                <div className={styles.categoryHeader}>
                    {selectedProduct && (
                        <div className={styles.selectedCatBanner}>
                            <div className={styles.selectedCatLeft}>
                                {selectedProduct?.avatar?.url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={selectedProduct.avatar.url}
                                        alt={selectedProduct.name || 'Category'}
                                        className={styles.selectedCatImg}
                                    />
                                ) : (
                                    <div className={styles.selectedCatPlaceholder}>
                                        <i className="fas fa-utensils"></i>
                                    </div>
                                )}
                                <div className={styles.selectedCatDetails}>
                                    <span className={styles.selectedCatPill}>Active Category</span>
                                    <h2 className={styles.selectedCatTitle}>{selectedProduct.name}</h2>
                                    <span className={styles.selectedCatCount}>
                                        {loadingDish ? "Loading dishes..." : `${dish?.length || 0} ${dish?.length === 1 ? 'dish' : 'dishes'}`}
                                    </span>
                                </div>
                            </div>
                            <button className={styles.addDishBtn} onClick={addDish}>
                                <i className="fas fa-plus"></i>
                                <span>Add New Dish</span>
                            </button>
                        </div>
                    )}

                    {!selectedProduct && cat.length === 0 && !loadingCat && (
                        <div className={styles.mainEmptyState}>
                            <div className={styles.mainEmptyIcon}>
                                <i className="fas fa-utensils"></i>
                            </div>
                            <h3>Welcome to Your Menu Manager</h3>
                            <p>Start by creating your first category in the sidebar to organize your dishes.</p>
                            <button onClick={handle} className={styles.primaryActionBtn}>
                                <i className="fas fa-plus"></i>
                                <span>Create Category</span>
                            </button>
                        </div>
                    )}

                    {!selectedProduct && cat.length > 0 && !loadingCat && (
                        <div className={styles.mainEmptyState}>
                            <div className={styles.mainEmptyIcon}>
                                <i className="fas fa-arrow-left"></i>
                            </div>
                            <h3>Select a Category</h3>
                            <p>Choose a category from the sidebar to view and manage its dishes.</p>
                        </div>
                    )}
                </div>

                {/* Dishes Grid */}
                <div className={styles.dishes}>
                    {loadingDish ? (
                        <div className={styles.dishLoader}>
                            <FaSpinner className={styles.spinner} />
                            <p>Loading dishes...</p>
                        </div>
                    ) : dish?.length > 0 ? (
                        dish.map(item => (
                            <Dish
                                key={item?._id}
                                dish={item}
                                onDeleteDish={() => handleDeleteDish(item)}
                                onChangePrice={() => changePrice(item)}
                            />
                        ))
                    ) : null}
                </div>

                {/* Empty dishes state */}
                {!loadingDish && (!dish || dish.length === 0) && selectedProduct && (
                    <div className={styles.noDishesCard}>
                        <div className={styles.noDishesIcon}>
                            <i className="fas fa-bowl-food"></i>
                        </div>
                        <h3>No Dishes in &ldquo;{selectedProduct.name}&rdquo;</h3>
                        <p>
                            Start building your menu by adding delicious dishes with photos and prices to this category.
                        </p>
                        <button className={styles.addDishBtn} onClick={addDish}>
                            <i className="fas fa-plus"></i>
                            <span>Add First Dish</span>
                        </button>
                    </div>
                )}

                {/* Mobile Bottom Quick Actions */}
                {cat.length > 0 && slug?.slug && (
                    <div className={styles.west}>
                        <QRCodeDownload 
                            className={styles.qr} 
                            restaurantUrl={`https://quick-menu.vercel.app/code/${slug.slug}`} 
                        />
                        <Link href={`/code/${slug.slug}`} prefetch={true}>
                            <button className={styles.show}>
                                <i className="fas fa-book-open"></i>
                                <span>See Live Menu</span>
                            </button>
                        </Link>
                    </div>
                )}
            </main>

            {/* Modal Root */}
            <div className={styles.modalRoot}>
                {/* Sign Out Confirmation Modal */}
                {signout && (
                    <div className={styles["modal-overlay"]}>
                        <div className={styles["modal-center"]}>
                            <div className={styles.pop_dish}>
                                <div className={styles.modalIconWrap}>
                                    <i className="fas fa-sign-out-alt"></i>
                                </div>
                                <div className={styles["modal-title"]}>Sign Out</div>
                                <p>Are you sure you want to sign out from your restaurant dashboard?</p>
                                <div className={styles["modal-actions"]}>
                                    <button className={styles.cancel} onClick={() => setSignout(false)}>Cancel</button>
                                    <button className={styles.submit} onClick={confirmSignOut}>Yes, Sign Out</button>
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
                                <input 
                                    className={styles.citib} 
                                    id="catin" 
                                    type="text" 
                                    placeholder="Enter category name (e.g., Pizza, Burgers)" 
                                    value={catin} 
                                    onChange={(e) => setCatin(e.target.value)}
                                />
                                <div className={styles.inside_photo}>
                                    <label className={styles.fileLabel} htmlFor="catphoto">
                                        <i className="fas fa-image" style={{ marginRight: '8px' }}></i>
                                        <span>Upload a photo</span>
                                    </label>
                                    <input 
                                        className={styles.catphoto} 
                                        id="catphoto" 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setFile(e.target.files[0])}
                                    />
                                    {file && <span className={styles.fileName}>{file.name}</span>}
                                </div>
                                <div className={styles["modal-actions"]}>
                                    <button 
                                        className={styles.cancel} 
                                        onClick={cancel} 
                                        disabled={loadingModal}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={styles.submit} 
                                        onClick={submit} 
                                        disabled={loadingModal}
                                    >
                                        {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8 }} /> : null}
                                        Add Category
                                    </button>
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
                                <input 
                                    className={styles.citib} 
                                    id="dishin" 
                                    type="text" 
                                    placeholder="Enter dish name (e.g., Margherita Pizza)" 
                                    value={dishin} 
                                    onChange={(e) => setDishin(e.target.value)}
                                />
                                <div className={styles.inside_photo}>
                                    <label className={styles.fileLabel} htmlFor="dishphoto">
                                        <i className="fas fa-image" style={{ marginRight: '8px' }}></i>
                                        <span>Upload photo</span>
                                    </label>
                                    <input 
                                        className={styles.catphoto} 
                                        id="dishphoto" 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setDishPhoto(e.target.files[0])}
                                    />
                                    {dishPhoto && <span className={styles.fileName}>{dishPhoto.name}</span>}
                                </div>
                                <div className={styles.priceInputWrap}>
                                    <input 
                                        className={styles.citib} 
                                        type="number" 
                                        placeholder="Price" 
                                        value={dishPrice} 
                                        onChange={(e) => setDishPrice(e.target.value)}
                                    />
                                    <span className={styles.inputCurrency}>DA</span>
                                </div>
                                <div className={styles["modal-actions"]}>
                                    <button 
                                        className={styles.cancel} 
                                        onClick={cancelDish} 
                                        disabled={loadingModal}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={styles.submit} 
                                        onClick={submitDish} 
                                        disabled={loadingModal}
                                    >
                                        {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8 }} /> : null}
                                        Add Dish
                                    </button>
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
                                <div className={styles.modalIconWrapWarn}>
                                    <i className="fas fa-trash-alt"></i>
                                </div>
                                <div className={styles["modal-title"]}>Delete Confirmation</div>
                                <p>
                                    Are you sure you want to delete this {deleteType === 'cat' ? 'category' : 'dish'}?
                                    {deleteType === 'cat' ? ' (All dishes inside will remain in the database)' : ''}
                                </p>
                                <div className={styles["modal-actions"]}>
                                    <button 
                                        className={styles.cancel} 
                                        onClick={() => setConfirmDelete(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={styles.submitDelete} 
                                        onClick={confirmDeleteAction} 
                                        disabled={loadingModal}
                                    >
                                        {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8 }} /> : null}
                                        Delete
                                    </button>
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
                                <div className={styles.modalIconWrap}>
                                    <i className="fas fa-tag"></i>
                                </div>
                                <div className={styles["modal-title"]}>Update Price</div>
                                <p>Enter the new price for <b>{deleteTarget?.name}</b>:</p>
                                <div className={styles.priceInputWrap}>
                                    <input
                                        className={styles.citib}
                                        type="number"
                                        placeholder="New price"
                                        value={newPrice}
                                        onChange={e => setNewPrice(e.target.value)}
                                        autoFocus
                                    />
                                    <span className={styles.inputCurrency}>DA</span>
                                </div>
                                <div className={styles["modal-actions"]}>
                                    <button 
                                        className={styles.cancel} 
                                        onClick={() => { setPopPrice(false); setNewPrice(""); }} 
                                        disabled={loadingModal}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className={styles.submit} 
                                        onClick={ConfirmPrice} 
                                        disabled={loadingModal}
                                    >
                                        {loadingModal ? <FaSpinner className={styles.spinner} style={{ marginRight: 8 }} /> : null}
                                        Save Price
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Main;