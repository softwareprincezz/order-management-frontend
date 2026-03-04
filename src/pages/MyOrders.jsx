/**
 * @file MyOrders.jsx
 * @description Main view that lists all orders with options to add, edit, delete and change status.
 * @author Sharon Barrial
 * @date 2026-03-04
 */

import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { getOrders, updateOrder, deleteOrder } from "../services/api";

function MyOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dropdownRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al cargar órdenes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [location, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenStatusId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro que quieres eliminar esta orden?")) {
      try {
        await deleteOrder(id);
        await loadOrders();
      } catch (err) {
        alert("Error al eliminar la orden: " + err.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffdd57";
      case "InProgress":
        return "#6ca5ff";
      case "Completed":
        return "#5dff98";
      default:
        return "#ccc";
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        background: "#f8f8f8",
        minHeight: "100vh",
        color: "#111",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Mis Órdenes</h1>

      {error && (
        <div style={{ padding: "10px", background: "#ffcccc", borderRadius: "8px", marginBottom: "20px", color: "#c00" }}>
          {error}
        </div>
      )}

      {loading && <p>Cargando órdenes...</p>}

      {/*add order button*/}
      <button
        onClick={() => navigate("/add-order")}
        style={{
          padding: "10px 34px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          background: "#e7e5e5",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: "bold",
          color: "#313131",
        }}
      >
        ➕ Agregar Orden
      </button>

      <button
        onClick={() => navigate("/products")}
        style={{
          padding: "10px 34px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          background: "#e7e5e5",
          cursor: "pointer",
          marginBottom: "20px",
          marginLeft: "10px",
          fontWeight: "bold",
          color: "#313131",
        }}
      >
        📦 Productos
      </button>

      {!loading && (
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            border: "1px solid #e5e7eb",
            borderSpacing: "0 12px",
            background: "#f3f4f6",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Order #</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}># Products</th>
              <th style={thStyle}>Final Price</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Options</th>
            </tr>
          </thead>

          <tbody>
            {[...orders].reverse().map((order) => {
              const isCompleted = order.status === "Completed";

              return (
                <tr
                  key={order.id}
                  style={{
                    background: isCompleted ? "#f0fff4" : "#f9f9f9",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <td style={tdStyle}>{order.id}</td>
                  <td style={tdStyle}>{order.orderNumber}</td>
                  <td style={tdStyle}>
                    {order.date ? order.date.split("T")[0] : ""}
                  </td>
                  <td style={tdStyle}>{order.productsCount}</td>
                  <td style={tdStyle}>${order.finalPrice}</td>

                  {/*status*/}
                  <td style={tdStyle}>
                    <div
                      ref={openStatusId === order.id ? dropdownRef : null}
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <div
                        onClick={() => {
                          if (isCompleted) return;
                          setOpenStatusId(
                            openStatusId === order.id ? null : order.id
                          );
                        }}
                        title={isCompleted ? "Las órdenes completadas no se pueden modificar" : ""}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          cursor: isCompleted ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: getStatusColor(order.status),
                          color: "#000000",
                          opacity: isCompleted ? 0.75 : 1,
                        }}
                      >
                        {order.status} {isCompleted ? "🔒" : "▾"}
                      </div>

                      {openStatusId === order.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "110%",
                            left: 0,
                            background: "#eeeeee",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "6px",
                            minWidth: "120px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                            zIndex: 10,
                          }}
                        >
                          {["Pending", "InProgress", "Completed"].map(
                            (statusOption) => (
                              <div
                                key={statusOption}
                                onClick={async () => {
                                  try {
                                    const cleanDate = order.date
                                      ? order.date.split("T")[0]
                                      : order.date;
                                    const updatedOrder = {
                                      ...order,
                                      date: cleanDate,
                                      status: statusOption,
                                      items: [],
                                    };
                                    await updateOrder(order.id, updatedOrder);
                                    setOrders((prev) =>
                                      prev.map((o) =>
                                        o.id === order.id
                                          ? { ...o, status: statusOption }
                                          : o
                                      )
                                    );
                                    setOpenStatusId(null);
                                  } catch (err) {
                                    alert("Error al actualizar estado: " + err.message);
                                  }
                                }}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderRadius: "6px",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.backgroundColor = "#dcdcdc")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.backgroundColor = "transparent")
                                }
                              >
                                {statusOption}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/*options edit and delete*/}
                  <td style={tdStyle}>
                    <button
                      onClick={() => navigate(`/add-order/${order.id}`)}
                      disabled={isCompleted}
                      title={isCompleted ? "Las órdenes completadas no se pueden editar" : ""}
                      style={{
                        ...editBtn,
                        opacity: isCompleted ? 0.4 : 1,
                        cursor: isCompleted ? "not-allowed" : "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => handleDelete(order.id)}
                      style={deleteBtn}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px 16px",
  color: "#666",
  fontWeight: "500",
};

const tdStyle = {
  padding: "16px",
};

const editBtn = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #e6e6e6",
  background: "#e6e6e6",
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

export default MyOrders;