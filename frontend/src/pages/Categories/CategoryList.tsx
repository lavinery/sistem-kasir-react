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
import Button from "../../components/ui/button/Button";
import apiService from "../../services/api";
import { Modal } from "../../components/ui/modal";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import { useSortableData } from "../../hooks/useSortableData";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  _count: {
    products: number;
  };
}

const CategoryForm = ({
  category,
  onSave,
  onCancel,
}: {
  category: Partial<Category> | null;
  onSave: (category: Partial<Category>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(category || {});

  useEffect(() => {
    setFormData(category || {});
  }, [category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      <h2 className="text-xl font-bold">{category?.id ? "Edit Category" : "Add Category"}</h2>
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

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const { items: sortedCategories, requestSort, sortConfig } = useSortableData(categories);

  const getSortIndicator = (key: keyof Category) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getCategories();
      setCategories(data);
    } catch {
      const message = "Failed to fetch categories";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory({});
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await apiService.deleteCategory(id);
        toast.success("Category deleted successfully");
        fetchCategories(); // Refresh list
      } catch {
        toast.error("Failed to delete category. Make sure it's not associated with any products.");
      }
    }
  };

  const handleSave = async (categoryData: Partial<Category>) => {
    try {
      if (categoryData.id) {
        await apiService.updateCategory(categoryData.id, categoryData);
        toast.success("Category updated successfully");
      } else {
        await apiService.createCategory(categoryData);
        toast.success("Category created successfully");
      }
      setIsModalOpen(false);
      fetchCategories(); // Refresh list
    } catch {
      toast.error("Failed to save category");
    }
  };

  return (
    <>
      <PageMeta title="Category Management" />
      <PageBreadcrumb pageTitle="Categories" />
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleAdd}>Add Category</Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[700px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader onClick={() => requestSort('name')} className="cursor-pointer">
                      <div className="flex items-center gap-1">Category Name {getSortIndicator('name')}</div>
                    </TableCell>
                    <TableCell isHeader onClick={() => requestSort('description')} className="cursor-pointer">
                      <div className="flex items-center gap-1">Description {getSortIndicator('description')}</div>
                    </TableCell>
                    <TableCell isHeader>Product Count</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-4 text-center">Loading...</TableCell>
                    </TableRow>
                  ) : error ? (
                     <TableRow>
                      <TableCell colSpan={4} className="py-4 text-center text-red-500">{error}</TableCell>
                    </TableRow>
                  ) : (
                    sortedCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.description || "N/A"}</TableCell>
                        <TableCell>{category._count.products}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(category.id)}>Delete</Button>
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
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
