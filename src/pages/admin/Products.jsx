import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext'; // On récupère tes catégories ici
import { Plus, Trash2, Package, Image as ImageIcon, Link as LinkIcon, Check, X, UploadCloud, AlertCircle, Filter } from 'lucide-react';

const Products = () => {
  const { config } = useConfig(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Filtre local pour l'admin
  const [categoryFilter, setCategoryFilter] = useState('Tous');

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '', 
    description: '',
    imageType: 'url',
    imageUrl: '',
    imageFile: null,
    inStock: true
  });

  // Récupération des produits en temps réel
  useEffect(() => {
    // On trie par nom ou date si tu préfères. Ici ordre par défaut.
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- GESTION AJOUT PRODUIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
        alert("Veuillez sélectionner une catégorie.");
        return;
    }

    setUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload Image si nécessaire
      if (formData.imageType === 'file' && formData.imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${formData.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, formData.imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Enregistrement Firestore
      await addDoc(collection(db, "products"), {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category, // On enregistre le NOM de la catégorie
        description: formData.description,
        image: finalImageUrl || 'https://placehold.co/400x300?text=No+Image', // Image par défaut si vide
        inStock: formData.inStock,
        createdAt: new Date()
      });

      setIsModalOpen(false);
      // Reset form
      setFormData({ 
        name: '', price: '', category: '', description: '', 
        imageType: 'url', imageUrl: '', imageFile: null, inStock: true 
      });

    } catch (error) {
      console.error("Erreur ajout:", error);
      alert("Erreur lors de l'ajout du produit");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const toggleStock = async (product) => {
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, { inStock: !product.inStock });
    } catch (error) {
      console.error("Erreur update stock:", error);
    }
  };

  // Filtrage local pour l'affichage admin
  const filteredProducts = categoryFilter === 'Tous' 
    ? products 
    : products.filter(p => p.category === categoryFilter);

  return (
    <div className="pb-24 max-w-6xl mx-auto px-4">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Package className="text-brand-brown"/> Gestion Produits
           </h1>
           <p className="text-sm text-gray-500">{products.length} produit(s) au total</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            {/* Filtre Admin Rapide */}
            <div className="relative flex-1 md:flex-none">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full md:w-48 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-brown/20"
                >
                    <option value="Tous">Toutes catégories</option>
                    {config.categories?.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <button 
                onClick={() => setIsModalOpen(true)} 
                className="bg-brand-brown text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition shadow-lg whitespace-nowrap"
            >
              <Plus size={20}/> <span className="hidden sm:inline">Ajouter</span>
            </button>
        </div>
      </div>

      {/* --- LISTE DES PRODUITS (GRID) --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Chargement...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Package size={48} className="mx-auto text-gray-300 mb-2"/>
            <p className="text-gray-500 font-medium">Aucun produit trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className={`bg-white p-4 rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col gap-4 group ${!product.inStock ? 'opacity-75 border-red-100 bg-red-50/10' : 'border-gray-100'}`}>
              
              {/* Image & Badges */}
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition duration-500 group-hover:scale-110 ${!product.inStock && 'grayscale'}`} 
                />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-700 shadow-sm">
                    {product.category}
                </div>
                {!product.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold uppercase tracking-widest">
                      Épuisé
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h3>
                  <button onClick={() => handleDelete(product.id)} className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition">
                    <Trash2 size={18}/>
                  </button>
                </div>
                <p className="text-brand-brown font-serif font-bold text-xl mb-4">{product.price.toLocaleString()} FCFA</p>
                
                {/* Actions Stock */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                   <button 
                    onClick={() => toggleStock(product)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition ${
                        product.inStock 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                   >
                     {product.inStock ? <><Check size={16}/> En Stock</> : <><X size={16}/> Indisponible</>}
                   </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- MODAL AJOUT PRODUIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Nouveau Produit</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Nom */}
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Nom du gâteau / produit</label>
                 <input required placeholder="Ex: Forêt Noire" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Prix */}
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Prix (FCFA)</label>
                   <input required type="number" placeholder="5000" className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                
                {/* CATÉGORIE DYNAMIQUE */}
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                   <select 
                     className="w-full border border-gray-300 p-3 rounded-xl bg-white focus:ring-2 focus:ring-brand-brown/20 outline-none" 
                     value={formData.category} 
                     onChange={e => setFormData({...formData, category: e.target.value})}
                     required
                   >
                     <option value="">-- Choisir --</option>
                     {config.categories && config.categories.length > 0 ? (
                       config.categories.map((cat) => (
                         <option key={cat.id} value={cat.name}>{cat.name}</option>
                       ))
                     ) : (
                       <option disabled>Aucune catégorie !</option>
                     )}
                   </select>
                </div>
              </div>

              {/* Alerte si pas de catégories */}
              {(!config.categories || config.categories.length === 0) && (
                 <div className="bg-orange-50 text-orange-800 p-3 rounded-xl text-sm flex items-center gap-2 border border-orange-200">
                    <AlertCircle size={16}/>
                    <span>Vous n'avez pas encore créé de catégories. <Link to="/admin/settings" onClick={() => setIsModalOpen(false)} className="underline font-bold">Allez dans Paramètres.</Link></span>
                 </div>
              )}
              
              {/* Description */}
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Description courte</label>
                 <textarea rows="2" placeholder="Ingrédients, allergènes..." className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              {/* Image Uploader */}
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image du produit</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                     <button type="button" onClick={() => setFormData({...formData, imageType: 'url'})} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${formData.imageType === 'url' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Lien URL</button>
                     <button type="button" onClick={() => setFormData({...formData, imageType: 'file'})} className={`flex-1 py-2 text-sm font-bold rounded-md transition ${formData.imageType === 'file' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Importer Fichier</button>
                  </div>

                  {formData.imageType === 'url' ? (
                    <input required placeholder="https://..." className="w-full border border-gray-300 p-3 rounded-xl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-brown transition group">
                       <input required={!formData.imageFile} type="file" accept="image/*" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} className="hidden" />
                       <UploadCloud size={32} className="text-gray-400 group-hover:text-brand-brown mb-2"/>
                       <span className="text-sm font-bold text-gray-600 group-hover:text-gray-800">
                          {formData.imageFile ? formData.imageFile.name : "Cliquez pour choisir une photo"}
                       </span>
                    </label>
                  )}
              </div>

              {/* Stock Checkbox */}
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="w-5 h-5 text-brand-brown accent-brand-brown rounded focus:ring-brand-brown"/>
                <span className="font-bold text-gray-700">Produit en stock immédiatement</span>
              </label>

              {/* Submit */}
              <button disabled={uploading || (!config.categories || config.categories.length === 0)} type="submit" className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {uploading ? (
                    <>Envoi en cours...</>
                ) : (
                    <><Check size={20}/> Enregistrer le produit</>
                )}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;