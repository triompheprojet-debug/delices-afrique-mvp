import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Star, X, Save, Image as ImageIcon } from 'lucide-react';
import initialProducts from '../../data/products.json';

const Products = () => {
  // État local des produits (simule la base de données pour la session)
  const [products, setProducts] = useState(initialProducts);
  
  // État pour la fenêtre modale (Ajout/Edition)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // --- ACTIONS ---

  // Supprimer un produit 
  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Basculer le statut Promo 
  const togglePromo = (id) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isPromoted: !p.isPromoted } : p
    ));
  };

  // Ouvrir le modal (Mode Création ou Édition)
  const openModal = (product = null) => {
    setCurrentProduct(product || {
      id: null,
      name: '',
      category: 'Gâteaux',
      price: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000', // Image par défaut
      isPromoted: false,
      isNew: false
    });
    setIsModalOpen(true);
  };

  // Sauvegarder (Ajout ou Modification) 
  const handleSave = (e) => {
    e.preventDefault();
    if (currentProduct.id) {
      // Modification
      setProducts(products.map(p => p.id === currentProduct.id ? currentProduct : p));
    } else {
      // Création (Nouvel ID)
      const newProduct = { ...currentProduct, id: Date.now(), price: Number(currentProduct.price) };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  // Helper pour les champs du formulaire
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCurrentProduct({ ...currentProduct, [e.target.name]: value });
  };

  return (
    <div>
      {/* En-tête de la page */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mes Produits</h1>
          <p className="text-gray-500">Gérez votre menu, vos prix et vos promotions.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-brand-brown hover:bg-brand-beige text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg"
        >
          <Plus size={20} />
          Ajouter un produit
        </button>
      </div>

      {/* Tableau des produits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Prix</th>
              <th className="px-6 py-4 text-center">Badges</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition group">
                {/* Image + Nom */}
                <td className="px-6 py-4 flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  <div>
                    <p className="font-bold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.description}</p>
                  </div>
                </td>
                
                {/* Catégorie */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                    {product.category}
                  </span>
                </td>
                
                {/* Prix */}
                <td className="px-6 py-4 font-bold text-brand-brown">
                  {product.price.toLocaleString()} FCFA
                </td>

                {/* Badges (Switchs rapides) */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {/* Switch Promo */}
                    <button 
                      onClick={() => togglePromo(product.id)}
                      className={`p-2 rounded-full transition ${product.isPromoted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}
                      title="Activer/Désactiver Promo"
                    >
                      <Tag size={16} />
                    </button>
                    {/* Badge Nouveau (Visuel seulement pour l'instant) */}
                    <span className={`p-2 rounded-full ${product.isNew ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                      <Star size={16} />
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => openModal(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            Aucun produit trouvé. Ajoutez-en un !
          </div>
        )}
      </div>

      {/* --- MODAL (FORMULAIRE) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-brand-brown text-white">
              <h3 className="font-bold text-lg">
                {currentProduct.id ? 'Modifier le produit' : 'Nouveau produit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nom du produit</label>
                <input type="text" name="name" value={currentProduct.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none" placeholder="Ex: Gâteau Ananas" />
              </div>

              {/* Catégorie & Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                  <select name="category" value={currentProduct.category} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 bg-white">
                    <option>Gâteaux</option>
                    <option>Tartes</option>
                    <option>Viennoiseries</option>
                    <option>Boissons</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Prix (FCFA)</label>
                  <input type="number" name="price" value={currentProduct.price} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description courte</label>
                <textarea name="description" value={currentProduct.description} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-beige outline-none"></textarea>
              </div>

              {/* Options (Switchs) */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isPromoted" checked={currentProduct.isPromoted} onChange={handleChange} className="w-4 h-4 text-brand-red rounded border-gray-300 focus:ring-brand-red" />
                  <span className="text-sm font-medium text-gray-700">En Promotion</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isNew" checked={currentProduct.isNew} onChange={handleChange} className="w-4 h-4 text-brand-green rounded border-gray-300 focus:ring-brand-green" />
                  <span className="text-sm font-medium text-gray-700">Nouveauté</span>
                </label>
              </div>

              {/* URL Image (Simulation) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <ImageIcon size={16}/> URL de l'image
                </label>
                <input type="text" name="image" value={currentProduct.image} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-500" placeholder="https://..." />
              </div>

              {/* Bouton Sauvegarder */}
              <button 
                type="submit" 
                className="w-full bg-brand-brown hover:bg-brand-beige text-white py-3 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 mt-4"
              >
                <Save size={20} />
                Enregistrer le produit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;