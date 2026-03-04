/**
 * @file AddEditOrder.jsx
 * @description View for creating and editing orders, includes product management.
 * @author Sharon Barrial
 * @date 2026-03-04
 */

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createOrder, updateOrder, getOrderById, getProducts } from "../services/api";

function AddEditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    orderNumber: "",
    status: "Pending",
  });

  const [availableProducts, setAvailableProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal agregar producto
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ productId: "", quantity: 1 });

  // Modal editar producto
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState(1);

  // Auto-calculados
  const today = new Date().toISOString().split("T")[0];
  const productsCount = orderItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const finalPrice = orderItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

  useEffect(() => {
    loadAvailableProducts();
    if (isEditMode) loadOrder();
  }, [id]);

  const loadAvailableProducts = async () => {
    try {
      const data = await getProducts();
      setAvailableProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  const loadOrder = async () => {
    try {
      setLoading(true);
      const order = await getOrderById(id);
      setFormData({
        orderNumber: order.orderNumber || "",
        status: order.status || "Pending",
      });
      if (order.items && order.items.length > 0) {
        setOrderItems(
          order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            unitPrice: Number(item.unitPrice),
            quantity: Number(item.quantity),
          }))
        );
      }
    } catch (err) {
      setError("Error al cargar la orden: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add product modal
  const openAddModal = () => {
    setAddForm({ productId: "", quantity: 1 });
    setShowAddModal(true);
  };

  const confirmAddProduct = () => {
    if (!addForm.productId || Number(addForm.quantity) < 1) {
      alert("Selecciona un producto y una cantidad válida.");
      return;
    }
    const product = availableProducts.find((p) => p.id === Number(addForm.productId));
    if (!product) return;

    const exists = orderItems.find((item) => item.productId === product.id);
    if (exists) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + Number(addForm.quantity) }
            : item
        )
      );
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.unitPrice),
          quantity: Number(addForm.quantity),
        },
      ]);
    }
    setShowAddModal(false);
  };

  // Edit profuct modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditQty(item.quantity);
    setShowEditModal(true);
  };

  const confirmEditProduct = () => {
    if (Number(editQty) < 1) {
      alert("La cantidad debe ser al menos 1.");
      return;
    }
    setOrderItems((prev) =>
      prev.map((item) =>
        item.productId === editingItem.productId
          ? { ...item, quantity: Number(editQty) }
          : item
      )
    );
    setShowEditModal(false);
    setEditingItem(null);
  };

  // Remove product
  const removeItem = (productId) => {
    if (window.confirm("¿Estás seguro que quieres quitar este producto de la orden?")) {
      setOrderItems((prev) => prev.filter((item) => item.productId !== productId));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.orderNumber.trim()) {
      alert("El número de orden es requerido.");
      return;
    }
    try {
      setLoading(true);
      const orderData = {
        orderNumber: formData.orderNumber.trim(),
        date: today,
        status: formData.status,
        productsCount,
        finalPrice: Number(finalPrice.toFixed(2)),
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      if (isEditMode) {
        await updateOrder(id, orderData);
        alert("✅ Orden actualizada!");
      } else {
        await createOrder(orderData);
        alert("✅ Orden creada!");
      }
      navigate("/my-orders");
    } catch (err) {
      setError("Error al guardar: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainer}>
      <div style={cardStyle}>
        <h1 style={{ marginBottom: "25px", textAlign: "center" }}>
          {isEditMode ? "Editar Orden" : "Agregar Orden"}
        </h1>

        {error && (
          <div style={errorBox}>{error}</div>
        )}

        {loading && <p>Cargando...</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/*oder number*/}
          <div style={fieldGroup}>
            <label style={labelStyle}>Número de Orden</label>
            <input
              type="text"
              name="orderNumber"
              placeholder="Ej: ORD-001"
              value={formData.orderNumber}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/*date*/}
          <div style={fieldGroup}>
            <label style={labelStyle}>Fecha</label>
            <input
              type="date"
              value={today}
              disabled
              style={{ ...inputStyle, background: "#f3f4f6", color: "#888", cursor: "not-allowed" }}
            />
          </div>

          {/*producst quantity*/}
          <div style={fieldGroup}>
            <label style={labelStyle}>Cantidad de Productos</label>
            <input
              type="number"
              value={productsCount}
              disabled
              style={{ ...inputStyle, background: "#f3f4f6", color: "#888", cursor: "not-allowed" }}
            />
          </div>

          {/*final price*/}
          <div style={fieldGroup}>
            <label style={labelStyle}>Precio Final</label>
            <input
              type="text"
              value={`$${finalPrice.toFixed(2)}`}
              disabled
              style={{ ...inputStyle, background: "#f3f4f6", color: "#888", cursor: "not-allowed" }}
            />
          </div>

          {/*Status*/}
          <div style={fieldGroup}>
            <label style={labelStyle}>Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/*products table*/}
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <label style={{ ...labelStyle, fontSize: "14px" }}>Productos en la Orden</label>
              <button type="button" onClick={openAddModal} style={addProductBtn}>
                ➕ Agregar Producto
              </button>
            </div>

            {orderItems.length === 0 ? (
              <div style={emptyProducts}>No hay productos agregados aún.</div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Precio Unit.</th>
                    <th style={thStyle}>Qty</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={item.productId} style={{ background: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                      <td style={tdStyle}>{item.productId}</td>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>${Number(item.unitPrice).toFixed(2)}</td>
                      <td style={tdStyle}>{item.quantity}</td>
                      <td style={tdStyle}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                      <td style={tdStyle}>
                        <button type="button" onClick={() => openEditModal(item)} style={editBtn}>
                          ✏️ Edit
                        </button>
                        <button type="button" onClick={() => removeItem(item.productId)} style={deleteBtn}>
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/*btns*/}
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" style={saveBtn} disabled={loading}>
              {loading ? "Guardando..." : "💾 Guardar"}
            </button>
            <button type="button" onClick={() => navigate("/my-orders")} style={cancelBtn} disabled={loading}>
              ⬅ Atrás
            </button>
          </div>
        </form>
      </div>

      {/*modal add product*/}
      {showAddModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h2 style={{ marginBottom: "20px" }}>Agregar Producto</h2>

            <div style={fieldGroup}>
              <label style={labelStyle}>Producto</label>
              <select
                value={addForm.productId}
                onChange={(e) => setAddForm({ ...addForm, productId: e.target.value })}
                style={inputStyle}
              >
                <option value="">-- Selecciona un producto --</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${Number(p.unitPrice).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ ...fieldGroup, marginTop: "14px" }}>
              <label style={labelStyle}>Cantidad</label>
              <input
                type="number"
                min="1"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={confirmAddProduct} style={saveBtn}>✅ Confirmar</button>
              <button onClick={() => setShowAddModal(false)} style={cancelBtn}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/*modal edi0t product*/}
      {showEditModal && editingItem && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h2 style={{ marginBottom: "20px" }}>Editar Producto</h2>

            <div style={fieldGroup}>
              <label style={labelStyle}>Producto</label>
              <input
                type="text"
                value={editingItem.name}
                disabled
                style={{ ...inputStyle, background: "#f3f4f6", color: "#888" }}
              />
            </div>

            <div style={{ ...fieldGroup, marginTop: "14px" }}>
              <label style={labelStyle}>Cantidad</label>
              <input
                type="number"
                min="1"
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button onClick={confirmEditProduct} style={saveBtn}>✅ Confirmar</button>
              <button onClick={() => setShowEditModal(false)} style={cancelBtn}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const pageContainer = {
  minHeight: "100vh",
  background: "#f8f8f8",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "40px 20px",
};

const cardStyle = {
  background: "#ffffff",
  padding: "35px",
  borderRadius: "14px",
  width: "100%",
  maxWidth: "700px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
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

const errorBox = {
  padding: "10px",
  background: "#ffcccc",
  borderRadius: "8px",
  marginBottom: "15px",
  color: "#c00",
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
  border: "1px solid #e5e7eb",
  background: "#e7e5e5",
  cursor: "pointer",
  flex: 1,
  fontWeight: "bold",
};

const addProductBtn = {
  padding: "7px 14px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  background: "#e7e5e5",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "13px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  overflow: "hidden",
};

const thStyle = {
  textAlign: "left",
  padding: "10px 12px",
  background: "#f3f4f6",
  color: "#666",
  fontWeight: "600",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #f0f0f0",
};

const editBtn = {
  padding: "5px 10px",
  borderRadius: "6px",
  border: "1px solid #e6e6e6",
  background: "#e6e6e6",
  cursor: "pointer",
  marginRight: "6px",
  fontWeight: "bold",
  fontSize: "12px",
};

const deleteBtn = {
  padding: "5px 10px",
  borderRadius: "6px",
  border: "1px solid #facfcf",
  background: "#facfcf",
  color: "#b91c1c",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "12px",
};

const emptyProducts = {
  padding: "20px",
  textAlign: "center",
  color: "#999",
  background: "#f9f9f9",
  borderRadius: "8px",
  border: "1px dashed #e5e7eb",
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

export default AddEditOrder;