import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase'; // Assure-toi d'avoir exporté storage
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Plus, Trash2, Edit2, Package, Image as ImageIcon, Link as LinkIcon, Check, X, UploadCloud } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Pâtisserie',
    description: '',
    imageType: 'url', // 'url' ou 'file'
    imageUrl: '',
    imageFile: null,
    inStock: true // Par défaut en stock
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- GESTION AJOUT PRODUIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Si l'utilisateur a choisi d'uploader un fichier
      if (formData.imageType === 'file' && formData.imageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${formData.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, formData.imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "products"), {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        image: finalImageUrl, // L'URL finale (soit lien direct, soit lien Firebase)
        inStock: formData.inStock // Stockage de l'état
      });

      setIsModalOpen(false);
      setFormData({ name: '', price: '', category: 'Pâtisserie', description: '', imageType: 'url', imageUrl: '', imageFile: null, inStock: true });
    } catch (error) {
      console.error("Erreur ajout:", error);
      alert("Erreur lors de l'ajout du produit");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce produit ?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  // --- TOGGLE STOCK RAPIDE ---
  const toggleStock = async (product) => {
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, { inStock: !product.inStock });
    } catch (error) {
      console.error("Erreur update stock:", error);
    }
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-brand-brown"/> Mes Produits
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-brown text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-brown/90 transition">
          <Plus size={20}/> Nouveau Produit
        </button>
      </div>

      {/* --- LISTE DES PRODUITS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className={`bg-white p-4 rounded-xl shadow-sm border flex gap-4 ${!product.inStock ? 'opacity-75 border-red-200 bg-red-50/30' : 'border-gray-200'}`}>
            {/* Image */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className={`w-full h-full object-cover ${!product.inStock && 'grayscale'}`} />
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-bold uppercase">Épuisé</div>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-800">{product.name}</h3>
                  <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                <p className="text-brand-brown font-bold">{product.price} FCFA</p>
                <p className="text-xs text-gray-500">{product.category}</p>
              </div>

              {/* Contrôle Stock */}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-bold text-gray-500">Disponibilité :</span>
                <button 
                  onClick={() => toggleStock(product)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition ${
                    product.inStock 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {product.inStock ? <><Check size={12}/> En Stock</> : <><X size={12}/> Épuisé</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL AJOUT PRODUIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Ajouter un produit</h2>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Infos de base */}
              <input required placeholder="Nom du produit" className="w-full border p-3 rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Prix" className="w-full border p-3 rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <select className="w-full border p-3 rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option>Gâteaux</option>
                  <option>Viennoiserie</option>
                  <option>Tartes</option>
                  <option>Boisson</option>
                </select>
              </div>
              
              {/* GESTION IMAGE (Fichier ou URL) */}
              <div className="border rounded-lg p-1 bg-gray-50 flex gap-1">
                 <button type="button" onClick={() => setFormData({...formData, imageType: 'url'})} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${formData.imageType === 'url' ? 'bg-white shadow text-brand-brown' : 'text-gray-500'}`}>
                    <LinkIcon size={16}/> Lien URL
                 </button>
                 <button type="button" onClick={() => setFormData({...formData, imageType: 'file'})} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${formData.imageType === 'file' ? 'bg-white shadow text-brand-brown' : 'text-gray-500'}`}>
                    <ImageIcon size={16}/> Importer Fichier
                 </button>
              </div>

              {formData.imageType === 'url' ? (
                <input required placeholder="https://..." className="w-full border p-3 rounded-lg" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition relative">
                   <input required type="file" accept="image/*" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                   <div className="flex flex-col items-center text-gray-500">
                      <UploadCloud size={32} className="mb-2"/>
                      <span className="text-sm font-bold">{formData.imageFile ? formData.imageFile.name : "Appuyez pour choisir une photo"}</span>
                   </div>
                </div>
              )}

              {/* État du stock initial */}
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="w-5 h-5 text-brand-brown accent-brand-brown"/>
                <span className="font-bold text-gray-700">Produit en stock actuellement</span>
              </label>

              <button disabled={uploading} type="submit" className="w-full bg-brand-brown text-white font-bold py-3 rounded-xl hover:bg-brand-brown/90">
                {uploading ? 'Envoi de l\'image...' : 'Enregistrer le produit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;