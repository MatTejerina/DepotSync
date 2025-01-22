import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { db } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import '../styles/AdminProducts.css';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { IconButton, Tooltip, Box } from '@mui/material';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSnackbar } from 'notistack';

const ProductTable = ({ 
  products = [], 
  title = '', 
  isDraggable = false, 
  onEdit = () => {}, 
  onDelete = () => {} 
}) => {
  const [mounted, setMounted] = React.useState(false);
  const droppableId = isDraggable ? "no-seriados-table" : "seriados-table";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="products-table-container">
      <h3 className="table-title">{title}</h3>
      <Droppable droppableId={droppableId} type="PRODUCT">
        {(provided, snapshot) => (
          <div 
            className={`droppable-container ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef} 
            {...provided.droppableProps}
          >
            <div className="table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Imagen</th>
                    <th>Material</th>
                    <th>Mínimo</th>
                    <th>Máximo</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <Draggable 
                      key={`${droppableId}-${product.id}`}
                      draggableId={`${droppableId}-${product.id}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'dragging' : ''}
                          data-stock={product.stock}
                        >
                          <td>⋮⋮</td>
                          <td>
                            <img 
                              src={product.imagen} 
                              alt={product.material}
                              style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'contain',
                                backgroundColor: 'transparent'
                              }}
                            />
                          </td>
                          <td>{product.material}</td>
                          <td>{product.minimo}</td>
                          <td>{product.maximo}</td>
                          <td>
                            <span className={`stock-status ${product.stock}`}>
                              {product.stock === 'disponible' ? 'Disponible' : 'No Disponible'}
                            </span>
                          </td>
                          <td>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="Editar">
                                <IconButton 
                                  onClick={() => onEdit(product)}
                                  size="small"
                                  sx={{ 
                                    color: 'primary.main',
                                    '&:hover': { 
                                      backgroundColor: 'rgba(25, 118, 210, 0.04)' 
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Eliminar">
                                <IconButton 
                                  onClick={() => onDelete(product.id)}
                                  size="small"
                                  sx={{ 
                                    color: 'error.main',
                                    '&:hover': { 
                                      backgroundColor: 'rgba(211, 47, 47, 0.04)' 
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                </tbody>
              </table>
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    imagen: '',
    material: '',
    minimo: '',
    maximo: '',
    categoria: 'seriado',
    stock: 'disponible'
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          displayOrder: 0,
          ...doc.data()
        }));
        
        const sortedProducts = productsData.sort((a, b) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("Error al cargar los productos");
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentProducts = products.filter(p => p.categoria === newProduct.categoria);
      const maxOrder = Math.max(...currentProducts.map(p => p.displayOrder || 0), -1);
      
      const productWithOrder = {
        ...newProduct,
        displayOrder: maxOrder + 1,
        lastUpdated: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'products'), productWithOrder);
      setProducts(prev => [...prev, { ...productWithOrder, id: docRef.id }]);
      setNewProduct({
        imagen: '',
        material: '',
        minimo: '',
        maximo: '',
        categoria: 'seriado',
        stock: 'disponible'
      });
      setIsModalOpen(false);
      enqueueSnackbar("Producto agregado exitosamente", { variant: 'success' });
    } catch (error) {
      console.error("Error al agregar producto:", error);
      enqueueSnackbar("Error al agregar el producto", { variant: 'error' });
    }
  };

  const handleDelete = (productId) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const productRef = doc(db, 'products', productToDelete);
      await deleteDoc(productRef);
      enqueueSnackbar("Producto eliminado correctamente", { variant: 'success' });
      setProducts(products.filter(product => product.id !== productToDelete));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      enqueueSnackbar("Error al eliminar el producto", { variant: 'error' });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, newProduct);
      
      setProducts(products.map(product => 
        product.id === editingProduct.id ? { ...newProduct, id: editingProduct.id } : product
      ));
      
      setEditingProduct(null);
      setNewProduct({
        imagen: '',
        material: '',
        minimo: '',
        maximo: '',
        categoria: 'seriado',
        stock: 'disponible'
      });
      setIsModalOpen(false);
      enqueueSnackbar("Producto actualizado exitosamente", { variant: 'success' });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      enqueueSnackbar("Error al actualizar el producto", { variant: 'error' });
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const isSeriados = destination.droppableId === "seriados-table";
    const sourceProducts = isSeriados ? seriadoProducts : noSeriadoProducts;
    
    const reorderedProducts = Array.from(sourceProducts);
    const [removed] = reorderedProducts.splice(source.index, 1);
    reorderedProducts.splice(destination.index, 0, removed);

    try {
      setProducts(prevProducts => {
        const otherProducts = prevProducts.filter(p => 
          isSeriados ? p.categoria !== 'seriado' : p.categoria === 'seriado'
        );
        
        const updatedProducts = isSeriados 
          ? [...reorderedProducts, ...otherProducts]
          : [...otherProducts, ...reorderedProducts];
        
        return updatedProducts;
      });

      const updates = reorderedProducts.map((product, index) => {
        const productRef = doc(db, 'products', product.id);
        return updateDoc(productRef, {
          displayOrder: index,
          lastUpdated: new Date().toISOString()
        });
      });

      await Promise.all(updates);
    } catch (error) {
      console.error('Error al actualizar el orden:', error);
      enqueueSnackbar('Error al actualizar el orden de los productos', { variant: 'error' });
      
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData.sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      ));
    }
  };

  const seriadoProducts = products.filter(product => product.categoria === 'seriado');
  const noSeriadoProducts = products.filter(product => product.categoria !== 'seriado');

  return (
    <div className="admin-products-container">
      <div className="header-actions">
        <h2>Administración de Productos</h2>
        <button 
          className="add-product-btn"
          onClick={() => {
            setEditingProduct(null);
            setNewProduct({
              imagen: '',
              material: '',
              minimo: '',
              maximo: '',
              categoria: 'seriado',
              stock: 'disponible'
            });
            setIsModalOpen(true);
          }}
        >
          Agregar Producto
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="tables-container">
          <ProductTable 
            products={seriadoProducts} 
            title="Productos Seriados"
            isDraggable={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <ProductTable 
            products={noSeriadoProducts} 
            title="Productos No Seriados"
            isDraggable={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </DragDropContext>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3>{editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h3>
            <form onSubmit={editingProduct ? handleUpdate : handleSubmit}>
              <div className="form-group">
                <label>URL de Imagen:</label>
                <input
                  type="text"
                  name="imagen"
                  value={newProduct.imagen}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Material:</label>
                <input
                  type="text"
                  name="material"
                  value={newProduct.material}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mínimo:</label>
                <input
                  type="number"
                  name="minimo"
                  value={newProduct.minimo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Máximo:</label>
                <input
                  type="number"
                  name="maximo"
                  value={newProduct.maximo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría:</label>
                <select
                  name="categoria"
                  value={newProduct.categoria}
                  onChange={handleInputChange}
                  required
                >
                  <option value="seriado">Seriado</option>
                  <option value="no-seriado">No Seriado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Stock:</label>
                <select
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  required
                >
                  <option value="disponible">Disponible</option>
                  <option value="no-disponible">No Disponible</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit">
                  {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default AdminProducts;