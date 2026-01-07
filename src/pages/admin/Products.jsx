import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { 
  Plus, Trash2, Package, Image as ImageIcon, Link as LinkIcon, Check, X, 
  UploadCloud, AlertCircle, Filter, Search, Edit3, Eye, MoreHorizontal, LayoutGrid, List as ListIcon
} from 'lucide-react';

// --- COMPOSANT MODAL DE VISUALISATION ---
const ViewModal = ({ product, onClose }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 relative group">
           <img src={product.image} alt={product.name} className="w-full h-full object-cover transition duration-500 group-hover:scale-105"/>
           {!product.inStock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold uppercase tracking-widest">Épuisé</div>}
        </div>
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
          <div className="flex-1">
             <span className="inline-block bg-brand-brown/10 text-brand-brown px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">{product.category}</span>
             <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2 leading-tight">{product.name}</h2>
             <p className="text-2xl font-bold text-brand-brown mb-6">{product.price.toLocaleString()} FCFA</p>
             
             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <h4 className="font-bold text-gray-700 uppercase text-sm mb-2 flex items-center gap-2"><AlertCircle size={16}/> Description</h4>
               <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Aucune description fournie."}
               </p>
             </div>
          </div>
          <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
             <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
             {product.inStock ? 'En Stock' : 'Rupture de Stock'}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
const Products = () => {
  const { config } = useConfig(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // États Édition Rapide
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({}); // Stocke les données temporaires

  // Filtres & Affichage
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'

  // Formulaire Ajout
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', description: '', 
    imageType: 'url', imageUrl: '', imageFile: null, inStock: true
  });

  // 1. Récupération Real-time
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FILTRAGE ---
  const filteredProducts = products.filter(product => {
    const matchCategory = categoryFilter === 'Tous' || product.category === categoryFilter;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // --- ACTIONS CRUD ---
  
  // AJOUTER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Veuillez sélectionner une catégorie.");
    setUploading(true);
    try {
      let finalImageUrl = formData.imageUrl;
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
        image: finalImageUrl || 'https://placehold.co/400x300?text=No+Image',
        inStock: formData.inStock,
        createdAt: new Date()
      });
      setIsAddModalOpen(false);
      setFormData({ name: '', price: '', category: '', description: '', imageType: 'url', imageUrl: '', imageFile: null, inStock: true });
    } catch (error) { console.error(error); alert("Erreur ajout"); } finally { setUploading(false); }
  };

  // SUPPRIMER
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  // ÉDITION RAPIDE (IN-PLACE)
  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ name: product.name, price: product.price });
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "products", id), {
        name: editForm.name,
        price: Number(editForm.price)
      });
      setEditingId(null);
    } catch (error) { console.error("Erreur save:", error); }
  };

  const toggleStock = async (product) => {
    try {
      await updateDoc(doc(db, "products", product.id), { inStock: !product.inStock });
    } catch (error) { console.error("Erreur stock:", error); }
  };


  return (
    <div className="pb-32 max-w-7xl mx-auto px-4 sm:px-6">
              
      {/* --- EN-TÊTE & BARRE D'OUTILS --- */}
      <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 mb-4 md:mb-8 relative md:sticky md:top-2 z-20">
        
        {/* Ligne 1 : Titre + Bouton Ajout */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 md:mb-6">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 bg-brand-brown/10 text-brand-brown rounded-lg">
                  <Package size={20} className="md:w-6 md:h-6"/> 
              </div>
              Catalogue Produits
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1 ml-1">
              {products.length} réf. ({filteredProducts.length} visibles)
            </p>
          </div>
          
          <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="w-full md:w-auto bg-brand-brown text-white px-4 py-2.5 md:px-6 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-md font-bold text-sm md:text-base"
          >
            <Plus size={18} className="md:w-5 md:h-5"/> 
            <span>Nouveau Produit</span>
          </button>
        </div>

        {/* Ligne 2 : Barre de Filtres (Optimisée Mobile) */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center">
          
          {/* Recherche (Pleine largeur) */}
          <div className="relative flex-1 w-full order-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input 
              type="text" 
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/20 transition"
            />
          </div>
          
          {/* Groupe : Catégorie + Toggle (Sur la même ligne en mobile pour gagner de la place) */}
          <div className="flex gap-2 order-2 md:w-auto">
              {/* Filtre Catégorie */}
              <div className="relative flex-1 md:w-56 h-full">
                  <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 md:py-3 bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-brown/20 appearance-none cursor-pointer h-full"
                  >
                      <option value="Tous">Toutes</option>
                      {config.categories?.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                  </select>
                  {/* Petite flèche custom */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
              </div>

              {/* Toggle Vue */}
              <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 h-full items-center">
                <button onClick={() => setViewMode('list')} className={`p-1.5 md:p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-brand-brown' : 'text-gray-400'}`}>
                  <ListIcon size={18} className="md:w-5 md:h-5"/>
                </button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 md:p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-brand-brown' : 'text-gray-400'}`}>
                  <LayoutGrid size={18} className="md:w-5 md:h-5"/>
                </button>
              </div>
          </div>
        </div>
      </div>
      
      {/* --- LISTE DES PRODUITS --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-4"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-brown"></div>Chargement du catalogue...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Package size={64} className="mx-auto text-gray-300 mb-4"/>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun produit trouvé.</h3>
            <p className="text-gray-500">{searchTerm || categoryFilter !== 'Tous' ? "Essayez d'autres filtres." : "Commencez par ajouter un produit !"}</p>
        </div>
      ) : (
        
        // --- VUE LISTE (TABLEAU) ---
        viewMode === 'list' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                  <tr>
                    <th className="p-4">Produit</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      {/* Nom + Image */}
                      <td className="p-4 flex items-center gap-4">
                         <div 
                           onClick={() => setViewProduct(product)} 
                           className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden cursor-pointer flex-shrink-0 relative group"
                         >
                           <img src={product.image} alt="" className={`w-full h-full object-cover ${!product.inStock && 'grayscale'}`}/>
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center text-white opacity-0 group-hover:opacity-100"><Eye size={16}/></div>
                         </div>
                         {editingId === product.id ? (
                           <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border border-brand-brown rounded px-2 py-1 font-bold text-gray-800 w-40 lg:w-64 focus:outline-none"/>
                         ) : (
                           <div className="font-bold text-gray-800 line-clamp-1">{product.name}</div>
                         )}
                      </td>
                      {/* Catégorie */}
                      <td className="p-4">
                         <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">{product.category}</span>
                      </td>
                      {/* Prix */}
                      <td className="p-4 font-bold text-brand-brown whitespace-nowrap">
                        {editingId === product.id ? (
                           <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="border border-brand-brown rounded px-2 py-1 w-24 focus:outline-none text-right"/>
                        ) : (
                           <>{product.price.toLocaleString()} <span className="text-xs text-gray-500">FCFA</span></>
                        )}
                      </td>
                      {/* Stock Toggle */}
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => toggleStock(product)}
                          className={`p-2 rounded-full transition-colors ${product.inStock ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                        >
                          {product.inStock ? <Check size={18}/> : <X size={18}/>}
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === product.id ? (
                            <>
                              <button onClick={() => saveEdit(product.id)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg"><Check size={18}/></button>
                              <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg"><X size={18}/></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(product)} className="text-gray-400 hover:text-brand-brown hover:bg-gray-100 p-2 rounded-lg transition"><Edit3 size={18}/></button>
                              <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18}/></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          
        // --- VUE GRILLE (CARTES) ---
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all hover:shadow-md flex flex-col gap-4 group ${!product.inStock ? 'opacity-75 border-red-100 bg-red-50/10' : 'border-gray-100'}`}>
              
              {/* Image */}
              <div 
                onClick={() => setViewProduct(product)}
                className="relative w-full h-52 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group/img"
              >
                <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition duration-500 group-hover/img:scale-110 ${!product.inStock && 'grayscale'}`} />
                <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm z-10">{product.category}</div>
                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 z-20 font-bold gap-2">
                  <Eye size={20}/> Voir Détails
                </div>
                {!product.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold uppercase tracking-widest z-10">Épuisé</div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  {editingId === product.id ? (
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border border-brand-brown rounded px-2 py-1 font-bold text-gray-800 w-full mr-2 focus:outline-none"/>
                  ) : (
                    <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">{product.name}</h3>
                  )}
                  <button onClick={() => handleDelete(product.id)} className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition flex-shrink-0"><Trash2 size={18}/></button>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                   {editingId === product.id ? (
                     <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="border border-brand-brown rounded px-2 py-1 font-bold text-brand-brown w-32 focus:outline-none"/>
                   ) : (
                     <p className="text-brand-brown font-serif font-bold text-xl">{product.price.toLocaleString()} <span className="text-sm text-gray-500 font-sans">FCFA</span></p>
                   )}
                   {editingId === product.id ? (
                     <div className="flex gap-1"><button onClick={() => saveEdit(product.id)} className="bg-green-100 text-green-600 p-1 rounded"><Check size={16}/></button><button onClick={() => setEditingId(null)} className="bg-red-100 text-red-600 p-1 rounded"><X size={16}/></button></div>
                   ) : (
                     <button onClick={() => startEdit(product)} className="text-gray-400 hover:text-brand-brown p-1 rounded hover:bg-gray-100 transition"><Edit3 size={16}/></button>
                   )}
                </div>
                
                {/* Actions Stock */}
                <button 
                  onClick={() => toggleStock(product)}
                  className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition mt-auto ${
                      product.inStock 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                 >
                   {product.inStock ? <><Check size={18}/> En Stock</> : <><X size={18}/> Indisponible</>}
                 </button>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* --- MODALS --- */}
      <ViewModal product={viewProduct} onClose={() => setViewProduct(null)} />
      
      {/* Modal Ajout (Reste similaire mais stylisé) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800 font-serif">Ajouter un Délice</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
                 <input required placeholder="Ex: Mille-Feuille Vanille" className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none font-bold text-gray-800 text-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Prix (FCFA)</label>
                   <input required type="number" placeholder="5000" className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none font-bold text-brand-brown text-lg" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                   <select className="w-full border border-gray-300 p-4 rounded-xl bg-white focus:ring-2 focus:ring-brand-brown/20 outline-none appearance-none cursor-pointer font-bold text-gray-700" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                     <option value="">-- Choisir --</option>
                     {config.categories?.map((cat) => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                   </select>
                </div>
              </div>
              {(!config.categories || config.categories.length === 0) && (
                 <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm flex items-center gap-3 border border-orange-200 font-medium"><AlertCircle size={20}/><span>Créez d'abord des catégories dans les <Link to="/admin/settings" onClick={() => setIsAddModalOpen(false)} className="underline font-bold">Paramètres</Link>.</span></div>
              )}
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Description complète</label>
                 <textarea rows="4" placeholder="Ingrédients, saveurs, allergènes..." className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-brand-brown/20 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                     <button type="button" onClick={() => setFormData({...formData, imageType: 'url'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${formData.imageType === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Lien URL</button>
                     <button type="button" onClick={() => setFormData({...formData, imageType: 'file'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${formData.imageType === 'file' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Fichier Local</button>
                  </div>
                  {formData.imageType === 'url' ? (
                    <input required placeholder="https://..." className="w-full border border-gray-300 p-4 rounded-xl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-brand-brown transition group bg-gray-50">
                       <input required={!formData.imageFile} type="file" accept="image/*" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} className="hidden" />
                       <UploadCloud size={40} className="text-gray-400 group-hover:text-brand-brown mb-3 transition"/>
                       <span className="font-bold text-gray-600 group-hover:text-gray-800 text-center">{formData.imageFile ? formData.imageFile.name : "Cliquez pour choisir une photo"}</span>
                    </label>
                  )}
              </div>
              <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
                <input type="checkbox" checked={formData.inStock} onChange={e => setFormData({...formData, inStock: e.target.checked})} className="w-6 h-6 text-brand-brown accent-brand-brown rounded focus:ring-brand-brown"/>
                <span className="font-bold text-gray-800 text-lg">En stock immédiatement</span>
              </label>
              <button disabled={uploading || !config.categories?.length} type="submit" className="w-full bg-brand-brown text-white font-bold py-5 rounded-xl shadow-xl hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg">
                {uploading ? 'Création en cours...' : <><Check size={24}/> Créer le produit</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;