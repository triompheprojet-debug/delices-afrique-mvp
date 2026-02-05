import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useConfig } from '../../context/ConfigContext';
import { 
  Plus, Trash2, Package, X, Check, UploadCloud, AlertCircle, 
  Search, Filter, Edit3, LayoutGrid, List as ListIcon, 
  TrendingUp, DollarSign, Truck, Store, ClipboardCheck, AlertTriangle
} from 'lucide-react';

// --- COMPOSANT DE VALIDATION (NOUVEAU) ---
const ValidationCard = ({ product, onValidate, onReject }) => {
    const [publicPrice, setPublicPrice] = useState(product.supplierPrice + 1000); // Suggestion min
    const margin = publicPrice - product.supplierPrice;
    const isValidMargin = margin >= 1000;
  
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex flex-col md:flex-row gap-6 animate-fade-in">
        {/* Info Produit */}
        <div className="flex gap-4 md:w-1/3">
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
             <img src={product.image} alt={product.name} className="w-full h-full object-cover"/>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2">
                <Store size={12}/> {product.supplierName || 'Fournisseur Inconnu'}
            </span>
            <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
          </div>
        </div>
  
        {/* Info Financière & Action */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 p-4 rounded-xl">
          
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-gray-500 uppercase">Prix Fournisseur (Achat)</p>
            <p className="text-xl font-mono font-bold text-gray-700">{product.supplierPrice.toLocaleString()} F</p>
          </div>
  
          <div className="flex items-center gap-2">
            <div className="text-right">
                <label className="block text-xs font-bold text-gray-500 mb-1">Prix Public (Vente)</label>
                <input 
                    type="number" 
                    className="w-32 p-2 border rounded-lg font-bold text-right outline-none focus:ring-2 focus:ring-brand-brown"
                    value={publicPrice}
                    onChange={(e) => setPublicPrice(Number(e.target.value))}
                />
            </div>
          </div>
  
          <div className="text-center w-32">
             <p className="text-xs font-bold text-gray-500 uppercase">Marge Plateforme</p>
             <p className={`text-lg font-bold ${isValidMargin ? 'text-green-600' : 'text-red-600'}`}>
                {margin.toLocaleString()} F
             </p>
             {!isValidMargin && <span className="text-[10px] text-red-500 font-bold">Min. 1000 F requis</span>}
          </div>
  
          <div className="flex gap-2">
            <button 
                onClick={() => onReject(product.id)}
                className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                title="Rejeter"
            >
                <X size={20}/>
            </button>
            <button 
                onClick={() => {
                    if(isValidMargin) onValidate(product.id, publicPrice, margin);
                    else alert("Impossible : La marge doit être d'au moins 1000 FCFA.");
                }}
                disabled={!isValidMargin}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition shadow-md
                    ${isValidMargin ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}
                `}
            >
                <Check size={20}/> VALIDER
            </button>
          </div>
        </div>
      </div>
    );
  };

// --- COMPOSANT MODAL DE VISUALISATION (EXISTANT) ---
const ViewModal = ({ product, onClose }) => {
  if (!product) return null;
  // Adaptation : buyingPrice (Admin) OU supplierPrice (Partner)
  const buyingPrice = product.supplierPrice || product.buyingPrice || 0;
  const margin = product.price - buyingPrice;
  const marginPercent = buyingPrice ? Math.round((margin / buyingPrice) * 100) : 0;

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
             <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block bg-brand-brown/10 text-brand-brown px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{product.category}</span>
                {product.supplierName && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Store size={12}/> {product.supplierName}
                    </span>
                )}
             </div>
             
             <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2 leading-tight">{product.name}</h2>
             
             <div className="flex items-end gap-4 mb-6">
                <p className="text-2xl font-bold text-brand-brown">{product.price.toLocaleString()} FCFA</p>
                <div className="text-xs text-gray-400 mb-1">
                    Achat: {buyingPrice} FCFA | 
                    <span className="text-green-600 font-bold ml-1">Marge: +{margin} FCFA ({marginPercent}%)</span>
                </div>
             </div>
             
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
  
  // Onglets : 'catalog' ou 'validation'
  const [activeTab, setActiveTab] = useState('catalog');

  const [isScrolled, setIsScrolled] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [viewMode, setViewMode] = useState('list');

  // Formulaire Ajout (Interne Admin)
  const [formData, setFormData] = useState({
    name: '', price: '', buyingPrice: '', category: '', description: '', 
    imageType: 'url', imageUrl: '', imageFile: null, inStock: true
  });

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chargement
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- LOGIQUE FILTRAGE AVANCÉE ---
  const pendingProducts = products.filter(p => p.status === 'pending_validation');
  
  // Les produits du catalogue sont ceux qui sont actifs (ou qui n'ont pas de status défini = legacy)
  const catalogProducts = products.filter(p => 
    (p.status === 'active' || !p.status) && 
    (categoryFilter === 'Tous' || p.category === categoryFilter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- ACTIONS ---
  
  // 1. Validation Fournisseur
  const handleValidateProduct = async (productId, publicPrice, margin) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        price: Number(publicPrice),
        platformMargin: Number(margin),
        status: 'active',
        inStock: true
      });
      // Pas besoin d'alert, le produit changera de liste automatiquement
    } catch (error) { console.error(error); alert("Erreur validation"); }
  };

  const handleRejectProduct = async (productId) => {
    const reason = prompt("Motif du rejet (sera visible par le fournisseur) :");
    if(reason) {
        await updateDoc(doc(db, "products", productId), {
            status: 'rejected',
            rejectionReason: reason
        });
    }
  };

  // 2. CRUD Admin Classique
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return alert("Catégorie manquante.");
    
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
        buyingPrice: Number(formData.buyingPrice), 
        category: formData.category,
        description: formData.description,
        image: finalImageUrl || 'https://placehold.co/400',
        inStock: formData.inStock,
        status: 'active', // Directement actif pour l'admin
        createdAt: new Date().toISOString()
      });
      setIsAddModalOpen(false);
      setFormData({ name: '', price: '', buyingPrice: '', category: '', description: '', imageType: 'url', imageUrl: '', imageFile: null, inStock: true });
    } catch (error) { console.error(error); alert("Erreur ajout"); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce produit définitivement ?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditForm({ 
        name: product.name, 
        price: product.price, 
        buyingPrice: product.buyingPrice || product.supplierPrice || 0
    });
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "products", id), {
        name: editForm.name,
        price: Number(editForm.price),
        // On met à jour buyingPrice si c'est un produit admin, sinon on touche pas au supplierPrice ici
        buyingPrice: Number(editForm.buyingPrice) 
      });
      setEditingId(null);
    } catch (error) { console.error(error); }
  };

  const toggleStock = async (product) => {
    await updateDoc(doc(db, "products", product.id), { inStock: !product.inStock });
  };

  return (
    <div className="pb-32 max-w-7xl mx-auto px-4 sm:px-6">
              
      {/* --- EN-TÊTE --- */}
      <div className={`
        sticky top-0 z-40 transition-all duration-500 ease-in-out border-b
        ${isScrolled 
            ? 'py-2 px-4 bg-white/95 backdrop-blur-md shadow-md border-gray-200' 
            : 'py-6 px-6 bg-white rounded-2xl shadow-sm border-gray-100 relative top-2 mb-8'
        }
      `}>
        
        {/* Titre & Onglets */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-brand-brown"/> Catalogue
            </h1>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('catalog')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-white shadow text-brand-brown' : 'text-gray-500'}`}
             >
                <LayoutGrid size={16}/> Produits Actifs
             </button>
             <button 
                onClick={() => setActiveTab('validation')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'validation' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}
             >
                <ClipboardCheck size={16}/> 
                À Valider
                {pendingProducts.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingProducts.length}</span>
                )}
             </button>
          </div>

          <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-brown text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-md hover:bg-gray-800 transition">
            <Plus size={18}/> Nouveau (Interne)
          </button>
        </div>

        {/* Filtres (Uniquement si onglet Catalogue) */}
        {activeTab === 'catalog' && (
            <div className={`flex flex-col md:flex-row gap-3 items-center transition-all ${isScrolled ? 'mt-0' : 'mt-2'}`}>
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                <input 
                type="text" 
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/20"
                />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none appearance-none cursor-pointer"
                >
                    <option value="Tous">Toutes Catégories</option>
                    {config.categories?.map(cat => (<option key={cat.id} value={cat.name}>{cat.name}</option>))}
                </select>

                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow' : ''}`}><ListIcon size={18}/></button>
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}><LayoutGrid size={18}/></button>
                </div>
            </div>
            </div>
        )}
      </div>
      
      {/* --- CONTENU --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Chargement...</div>
      ) : (
          <>
            {/* VUE VALIDATION */}
            {activeTab === 'validation' && (
                <div className="space-y-4 mt-6">
                    {pendingProducts.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                            <Check className="mx-auto text-green-200 mb-4" size={48}/>
                            <h3 className="text-gray-500 font-medium">Tout est à jour ! Aucune demande en attente.</h3>
                        </div>
                    ) : (
                        pendingProducts.map(product => (
                            <ValidationCard 
                                key={product.id} 
                                product={product} 
                                onValidate={handleValidateProduct}
                                onReject={handleRejectProduct}
                            />
                        ))
                    )}
                </div>
            )}

            {/* VUE CATALOGUE (LISTE/GRID) */}
            {activeTab === 'catalog' && (
                 catalogProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">Aucun produit actif trouvé.</div>
                 ) : (
                    viewMode === 'list' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left">
                              <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                                <tr>
                                  <th className="p-4">Produit</th>
                                  <th className="p-4">Origine</th>
                                  <th className="p-4 text-right">Prix Vente</th>
                                  <th className="p-4 text-right bg-yellow-50/50 text-yellow-700">Coût Achat</th>
                                  <th className="p-4 text-right">Marge</th>
                                  <th className="p-4 text-center">Stock</th>
                                  <th className="p-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {catalogProducts.map(product => {
                                  // Gestion double source (Produit Interne ou Fournisseur)
                                  const buyingCost = product.supplierPrice || product.buyingPrice || 0;
                                  const margin = product.price - buyingCost;
                                  
                                  return (
                                  <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 flex items-center gap-4">
                                        <div onClick={() => setViewProduct(product)} className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden cursor-pointer shrink-0">
                                          <img src={product.image} alt="" className={`w-full h-full object-cover ${!product.inStock && 'grayscale'}`}/>
                                        </div>
                                        <div>
                                           {editingId === product.id ? (
                                              <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="border rounded px-2 py-1 w-32"/>
                                           ) : <span className="font-bold text-gray-800 block">{product.name}</span>}
                                           <span className="text-xs text-gray-400">{product.category}</span>
                                        </div>
                                    </td>
              
                                    <td className="p-4">
                                       {product.supplierName ? (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                              <Store size={12}/> {product.supplierName}
                                          </span>
                                       ) : (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                              <Package size={12}/> Interne
                                          </span>
                                       )}
                                    </td>
                                    
                                    <td className="p-4 font-bold text-gray-800 text-right">
                                      {editingId === product.id ? (
                                         <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="border rounded px-2 py-1 w-20 text-right"/>
                                      ) : <>{product.price?.toLocaleString()} F</>}
                                    </td>
              
                                    <td className="p-4 font-medium text-gray-600 text-right bg-yellow-50/30">
                                      {editingId === product.id ? (
                                         <input type="number" value={editForm.buyingPrice} onChange={e => setEditForm({...editForm, buyingPrice: e.target.value})} className="border rounded px-2 py-1 w-20 text-right bg-white"/>
                                      ) : <>{buyingCost.toLocaleString()} F</>}
                                    </td>
              
                                    <td className="p-4 text-right">
                                        <div className={`font-bold inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${margin >= 1000 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                           {margin >= 1000 ? <TrendingUp size={12}/> : <AlertTriangle size={12}/>}
                                           {margin.toLocaleString()}
                                        </div>
                                    </td>
              
                                    <td className="p-4 text-center">
                                      <button onClick={() => toggleStock(product)} className={`p-1.5 rounded-full ${product.inStock ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {product.inStock ? <Check size={14}/> : <X size={14}/>}
                                      </button>
                                    </td>
              
                                    <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        {editingId === product.id ? (
                                          <>
                                            <button onClick={() => saveEdit(product.id)} className="text-green-600 p-1"><Check size={16}/></button>
                                            <button onClick={() => setEditingId(null)} className="text-red-600 p-1"><X size={16}/></button>
                                          </>
                                        ) : (
                                          <>
                                            <button onClick={() => startEdit(product)} className="text-gray-400 hover:text-brand-brown p-1"><Edit3 size={16}/></button>
                                            <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )})}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        // VUE GRILLE (Simplifiée pour l'exemple, similaire à la tienne)
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                            {catalogProducts.map(product => {
                                const buyingCost = product.supplierPrice || product.buyingPrice || 0;
                                const margin = product.price - buyingCost;
                                return (
                                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                                    <div className="relative h-40 bg-gray-100 rounded-xl overflow-hidden">
                                        <img src={product.image} className={`w-full h-full object-cover ${!product.inStock && 'grayscale'}`} alt=""/>
                                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">+{margin} F</div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-bold text-brand-brown">{product.price.toLocaleString()} F</span>
                                            <button onClick={() => toggleStock(product)} className={`text-xs px-2 py-1 rounded font-bold ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.inStock ? 'Stock OK' : 'Épuisé'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                                        <button onClick={() => handleDelete(product.id)} className="flex-1 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg">Supprimer</button>
                                        <button onClick={() => startEdit(product)} className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg">Modifier</button>
                                    </div>
                                </div>
                            )})}
                        </div>
                      )
                 )
            )}
          </>
      )}

      {/* --- MODALS --- */}
      <ViewModal product={viewProduct} onClose={() => setViewProduct(null)} />
      
      {/* Modal Ajout INTERNE (Classique) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-serif">Ajout Produit (Interne)</h2>
                <button onClick={() => setIsAddModalOpen(false)}><X/></button>
             </div>
             {/* ... Formulaire identique à l'ancien pour les produits internes ... */}
             <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Nom" className="w-full p-3 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <input required type="number" placeholder="Prix Vente" className="w-full p-3 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    <input required type="number" placeholder="Prix Achat" className="w-full p-3 border rounded-xl bg-yellow-50" value={formData.buyingPrice} onChange={e => setFormData({...formData, buyingPrice: e.target.value})} />
                </div>
                <select className="w-full p-3 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                      <option value="">-- Catégorie --</option>
                      {config.categories?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <textarea placeholder="Description" className="w-full p-3 border rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <input required placeholder="URL Image" className="w-full p-3 border rounded-xl" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                <button type="submit" className="w-full bg-brand-brown text-white font-bold py-3 rounded-xl">{uploading ? '...' : 'Enregistrer'}</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;