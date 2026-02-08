import { useState, useEffect } from 'react';
import { createCategory, getCategories, deleteCategory } from '../services/categoryService';
import '../styles/Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.category || []);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      await createCategory(newCategory);
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="categories-container">
      <h2>📁 Food Categories</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleAddCategory} className="category-form">
        <input
          type="text"
          placeholder="Enter new category (e.g., Dairy, Vegetables, Meat)"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      <div className="categories-list">
        {categories.length === 0 ? (
          <p>No categories yet. Create one to get started!</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="category-item">
              <span>{cat.name || cat.category}</span>
              <button
                className="delete-btn"
                onClick={() => handleDeleteCategory(cat.id)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Categories;
