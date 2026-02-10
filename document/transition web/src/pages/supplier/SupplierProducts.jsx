import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { db, storage } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useConfig } from '../../context/ConfigContext'; // 1. Import du contexte pour les catégories
import { 
  Plus, Package, Search, LayoutGrid, List as ListIcon, 
  Store, Clock, CheckCircle, XCircle, X, UploadCloud, 
  DollarSign, Trash2, Edit3, Power
} from 'lucide-react';

const SupplierProducts = () => {
  const { supplier } = useOutletContext();
  const { config } = useConfig(); // Récupération des catégories Admin
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États d'interface
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Pour la modification
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // Formulaire (utilisé pour Ajout ET Édition)
  const [formData, setFormData] = useState({
    id: null, // Utile pour l'édition
    name: '',
    description: '',
    supplierPrice: '',
    category: '',
    imageType: 'url', 
    imageUrl: '', 
    imageFile: null,
    currentImage: '' // Pour afficher l'image actuelle lors de l'édition
  });

  // --- EFFET SCROLL ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- CHARGEMENT DES PRODUITS ---
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

  // --- ACTIONS CRUD ---

  // 1. AJOUTER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.supplierPrice || !formData.category) return alert("Veuillez remplir les champs obligatoires.");
    
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
        category: formData.category, // Utilise la catégorie sélectionnée (ID ou Nom)
        
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
      alert("Produit envoyé à l'administration !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi.");
    } finally {
      setUploading(false);
    }
  };

  // 2. MODIFIER (Sauf Prix)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.id) return;

    setUploading(true);
    try {
      let finalImageUrl = formData.currentImage; // Par défaut, on garde l'ancienne
      
      // Si une nouvelle image est fournie
      if (formData.imageType === 'url' && formData.imageUrl) {
        finalImageUrl = formData.imageUrl;
      } else if (formData.imageType === 'file' && formData.imageFile) {
        const imageRef = ref(storage, `products/${supplier.id}_edit_${Date.now()}_${formData.imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, formData.imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Mise à jour (On NE touche PAS au supplierPrice ni au status)
      await updateDoc(doc(db, 'products', formData.id), {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image: finalImageUrl
      });

      closeModals();
      // alert("Produit modifié avec succès.");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la modification.");
    } finally {
      setUploading(false);
    }
  };

  // 3. SUPPRIMER
  const handleDelete = async (id) => {
    if(window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error(error);
        alert("Erreur suppression");
      }
    }
  };

  // 4. BASCULER STOCK (En stock / Rupture)
  const toggleStock = async (product) => {
    try {
      await updateDoc(doc(db, 'products', product.id), {
        inStock: !product.inStock
      });
    } catch (error) {
      console.error(error);
    }
  };

  // --- GESTION MODALES ---
  const openEditModal = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      supplierPrice: product.supplierPrice, // Juste pour l'affichage (sera disabled)
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
    setFormData({ name: '', description: '', supplierPrice: '', category: '', imageType: 'url', imageUrl: '', imageFile: null, currentImage: '' });
  };

  // --- FILTRES ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tous' || 
                          (statusFilter === 'Actif' && p.status === 'active') ||
                          (statusFilter === 'Attente' && p.status === 'pending_validation') ||
                          (statusFilter === 'Rejeté' && p.status === 'rejected');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle size={12}/> En Vente</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase"><XCircle size={12}/> Rejeté</span>;
      default: return <span className="inline-flex items-center gap-1 bg-brand-beige/20 text-brand-brown px-2 py-1 rounded text-xs font-bold uppercase"><Clock size={12}/> En Attente</span>;
    }
  };

  return (
    <div className="pb-32">
      {/* --- EN-TÊTE STICKY --- */}
      <div className={`
        sticky top-0 z-30 transition-all duration-300 ease-in-out border-b
        ${isScrolled 
            ? 'py-3 px-4 bg-white/95 backdrop-blur-md shadow-md border-gray-200' 
            : 'py-6 px-0 bg-transparent border-transparent mb-6'
        }
      `}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className={`font-bold text-gray-800 flex items-center gap-2 transition-all ${isScrolled ? 'text-xl' : 'text-3xl'}`}>
              <Store className="text-brand-brown"/> Mes Produits
            </h1>
            {!isScrolled && <p className="text-gray-500 mt-1">Gérez votre catalogue, vos stocks et vos informations.</p>}
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-brown text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Plus size={20}/> Proposer un produit
          </button>
        </div>

        {/* BARRE DE FILTRES */}
        <div className={`mt-4 flex flex-col md:flex-row gap-3 items-center transition-all ${isScrolled ? 'hidden' : 'flex'}`}>
           <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input 
                type="text" placeholder="Rechercher..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-beige shadow-sm"
              />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto">
             <select 
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 shadow-sm outline-none"
             >
               <option value="Tous">Tous les statuts</option>
               <option value="Actif">En Vente</option>
               <option value="Attente">En Attente</option>
               <option value="Rejeté">Rejetés</option>
             </select>

             <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-gray-100 text-brand-brown' : 'text-gray-400'}`}><ListIcon size={20}/></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-gray-100 text-brand-brown' : 'text-gray-400'}`}><LayoutGrid size={20}/></button>
             </div>
           </div>
        </div>
      </div>

      {/* --- CONTENU PRINCIPAL --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown"></div>
            Chargement...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200 mx-auto max-w-2xl">
           <Package size={64} className="mx-auto text-gray-300 mb-4"/>
           <h3 className="text-xl font-bold text-gray-600">Aucun produit trouvé</h3>
           <button onClick={() => setIsAddModalOpen(true)} className="text-brand-brown font-bold hover:underline mt-2">Ajouter un produit</button>
        </div>
      ) : (
        <>
           {/* VUE GRILLE */}
           {viewMode === 'grid' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredProducts.map(product => (
                 <div key={product.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden group hover:shadow-md transition flex flex-col ${!product.inStock ? 'border-red-100 bg-red-50/20' : 'border-gray-100'}`}>
                    {/* Image & Badges */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                       <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${!product.inStock && 'grayscale opacity-70'}`}/>
                       <div className="absolute top-2 right-2">{getStatusBadge(product.status)}</div>
                       {!product.inStock && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold uppercase tracking-widest">Rupture</div>
                       )}
                       <div className="absolute bottom-2 left-2 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded backdrop-blur-sm font-bold shadow-sm">
                          {product.category}
                       </div>
                    </div>
                    
                    {/* Infos */}
                    <div className="p-4 flex-1 flex flex-col">
                       <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{product.name}</h3>
                       <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{product.description || "Pas de description."}</p>
                       
                       <div className="bg-brand-beige/20 rounded-xl p-3 flex items-center justify-between mb-4 border border-brand-beige/30">
                          <span className="text-xs font-bold text-brand-brown uppercase">Votre Gain</span>
                          <span className="text-xl font-bold text-brand-brown">{product.supplierPrice} F</span>
                       </div>

                       {/* Boutons d'action */}
                       <div className="mt-auto grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                          <button 
                            onClick={() => toggleStock(product)}
                            title={product.inStock ? "Mettre en rupture" : "Mettre en stock"}
                            className={`flex items-center justify-center p-2 rounded-lg transition ${product.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                          >
                             <Power size={18}/>
                          </button>
                          
                          <button 
                             onClick={() => openEditModal(product)}
                             className="flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-brand-brown hover:text-white transition"
                             title="Modifier"
                          >
                             <Edit3 size={18}/>
                          </button>

                          <button 
                             onClick={() => handleDelete(product.id)}
                             className="flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-500 hover:text-white transition"
                             title="Supprimer"
                          >
                             <Trash2 size={18}/>
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}

           {/* VUE LISTE */}
           {viewMode === 'list' && (
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                   <tr>
                     <th className="p-4">Produit</th>
                     <th className="p-4">Statut</th>
                     <th className="p-4 text-right">Votre Gain</th>
                     <th className="p-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {filteredProducts.map(product => (
                     <tr key={product.id} className={`hover:bg-gray-50 ${!product.inStock ? 'opacity-70 bg-gray-50' : ''}`}>
                       <td className="p-4 flex items-center gap-4">
                         <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt=""/>
                         <div>
                           <p className="font-bold text-gray-800 flex items-center gap-2">
                                {product.name}
                                {!product.inStock && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">RUPTURE</span>}
                           </p>
                           <p className="text-xs text-gray-500">{product.category}</p>
                         </div>
                       </td>
                       <td className="p-4">{getStatusBadge(product.status)}</td>
                       <td className="p-4 text-right">
                         <span className="font-mono font-bold text-brand-brown bg-brand-beige/20 px-2 py-1 rounded">{product.supplierPrice} F</span>
                       </td>
                       <td className="p-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={() => toggleStock(product)} className={`p-1.5 rounded-md ${product.inStock ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}><Power size={16}/></button>
                            <button onClick={() => openEditModal(product)} className="p-1.5 rounded-md text-gray-500 bg-gray-100 hover:bg-gray-200"><Edit3 size={16}/></button>
                            <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-md text-red-500 bg-red-50 hover:bg-red-100"><Trash2 size={16}/></button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </>
      )}

      {/* --- MODAL (AJOUT ET ÉDITION) --- */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative border-t-4 border-brand-brown">
            <button onClick={closeModals} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"><X size={20}/></button>
            
            <div className="p-8">
               <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                   {isEditModalOpen ? "Modifier le produit" : "Proposer un produit"}
               </h2>
               <p className="text-sm text-gray-500 mb-6">
                   {isEditModalOpen 
                    ? "Mettez à jour les informations. Le prix ne peut pas être modifié ici." 
                    : "Remplissez les informations. L'administrateur validera le prix final."}
               </p>
               
               <form onSubmit={isEditModalOpen ? handleUpdate : handleSubmit} className="space-y-5">
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom du produit</label>
                    <input 
                      required type="text" placeholder="Ex: Croissant au beurre"
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-beige outline-none font-bold text-gray-800"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                      <select 
                        required
                        className="w-full p-4 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-brand-beige outline-none cursor-pointer"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                         <option value="">Choisir...</option>
                         {/* C'EST ICI : On boucle sur les catégories de l'Admin */}
                         {config.categories?.map(cat => (
                             <option key={cat.id} value={cat.name}>{cat.name}</option>
                         ))}
                      </select>
                   </div>
                   
                   {/* PRIX FOURNISSEUR */}
                   <div>
                      <label className="block text-sm font-bold text-brand-brown mb-2 flex items-center gap-1">
                        <DollarSign size={14}/> Votre Prix
                      </label>
                      <input 
                        required 
                        type="number" min="100" 
                        disabled={isEditModalOpen} // BLOQUÉ EN ÉDITION
                        placeholder="Ex: 500"
                        className={`w-full p-4 border rounded-xl font-bold ${
                            isEditModalOpen 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                            : 'bg-brand-beige/20 text-brand-brown border-brand-beige/50 focus:ring-2 focus:ring-brand-beige outline-none'
                        }`}
                        value={formData.supplierPrice} onChange={e => setFormData({...formData, supplierPrice: e.target.value})}
                      />
                   </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea 
                      rows="3" placeholder="Ingrédients, taille, détails..."
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-beige outline-none"
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                 </div>

                 {/* GESTION IMAGE */}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Photo du produit</label>
                    
                    {/* Prévisualisation en édition */}
                    {isEditModalOpen && formData.currentImage && !formData.imageUrl && !formData.imageFile && (
                        <div className="mb-3 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                            <img src={formData.currentImage} alt="Actuelle" className="w-full h-full object-cover"/>
                        </div>
                    )}

                    <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
                       <button type="button" onClick={() => setFormData({...formData, imageType: 'url'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${formData.imageType === 'url' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Lien URL</button>
                       <button type="button" onClick={() => setFormData({...formData, imageType: 'file'})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${formData.imageType === 'file' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Fichier</button>
                    </div>
                    
                    {formData.imageType === 'url' ? (
                      <input 
                        placeholder="https://..." 
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm" 
                        value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                      />
                    ) : (
                      <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition group">
                         <input type="file" accept="image/*" onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})} className="hidden" />
                         <UploadCloud size={32} className="text-gray-400 group-hover:text-brand-brown mb-2 transition"/>
                         <span className="font-bold text-xs text-gray-600">{formData.imageFile ? formData.imageFile.name : "Cliquez pour uploader"}</span>
                      </label>
                    )}
                 </div>

                 <button 
                    type="submit" disabled={uploading}
                    className="w-full bg-brand-brown text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                 >
                    {uploading ? 'Traitement...' : (isEditModalOpen ? 'Enregistrer les modifications' : 'Soumettre à validation')}
                 </button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProducts;