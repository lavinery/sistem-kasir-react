import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import apiService from "../../services/api";
import { Modal } from "../../components/ui/modal";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import { useSortableData } from "../../hooks/useSortableData";
import { ChevronDown, ChevronUp } from "lucide-react";

// Define interfaces for our data structures
interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  barcode: string;
  price: number;
  stock: number;
  category: Category;
  categoryId: number;
  isActive: boolean;
}

const ProductForm = ({
  product,
  categories,
  onSave,
  onCancel,
}: {
  product: Partial<Product> | null;
  categories: Category[];
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(product || {});

  useEffect(() => {
    setFormData(product || {});
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-bold">{product?.id ? "Edit Product" : "Add Product"}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label>Barcode</label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label>Category</label>
          <select
            name="categoryId"
            value={formData.categoryId || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        ></textarea>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const { items: sortedProducts, requestSort, sortConfig } = useSortableData(products);

  const getSortIndicator = (key: keyof Product) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getProducts();
      setProducts(data);
    } catch {
      const message = "Failed to fetch products";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingProduct({});
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiService.deleteProduct(id);
        toast.success("Product deleted successfully");
        fetchProducts(); // Refresh list
      } catch {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleSave = async (productData: Partial<Product>) => {
    try {
      if (productData.id) {
        await apiService.updateProduct(productData.id, productData);
        toast.success("Product updated successfully");
      } else {
        await apiService.createProduct(productData);
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch {
      toast.error("Failed to save product");
    }
  };

  return (
    <>
      <PageMeta title="Product Management" />
      <PageBreadcrumb pageTitle="Products" />
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleAdd}>Add Product</Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[900px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader onClick={() => requestSort('name')} className="cursor-pointer">
                      <div className="flex items-center gap-1">Product Name {getSortIndicator('name')}</div>
                    </TableCell>
                    <TableCell isHeader onClick={() => requestSort('category')} className="cursor-pointer">
                       <div className="flex items-center gap-1">Category {getSortIndicator('category')}</div>
                    </TableCell>
                    <TableCell isHeader onClick={() => requestSort('price')} className="cursor-pointer">
                       <div className="flex items-center gap-1">Price {getSortIndicator('price')}</div>
                    </TableCell>
                    <TableCell isHeader onClick={() => requestSort('stock')} className="cursor-pointer">
                       <div className="flex items-center gap-1">Stock {getSortIndicator('stock')}</div>
                    </TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4 text-center">Loading...</TableCell>
                    </TableRow>
                  ) : error ? (
                     <TableRow>
                      <TableCell colSpan={6} className="py-4 text-center text-red-500">{error}</TableCell>
                    </TableRow>
                  ) : (
                    sortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category?.name || "N/A"}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(product.price)}
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge size="sm" color={product.isActive ? "success" : "error"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
