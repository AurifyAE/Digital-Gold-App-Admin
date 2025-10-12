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
    const [existingImage, setExistingImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');

    const [productFormData, setProductFormData] = useState({
        title: '',
        description: '',
        category: '',
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
            console.log('Fetched categories:', response.data.data);
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
            console.log('Fetched products:', response.data.data);
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
        getCategoryName(product.category_id?._id)?.toLowerCase().includes(searchQuery.toLowerCase())
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
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleProductSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields for add (for update, allow partial if at least one change)
            if (!productFormData.title) {
                setError('Product title is required');
                setLoading(false);
                return;
            }
            if (!productFormData.category || !categories.find(cat => cat._id === productFormData.category)) {
                setError('Please select a valid category');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            let changesDetected = false;

            // Helper to clean up original values for comparison
            const getOriginalValue = (original, key) => {
                const value = original[key] === undefined || original[key] === null ? '' : original[key].toString();
                return value;
            };

            if (editingProduct) {
                // --- UPDATE LOGIC: Append ONLY changed or required fields ---
                formData.append('id', editingProduct._id);
                const original = editingProduct;

                // Title (Required field)
                if (productFormData.title !== original.title) {
                    formData.append('title', productFormData.title);
                    changesDetected = true;
                }

                // Description
                if (productFormData.description !== (original.description || '')) {
                    formData.append('description', productFormData.description || '');
                    changesDetected = true;
                }

                // Category (Required field logic adjusted for object structure)
                const originalCategoryId = original.category_id?._id || original.category_id;
                if (productFormData.category && productFormData.category !== originalCategoryId) {
                    formData.append('category', productFormData.category);
                    changesDetected = true;
                }

                // Material
                if (productFormData.material !== (original.material || '')) {
                    formData.append('material', productFormData.material || '');
                    changesDetected = true;
                }

                // Metal Purity
                if (productFormData.metal_purity !== (original.metal_purity || '')) {
                    formData.append('metal_purity', productFormData.metal_purity || '');
                    changesDetected = true;
                }

                // Metal Color
                if (productFormData.metal_color !== (original.metal_color || '')) {
                    formData.append('metal_color', productFormData.metal_color || '');
                    changesDetected = true;
                }

                // Gold Weight
                const newWeight = productFormData.gold_weight_grams.toString();
                const originalWeight = getOriginalValue(original, 'gold_weight_grams');
                if (newWeight !== originalWeight) {
                    formData.append('gold_weight_grams', newWeight);
                    changesDetected = true;
                }

                // Finish
                if (productFormData.finish !== (original.finish || '')) {
                    formData.append('finish', productFormData.finish || '');
                    changesDetected = true;
                }

                // Dimensions (Complex field comparison)
                const origDims = original.dimensions_mm || { length: '', width: '', thickness: '' };
                const newDims = productFormData.dimensions_mm;
                
                // Compare all dimension fields
                if (
                    newDims.length !== (origDims.length || '') ||
                    newDims.width !== (origDims.width || '') ||
                    newDims.thickness !== (origDims.thickness || '')
                ) {
                    formData.append('dimensions_mm', JSON.stringify(newDims));
                    changesDetected = true;
                }

                // Image - only if a new file selected
                if (productFormData.image) {
                    formData.append('image', productFormData.image);
                    changesDetected = true;
                } else if (existingImage) {
                    // Send a flag to tell the backend to keep the existing image path
                    formData.append('keepExistingImage', 'true');
                }

                // If only 'id' and 'keepExistingImage' are present, no meaningful change occurred
                if (!changesDetected) {
                    setError('No changes detected');
                    setLoading(false);
                    return;
                }
                
                console.log('FormData Contents for Update (Only Edited Fields):');
                for (const [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }

                await updateProduct(formData);
                setSuccess('Product updated successfully!');

            } else {
                // For Add: append all non-empty (standard logic)
                formData.append('title', productFormData.title);
                formData.append('category', productFormData.category);
                if (productFormData.description) formData.append('description', productFormData.description);
                if (productFormData.material) formData.append('material', productFormData.material);
                if (productFormData.metal_purity) formData.append('metal_purity', productFormData.metal_purity);
                if (productFormData.metal_color) formData.append('metal_color', productFormData.metal_color);
                if (productFormData.gold_weight_grams) formData.append('gold_weight_grams', productFormData.gold_weight_grams);
                if (productFormData.finish) formData.append('finish', productFormData.finish);
                
                const dimensions = productFormData.dimensions_mm;
                if (dimensions.length || dimensions.width || dimensions.thickness) {
                    formData.append('dimensions_mm', JSON.stringify(dimensions));
                }
                
                if (productFormData.image) {
                    formData.append('image', productFormData.image);
                }
                
                console.log('FormData Contents for Add:');
                for (const [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }

                await addProduct(formData);
                setSuccess('Product added successfully!');
            }

            await loadProducts();
            resetProductForm();
        } catch (err) {
            console.error('Error saving product:', err);
            // This error handling remains crucial for catching the original backend TypeError 
            // if we missed any field that the backend expects unconditionally.
            setError(err.response?.data?.message || 'Failed to save product. If this is an update, check the network tab for missing fields.');
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);

        try {
            if (editingCategory) {
                // Ensure name is passed for update if it changed. Since Category has one field, we can assume it's updated.
                if (categoryFormData.name !== editingCategory.name) {
                     await updateCategory({ id: editingCategory._id, name: categoryFormData.name });
                     setSuccess('Category updated successfully!');
                } else {
                    setError('No changes detected in category name.');
                    setLoading(false);
                    return;
                }
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
        setEditingProduct(product);
        setExistingImage(product.image || null);
        
        // Ensure dimensions are initialized correctly, handling null/undefined defaults
        const dimensions_mm = product.dimensions_mm || {};

        setProductFormData({
            title: product.title || '',
            description: product.description || '',
            category: product.category_id?._id || product.category_id || '',
            image: null,
            material: product.material || '',
            metal_purity: product.metal_purity || '',
            metal_color: product.metal_color || '',
            // Ensure numbers are handled as strings for consistency with input fields
            gold_weight_grams: product.gold_weight_grams?.toString() || '',
            finish: product.finish || '',
            dimensions_mm: { 
                length: dimensions_mm.length?.toString() || '', 
                width: dimensions_mm.width?.toString() || '', 
                thickness: dimensions_mm.thickness?.toString() || '' 
            }
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
        setConfirmMessage('Are you sure you want to delete this product?');
        setConfirmAction(() => async () => {
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
                setShowConfirmModal(false);
            }
        });
        setShowConfirmModal(true);
    };

    const handleDeleteCategory = async (id) => {
        setConfirmMessage('Are you sure you want to delete this category?');
        setConfirmAction(() => async () => {
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
                setShowConfirmModal(false);
            }
        });
        setShowConfirmModal(true);
    };

    const resetProductForm = () => {
        setProductFormData({
            title: '',
            description: '',
            category: '',
            image: null,
            material: '',
            metal_purity: '',
            metal_color: '',
            gold_weight_grams: '',
            finish: '',
            dimensions_mm: { length: '', width: '', thickness: '' }
        });
        setEditingProduct(null);
        setExistingImage(null);
        setImagePreview(null);
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
                            <path stroke="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{success}</span>
                    </motion.div>
                )}
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirmModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Confirm Deletion</h2>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">{confirmMessage}</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmAction}
                                    disabled={loading}
                                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
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
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'products'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Package className="w-4 h-4 inline-block mr-2" />
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'categories'
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
                    onClick={activeTab === 'products' ? openProductModal : openCategoryModal
                    }
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
                                            key={product._id}
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getCategoryName(product.category_id?._id)}</td>
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
                                                        onClick={() => handleDeleteProduct(product._id)}
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
                                                name="category"
                                                value={productFormData.category}
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                        {existingImage && !productFormData.image && (
                                            <div className="mb-2">
                                                <p className="text-sm text-gray-600">Current Image:</p>
                                                <img src={existingImage} alt="Current product" className="w-24 h-24 object-cover rounded-lg" />
                                            </div>
                                        )}
                                        {imagePreview && (
                                            <div className="mb-2">
                                                <p className="text-sm text-gray-600">Selected Image Preview:</p>
                                                <img src={imagePreview} alt="Selected preview" className="w-24 h-24 object-cover rounded-lg" />
                                            </div>
                                        )}
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
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50  transition-colors text-sm"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {productFormData.image ? productFormData.image.name : existingImage ? 'Replace Image' : 'Choose file'}
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