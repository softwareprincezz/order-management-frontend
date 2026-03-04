/**
 * @file Products.jsx
 * @description View to list, add, edit and delete products from the catalog.
 * @author Sharon Barrial
 * @date 2026-03-04
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/api";

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", unitPrice: "" });
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", unitPrice: "" });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, unitPrice: product.unitPrice });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: "", unitPrice: "" });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || formData.unitPrice === "") {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        unitPrice: Number(formData.unitPrice),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...payload } : p
          )
        );
      } else {
        const result = await createProduct(payload);
        await loadProducts();
      }

      closeModal();
    } catch (err) {
      alert("Error al guardar producto: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro que quieres eliminar este producto?")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        alert("Error al eliminar producto: " + err.message);
      }
    }
  };

  return (
    <div style={{ padding: "40px", background: "#f8f8f8", minHeight: "100vh", color: "#111" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Productos</h1>
        <button onClick={() => navigate("/my-orders")} style={backBtn}>
          ⬅ Mis Órdenes
        </button>
      </div>

      {error && (
        <div style={{ padding: "10px", background: "#ffcccc", borderRadius: "8px", marginBottom: "20px", color: "#c00" }}>
          {error}
        </div>
      )}

      {loading && <p>Cargando productos...</p>}

      <button onClick={openCreateModal} style={addBtn}>
        ➕ Agregar Producto
      </button>

      {!loading && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Precio Unitario</th>
              <th style={thStyle}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ background: "#f9f9f9" }}>
                <td style={tdStyle}>{product.id}</td>
                <td style={tdStyle}>{product.name}</td>
                <td style={tdStyle}>${Number(product.unitPrice).toFixed(2)}</td>
                <td style={tdStyle}>
                  <button onClick={() => openEditModal(product)} style={editBtn}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(product.id)} style={deleteBtn}>
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/*mpdal edit*/}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h2 style={{ marginBottom: "20px" }}>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </h2>

            <div style={fieldGroup}>
              <label style={labelStyle}>Nombre</label>
              <input
                type="text"
                placeholder="Ej: Laptop"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ ...fieldGroup, marginTop: "14px" }}>
              <label style={labelStyle}>Precio Unitario</label>
              <input
                type="number"
                placeholder="Ej: 99.99"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={handleSave} disabled={saving} style={saveBtn}>
                {saving ? "Guardando..." : "💾 Guardar"}
              </button>
              <button onClick={closeModal} disabled={saving} style={cancelBtn}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  border: "1px solid #e5e7eb",
  borderSpacing: "0 12px",
  background: "#f3f4f6",
};

const thStyle = {
  textAlign: "left",
  padding: "12px 16px",
  color: "#666",
  fontWeight: "500",
};

const tdStyle = {
  padding: "16px",
};

const addBtn = {
  padding: "10px 24px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  background: "#e7e5e5",
  cursor: "pointer",
  marginBottom: "20px",
  fontWeight: "bold",
  color: "#313131",
};

const backBtn = {
  padding: "8px 18px",
  borderRadius: "8px",
  border: "1px solid #e6e6e6",
  background: "#e6e6e6",
  cursor: "pointer",
  fontWeight: "bold",
  color: "#313131",
};

const editBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #e6e6e6",
  background: "#e6e6e6",
  cursor: "pointer",
  marginRight: "8px",
  fontWeight: "bold",
};

const deleteBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #facfcf",
  background: "#facfcf",
  color: "#b91c1c",
  cursor: "pointer",
  fontWeight: "bold",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100,
};

const modalCard = {
  background: "#fff",
  padding: "32px",
  borderRadius: "14px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
};

const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
};

const saveBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #8bb8ff",
  background: "#8bb8ff",
  color: "black",
  cursor: "pointer",
  fontWeight: "bold",
  flex: 1,
};

const cancelBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #e6e6e6",
  background: "#e6e6e6",
  cursor: "pointer",
  flex: 1,
  fontWeight: "bold",
};

export default Products;