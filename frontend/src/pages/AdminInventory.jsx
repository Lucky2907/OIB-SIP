import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import '../styles/Admin.css';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'base',
    quantity: 0,
    price: 0,
    threshold: 20,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/inventory/${editItem._id}`, formData);
        toast.success('Item updated successfully');
      } else {
        await api.post('/inventory', formData);
        toast.success('Item added successfully');
      }
      setShowModal(false);
      setEditItem(null);
      resetForm();
      fetchInventory();
    } catch (error) {
      toast.error('Operation failed');
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      threshold: item.threshold,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        toast.success('Item deleted successfully');
        fetchInventory();
      } catch (error) {
        toast.error('Failed to delete item');
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'base',
      quantity: 0,
      price: 0,
      threshold: 20,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-container">
      <div className="header-actions">
        <h1>Inventory Management</h1>
        <button
          onClick={() => {
            resetForm();
            setEditItem(null);
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          Add New Item
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Threshold</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td className={item.quantity <= item.threshold ? 'low-stock' : ''}>
                  {item.quantity}
                </td>
                <td>₹{item.price}</td>
                <td>{item.threshold}</td>
                <td>
                  {item.isAvailable ? (
                    <span className="badge-success">Available</span>
                  ) : (
                    <span className="badge-danger">Out of Stock</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editItem ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="base">Base</option>
                  <option value="sauce">Sauce</option>
                  <option value="cheese">Cheese</option>
                  <option value="veggies">Veggies</option>
                  <option value="meat">Meat</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Threshold</label>
                <input
                  type="number"
                  name="threshold"
                  value={formData.threshold}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditItem(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
