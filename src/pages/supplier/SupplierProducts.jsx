import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, storage } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useConfig } from '../../context/ConfigContext';
import { 
  Plus, Package, Search, LayoutGrid, List as ListIcon, 
  Store, Clock, CheckCircle, XCircle, X, UploadCloud, 
  DollarSign, Trash2, Edit3, Power, AlertTriangle, 
  Sparkles, ChevronUp, Image as ImageIcon, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SupplierProducts = () => {
  const context = useOutletContext();
  const supplier = context?.supplier;
  
  const { config } = useConfig();
  
  // Data State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // Pour l'image cliquable
  const [uploading, setUploading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // Form Data
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    supplierPrice: '',
    category: '',
    imageType: 'url', 
    imageUrl: '', 
    imageFile: null,
    currentImage: ''
  });

  // --- SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- FIREBASE LOAD ---
  useEffect(() => {
    const q = query(
      collection(db, 'products'), 
      where('supplierId', '==', supplier.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setProducts(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [supplier.id]);

  // --- ACTIONS (ADD, EDIT, DELETE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.supplierPrice || !formData.category) {
      return alert("Veuillez remplir les champs obligatoires.");
    }
    
    setUploading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      if (formData.imageType === 'file' && formData.imageFile) {
        const imageRef = ref(storage, `products/${supplier.id}_${Date.now()}_${formData.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, formData.imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const newProduct = {
        name: formData.name,
        description: formData.description,
        image: finalImageUrl || 'https://placehold.co/400?text=Produit',
        category: formData.category,
        supplierId: supplier.id,
        supplierName: supplier.name,
        supplierPrice: Number(formData.supplierPrice),
        price: 0, 
        platformMargin: 0,
        status: 'pending_validation',
        inStock: true,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'products'), newProduct);
      closeModals();
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.id) return;

    setUploading(true);
    try {
      let finalImageUrl = formData.currentImage;
      if (formData.imageType === 'url' && formData.imageUrl) {
        finalImageUrl = formData.imageUrl;
      } else if (formData.imageType === 'file' && formData.imageFile) {
        const imageRef = ref(storage, `products/${supplier.id}_edit_${Date.now()}_${formData.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, formData.imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      await updateDoc(doc(db, 'products', formData.id), {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image: finalImageUrl
      });
      closeModals();
    } catch (error) {
      console.error(error);
      alert("Erreur modification.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Supprimer ce produit définitivement ?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleStock = async (product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        inStock: !product.inStock
      });
    } catch (error) {
      console.error(error);
    }
  };

  // --- MODAL HELPERS ---
  const openEditModal = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || '',
      supplierPrice: product.supplierPrice,
      category: product.category,
      imageType: 'url',
      imageUrl: '',
      imageFile: null,
      currentImage: product.image
    });
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setFormData({
      id: null,
      name: '',
      description: '',
      supplierPrice: '',
      category: '',
      imageType: 'url',
      imageUrl: '',
      imageFile: null,
      currentImage: ''
    });
  };

  // --- FILTRAGE & HELPERS ---
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'Tous' || 
      (statusFilter === 'Actif' && p.status === 'active') ||
      (statusFilter === 'En attente' && p.status === 'pending_validation') ||
      (statusFilter === 'Rejeté' && p.status === 'rejected');
    return matchSearch && matchStatus;
  });

  const getStatusInfo = (status) => {
    switch(status) {
      case 'active': return { label: 'En Vente', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'rejected': return { label: 'Rejeté', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
      default: return { label: 'En attente', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
    }
  };

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    pending: products.filter(p => p.status === 'pending_validation').length,
    outOfStock: products.filter(p => !p.inStock).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Store size={24} className="text-purple-500/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-200 font-sans selection:bg-purple-500/30">
      
      {/* ========================================
          HEADER RESPONSIVE
          ======================================== */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-slate-950/80 backdrop-blur-xl border-slate-800 py-3 shadow-2xl' 
            : 'bg-slate-950 border-transparent py-4 md:py-6'
        }`}
      >
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Titre & Ajout (Mobile Row) */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
               <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-900/20 transition-all ${isScrolled ? 'w-10 h-10' : 'w-12 h-12'}`}>
                    <Package size={isScrolled ? 20 : 24} className="text-white" />
                  </div>
                  <div>
                    <h1 className={`font-bold text-slate-100 transition-all leading-tight ${isScrolled ? 'text-lg' : 'text-xl md:text-2xl'}`}>
                      Mes Produits
                    </h1>
                    {!isScrolled && <p className="text-slate-500 text-xs font-medium">Gestion du catalogue</p>}
                  </div>
               </div>
               
               <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="md:hidden bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-transform"
                >
                  <Plus size={22} />
               </button>
            </div>

            {/* Barre d'outils (Recherche & Filtres) */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group w-full sm:w-64">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-slate-500 group-focus-within:text-purple-400 transition-colors"/>
                </div>
                <input 
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full bg-slate-900/50 border border-slate-800 focus:border-purple-500/50 focus:bg-slate-900 text-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select 
                  className="bg-slate-900/50 border border-slate-800 text-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-purple-500/50 cursor-pointer flex-1 sm:flex-none"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option>Tous</option>
                  <option>Actif</option>
                  <option>En attente</option>
                  <option>Rejeté</option>
                </select>

                {/* Vue Switch (Desktop Only) */}
                <div className="hidden md:flex bg-slate-900/50 border border-slate-800 rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                    <LayoutGrid size={18}/>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                    <ListIcon size={18}/>
                  </button>
                </div>

                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="hidden md:flex bg-white text-slate-950 hover:bg-purple-50 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-900/10 transition-all items-center gap-2"
                >
                  <Plus size={18}/>
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      <div className="w-full mt-6">
        
        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          {[
            { label: 'Total', val: stats.total, icon: Package, color: 'text-slate-200', grad: 'from-slate-800 to-slate-900' },
            { label: 'En Vente', val: stats.active, icon: CheckCircle, color: 'text-emerald-400', grad: 'from-emerald-900/20 to-emerald-900/5' },
            { label: 'En Attente', val: stats.pending, icon: Clock, color: 'text-amber-400', grad: 'from-amber-900/20 to-amber-900/5' },
            { label: 'Rupture', val: stats.outOfStock, icon: AlertTriangle, color: 'text-red-400', grad: 'from-red-900/20 to-red-900/5' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-3 md:p-4 rounded-2xl border border-slate-800 bg-gradient-to-br ${stat.grad} flex flex-col justify-between shadow-lg`}>
              <div className="flex justify-between items-start">
                <div className={`p-1.5 md:p-2 w-fit rounded-lg bg-slate-950/30 ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white tracking-tight">{stat.val}</span>
              </div>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider mt-2">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* LISTING CONTENT */}
        <AnimatePresence mode='wait'>
          {filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30"
            >
              <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                <Search size={40} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">Aucun produit trouvé</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Commencez par ajouter votre premier produit."}
              </p>
            </motion.div>
          ) : (
            <>
              {/* =======================================================
                  VUE MOBILE (FORCÉE LISTE COMPACTE)
                  ======================================================= */}
              <motion.div 
                className="md:hidden space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {filteredProducts.map(product => {
                  const statusInfo = getStatusInfo(product.status);
                  return (
                    <div key={product.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
                      {/* Ligne 1: Image & Identité */}
                      <div className="flex gap-4">
                        <div className="relative group shrink-0">
                          <div 
                            onClick={() => setPreviewImage(product.image)}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 cursor-pointer relative"
                          >
                             <img src={product.image} alt="" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <ZoomIn size={14} className="text-white"/>
                             </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 truncate">{product.category}</p>
                          <h3 className="font-bold text-white leading-tight line-clamp-2">{product.name}</h3>
                        </div>
                      </div>

                      {/* Ligne 2: Grille Info (Statut / Prix) */}
                      <div className="grid grid-cols-2 gap-3 bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                        {/* Statut */}
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] text-slate-500 uppercase mb-1">Statut</span>
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${statusInfo.color}`}>
                            <statusInfo.icon size={12} />
                            {statusInfo.label}
                          </div>
                        </div>
                        {/* Votre Gain */}
                        <div className="flex flex-col justify-center border-l border-slate-800 pl-3">
                          <span className="text-[10px] text-slate-500 uppercase mb-1">Votre Gain</span>
                          <span className="text-emerald-400 font-mono font-bold">{product.supplierPrice.toLocaleString()} F</span>
                        </div>
                         {/* Prix Public */}
                        <div className="col-span-2 pt-2 border-t border-slate-800 flex justify-between items-center">
                           <span className="text-[10px] text-slate-500 uppercase">Prix Public</span>
                           <span className="text-slate-300 font-mono font-bold text-sm">
                             {product.status === 'active' ? `${product.price?.toLocaleString()} F` : '---'}
                           </span>
                        </div>
                      </div>

                      {/* Ligne 3: Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleStock(product)}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                            product.inStock 
                              ? 'border-slate-700 text-slate-400 bg-slate-800/50' 
                              : 'border-green-900/30 text-green-400 bg-green-900/10'
                          }`}
                        >
                          <Power size={14} />
                          {product.inStock ? 'Désactiver' : 'Activer'}
                        </button>
                        <button onClick={() => openEditModal(product)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* =======================================================
                  VUE DESKTOP (GRILLE / TABLEAU) - HIDDEN ON MOBILE
                  ======================================================= */}
              <div className="hidden md:block">
                {viewMode === 'grid' ? (
                  <motion.div 
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {filteredProducts.map(product => {
                      const statusInfo = getStatusInfo(product.status);
                      return (
                        <motion.div 
                          layout
                          key={product.id}
                          className={`group relative bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10 ${
                            !product.inStock ? 'border-red-900/30 opacity-75' : 'border-slate-800 hover:border-purple-500/30'
                          }`}
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              onClick={() => setPreviewImage(product.image)}
                              className={`w-full h-full object-cover transition-transform duration-700 cursor-pointer ${!product.inStock ? 'grayscale' : 'group-hover:scale-110'}`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 pointer-events-none" />
                            
                            <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusInfo.color} ${statusInfo.bg} border-transparent`}>
                                <statusInfo.icon size={12} />
                                {statusInfo.label}
                              </span>
                              {!product.inStock && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white shadow-lg">
                                  Rupture
                                </span>
                              )}
                            </div>
                            
                            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                              <p className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                  {product.category}
                              </p>
                              <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{product.name}</h3>
                            </div>
                          </div>

                          <div className="p-4 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Votre Gain</p>
                                <p className="text-emerald-400 font-mono font-bold text-lg">
                                  {product.supplierPrice.toLocaleString()} <span className="text-xs">F</span>
                                </p>
                              </div>
                              <div className="text-right border-l border-slate-800 pl-3">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Prix Site</p>
                                {product.status === 'active' ? (
                                  <p className="text-slate-300 font-mono font-bold text-lg">
                                    {product.price?.toLocaleString() || 0} <span className="text-xs">F</span>
                                  </p>
                                ) : (
                                  <span className="text-xs text-slate-600 italic">En attente</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                              <button 
                                onClick={() => toggleStock(product)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${
                                  product.inStock 
                                    ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' 
                                    : 'border-green-900/30 text-green-400 bg-green-900/10 hover:bg-green-900/20'
                                }`}
                              >
                                <Power size={14} />
                                {product.inStock ? 'Désactiver' : 'Activer'}
                              </button>
                              
                              <button onClick={() => openEditModal(product)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
                  >
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="p-4">Produit</th>
                          <th className="p-4">Statut</th>
                          <th className="p-4 text-right">Votre Gain</th>
                          <th className="p-4 text-right">Prix Public</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-sm">
                        {filteredProducts.map(product => {
                          const statusInfo = getStatusInfo(product.status);
                          return (
                            <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={product.image} 
                                    alt="" 
                                    onClick={() => setPreviewImage(product.image)}
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-800 cursor-pointer hover:ring-2 ring-purple-500 transition-all" 
                                  />
                                  <div>
                                    <p className="font-bold text-slate-200">{product.name}</p>
                                    <p className="text-slate-500 text-xs">{product.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusInfo.color} ${statusInfo.bg}`}>
                                  <statusInfo.icon size={12} />
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="p-4 text-right font-mono font-bold text-emerald-400 text-base">
                                {product.supplierPrice.toLocaleString()} F
                              </td>
                              <td className="p-4 text-right font-mono text-slate-400">
                                {product.status === 'active' ? `${product.price?.toLocaleString()} F` : '-'}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => toggleStock(product)} className={`p-2 rounded-lg transition-colors ${product.inStock ? 'text-slate-500 hover:text-slate-300' : 'text-green-400 bg-green-500/10'}`}>
                                    <Power size={16}/>
                                  </button>
                                  <button onClick={() => openEditModal(product)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg">
                                    <Edit3 size={16}/>
                                  </button>
                                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                                    <Trash2 size={16}/>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================
          MODAL UNIFIÉE (ADD / EDIT)
          ======================================== */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModals}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-800 bg-slate-900 flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {isEditModalOpen ? <Edit3 size={20} className="text-blue-400"/> : <Sparkles size={20} className="text-purple-400"/>}
                    {isEditModalOpen ? "Modifier le produit" : "Ajouter un produit"}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">Remplissez les informations ci-dessous</p>
                </div>
                <button onClick={closeModals} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="productForm" onSubmit={isEditModalOpen ? handleUpdate : handleSubmit} className="space-y-6">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom du produit</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Ex: T-Shirt Coton Bio"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Catégorie</label>
                        <div className="relative">
                          <select 
                            required
                            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 appearance-none focus:border-purple-500 outline-none cursor-pointer"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                          >
                            <option value="">Sélectionner...</option>
                            {config.categories?.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                          <ChevronUp size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none rotate-180"/>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <DollarSign size={14}/> Votre prix de vente
                        </label>
                        <div className="relative">
                          <input 
                            required 
                            type="number" 
                            min="100"
                            disabled={isEditModalOpen}
                            className={`w-full px-4 py-3 bg-slate-950 border rounded-xl font-mono font-bold outline-none transition-all ${
                              isEditModalOpen 
                                ? 'border-slate-800 text-slate-500 cursor-not-allowed' 
                                : 'border-emerald-500/30 focus:border-emerald-500 text-emerald-400'
                            }`}
                            value={formData.supplierPrice}
                            onChange={e => setFormData({...formData, supplierPrice: e.target.value})}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-xs">FCFA</span>
                        </div>
                        {isEditModalOpen && <p className="text-[10px] text-slate-500 mt-1">Contactez l'admin pour changer le prix.</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea 
                        rows="3"
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Image du produit</label>
                      <div className="flex p-1 bg-slate-900 rounded-lg mb-4 border border-slate-800 w-fit">
                        <button type="button" onClick={() => setFormData({...formData, imageType: 'url'})} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${formData.imageType === 'url' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Lien URL</button>
                        <button type="button" onClick={() => setFormData({...formData, imageType: 'file'})} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${formData.imageType === 'file' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>Fichier</button>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="shrink-0 w-24 h-24 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center relative">
                          {(formData.imageUrl || formData.imageFile || formData.currentImage) ? (
                            <img 
                              src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : (formData.imageUrl || formData.currentImage)} 
                              className="w-full h-full object-cover" 
                              alt="Preview"
                            />
                          ) : (
                            <ImageIcon size={24} className="text-slate-700"/>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          {formData.imageType === 'url' ? (
                            <input 
                              type="url"
                              placeholder="https://..."
                              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:border-purple-500 outline-none"
                              value={formData.imageUrl}
                              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            />
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-800 rounded-xl cursor-pointer hover:border-purple-500/50 hover:bg-slate-900 transition-all group">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-6 h-6 mb-2 text-slate-500 group-hover:text-purple-400 transition-colors" />
                                <p className="text-xs text-slate-500">{formData.imageFile ? formData.imageFile.name : "Cliquez pour choisir"}</p>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModals}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  form="productForm"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform active:scale-95"
                >
                  {uploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                  {isEditModalOpen ? 'Enregistrer' : 'Créer le produit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================
          MODAL PREVIEW IMAGE
          ======================================== */}
      <AnimatePresence>
        {previewImage && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()} // Prevent close when clicking image
            >
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-10"
              >
                <X size={24}/>
              </button>
              <img src={previewImage} alt="Aperçu" className="w-full h-full object-contain bg-slate-900" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SupplierProducts;