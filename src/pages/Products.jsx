import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, X, Search, Upload, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategory, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, fetchProducts, deleteProduct } from '../api/api';

const Products = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('product');
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [productFormData, setProductFormData] = useState({
        title: '',
        description: '',
        category_id: '',
        image: null,
        material: '',
        metal_purity: '',
        metal_color: '',
        gold_weight_grams: '',
        finish: '',
        dimensions_mm: { length: '', width: '', thickness: '' }
    });

    const [categoryFormData, setCategoryFormData] = useState({
        name: ''
    });

    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await fetchCategory();
            setCategories(response.data.data);
            console.log('Fetched categories:', response.data.data); // Debug categories
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await fetchProducts();
            setProducts(response.data.data);
            console.log('Fetched products:', response.data.data); // Debug product data
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : 'Unknown';
    };

    const filteredProducts = products.filter(product =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category || getCategoryName(product.category_id) || 'Unknown')?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredCategories = categories.filter(category =>
        category.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('dimensions_')) {
            const dimension = name.split('_')[1];
            setProductFormData(prev => ({
                ...prev,
                dimensions_mm: { ...prev.dimensions_mm, [dimension]: value }
            }));
        } else {
            console.log(`Input changed: ${name} = ${value}`); // Debug input changes
            setProductFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCategoryInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductFormData(prev => ({ ...prev, image: file }));
        }
    };

    const handleProductSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);

        try {
            // Validate category_id
            const selectedCategory = categories.find(cat => cat._id === productFormData.category_id);
            if (!selectedCategory && productFormData.category_id) {
                console.warn('Invalid category_id:', productFormData.category_id);
                setError('Selected category is invalid. Please choose a valid category.');
                return;
            }

            const formData = new FormData();
            Object.keys(productFormData).forEach(key => {
                if (key === 'dimensions_mm') {
                    formData.append(key, JSON.stringify(productFormData[key]));
                } else if (key === 'image' && productFormData[key]) {
                    formData.append(key, productFormData[key]);
                } else {
                    formData.append(key, productFormData[key]);
                }
            });

            // Log FormData contents
            console.log('Submitting FormData:');
            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
                setSuccess('Product updated successfully!');
            } else {
                await addProduct(formData);
                setSuccess('Product added successfully!');
            }
            await loadProducts();
            resetProductForm();
        } catch (err) {
            console.error('Error saving product:', err);
            setError(err.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);

        try {
            if (editingCategory) {
                await updateCategory({id: editingCategory._id, name: categoryFormData.name});
                setSuccess('Category updated successfully!');
            } else {
                await addCategory(categoryFormData);
                setSuccess('Category added successfully!');
            }
            await loadCategories();
            resetCategoryForm();
        } catch (err) {
            console.error('Error saving category:', err);
            setError('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProduct = (product) => {
        console.log('Editing product:', product); // Debug product data
        // Map category name to ID if product has category name instead of ID
        const categoryId = product.category
            ? categories.find(cat => cat.name === product.category)?._id || ''
            : product.category_id || '';
        if (!categoryId && product.category) {
            console.warn('No matching category ID found for category name:', product.category);
        }
        setEditingProduct(product);
        setProductFormData({
            title: product.title || '',
            description: product.description || '',
            category_id: categoryId,
            image: null,
            material: product.material || '',
            metal_purity: product.metal_purity || '',
            metal_color: product.metal_color || '',
            gold_weight_grams: product.gold_weight_grams || '',
            finish: product.finish || '',
            dimensions_mm: product.dimensions_mm || { length: '', width: '', thickness: '' }
        });
        setModalType('product');
        setShowModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryFormData({
            name: category.name
        });
        setModalType('category');
        setShowModal(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        setLoading(true);
        try {
            await deleteProduct(id);
            setSuccess('Product deleted successfully!');
            await loadProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            setError('Failed to delete product');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        setLoading(true);
        try {
            await deleteCategory(id);
            setSuccess('Category deleted successfully!');
            await loadCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            setError('Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    const resetProductForm = () => {
        setProductFormData({
            title: '',
            description: '',
            category_id: '',
            image: null,
            material: '',
            metal_purity: '',
            metal_color: '',
            gold_weight_grams: '',
            finish: '',
            dimensions_mm: { length: '', width: '', thickness: '' }
        });
        setEditingProduct(null);
        setShowModal(false);
    };

    const resetCategoryForm = () => {
        setCategoryFormData({
            name: ''
        });
        setEditingCategory(null);
        setShowModal(false);
    };

    const openProductModal = () => {
        setModalType('product');
        setShowModal(true);
    };

    const openCategoryModal = () => {
        setModalType('category');
        setShowModal(true);
    };

    const SkeletonRow = ({ columns }) => (
        <tr className="animate-pulse">
            {[...Array(columns)].map((_, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
            ))}
        </tr>
    );

    return (
        <div className="max-w-7xl mx-auto my-6 px-6">
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg bg-red-500 text-white text-xs font-medium flex items-center space-x-2"
                    >
                        <X className="w-4 h-4" />
                        <span>{error}</span>
                    </motion.div>
                )}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg bg-green-500 text-white text-xs font-medium flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{success}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your products and categories</p>
                </div>
            </div>

            <div className="mb-6 flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'products'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Package className="w-4 h-4 inline-block mr-2" />
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'categories'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Tag className="w-4 h-4 inline-block mr-2" />
                    Categories
                </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={activeTab === 'products' ? openProductModal : openCategoryModal}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add {activeTab === 'products' ? 'Product' : 'Category'}
                </motion.button>
            </div>

            {activeTab === 'products' ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (g)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading && !showModal ? (
                                    <>{[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} columns={8} />)}</>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product, index) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                                                        <Package className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{product.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category || getCategoryName(product.category_id)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{product.material}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.metal_purity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{product.metal_color}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.gold_weight_grams}g</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-xs font-medium"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center">
                                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No products found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading && !showModal ? (
                                    <>{[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} columns={3} />)}</>
                                ) : filteredCategories.length > 0 ? (
                                    filteredCategories.map((category, index) => (
                                        <motion.tr
                                            key={category._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                                                        <Tag className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-xs font-medium"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center">
                                            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 text-sm">No categories found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                        onClick={modalType === 'product' ? resetProductForm : resetCategoryForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {modalType === 'product' 
                                        ? (editingProduct ? 'Edit Product' : 'Add New Product')
                                        : (editingCategory ? 'Edit Category' : 'Add New Category')
                                    }
                                </h2>
                                <button 
                                    onClick={modalType === 'product' ? resetProductForm : resetCategoryForm} 
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {modalType === 'category' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={categoryFormData.name}
                                            onChange={handleCategoryInputChange}
                                            required
                                            placeholder="e.g., Necklace, Ring, Bracelet"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetCategoryForm}
                                            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCategorySubmit}
                                            disabled={loading}
                                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Saving...' : editingCategory ? 'Update' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={productFormData.title}
                                            onChange={handleProductInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={productFormData.description}
                                            onChange={handleProductInputChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                name="category_id"
                                                value={productFormData.category_id}
                                                onChange={handleProductInputChange}
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat._id}>{cat.name || cat._id}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                                            <input
                                                type="text"
                                                name="material"
                                                value={productFormData.material}
                                                onChange={handleProductInputChange}
                                                placeholder="e.g., gold, silver"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {productFormData.image ? productFormData.image.name : 'Choose file'}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Metal Purity</label>
                                            <input
                                                type="text"
                                                name="metal_purity"
                                                value={productFormData.metal_purity}
                                                onChange={handleProductInputChange}
                                                placeholder="e.g., 22K, 18K"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Metal Color</label>
                                            <input
                                                type="text"
                                                name="metal_color"
                                                value={productFormData.metal_color}
                                                onChange={handleProductInputChange}
                                                placeholder="e.g., yellow, white"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Finish</label>
                                            <input
                                                type="text"
                                                name="finish"
                                                value={productFormData.finish}
                                                onChange={handleProductInputChange}
                                                placeholder="e.g., polished"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gold Weight (grams)</label>
                                        <input
                                            type="number"
                                            name="gold_weight_grams"
                                            value={productFormData.gold_weight_grams}
                                            onChange={handleProductInputChange}
                                            step="0.1"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (mm)</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Length</label>
                                                <input
                                                    type="number"
                                                    name="dimensions_length"
                                                    value={productFormData.dimensions_mm.length}
                                                    onChange={handleProductInputChange}
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Width</label>
                                                <input
                                                    type="number"
                                                    name="dimensions_width"
                                                    value={productFormData.dimensions_mm.width}
                                                    onChange={handleProductInputChange}
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Thickness</label>
                                                <input
                                                    type="number"
                                                    name="dimensions_thickness"
                                                    value={productFormData.dimensions_mm.thickness}
                                                    onChange={handleProductInputChange}
                                                    step="0.1"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={resetProductForm}
                                            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleProductSubmit}
                                            disabled={loading}
                                            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Saving...' : editingProduct ? 'Update' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;