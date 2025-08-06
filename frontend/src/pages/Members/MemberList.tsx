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
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { toast, ToastContainer } from "react-toastify";
import { useSortableData } from "../../hooks/useSortableData";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Member {
  id: number;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  totalPurchase: number;
  visitCount: number;
  isActive: boolean;
}

const MemberForm = ({
  member,
  onSave,
  onCancel,
}: {
  member: Partial<Member> | null;
  onSave: (member: Partial<Member>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(member || {});

  useEffect(() => {
    setFormData(member || {});
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-bold">{member?.id ? "Edit Member" : "Add Member"}</h2>
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
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
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

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
  const { items: sortedMembers, requestSort, sortConfig } = useSortableData(members);

  const getSortIndicator = (key: keyof Member) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiService.getMembers();
      setMembers(data);
    } catch {
      const message = "Failed to fetch members";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAdd = () => {
    setEditingMember({});
    setIsModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this member?")) {
      try {
        await apiService.deleteMember(id);
        toast.success("Member deactivated successfully");
        fetchMembers(); // Refresh list
      } catch {
        toast.error("Failed to deactivate member");
      }
    }
  };

  const handleSave = async (memberData: Partial<Member>) => {
    try {
      if (memberData.id) {
        await apiService.updateMember(memberData.id, memberData);
        toast.success("Member updated successfully");
      } else {
        await apiService.createMember(memberData);
        toast.success("Member created successfully");
      }
      setIsModalOpen(false);
      fetchMembers(); // Refresh list
    } catch {
      toast.error("Failed to save member");
    }
  };

  return (
    <>
      <PageMeta title="Member Management" />
      <PageBreadcrumb pageTitle="Members" />
      <ToastContainer position="bottom-right" autoClose={3000} />

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleAdd}>Add Member</Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader onClick={() => requestSort('memberId')} className="cursor-pointer">
                      <div className="flex items-center gap-1">Member ID {getSortIndicator('memberId')}</div>
                    </TableCell>
                    <TableCell isHeader onClick={() => requestSort('name')} className="cursor-pointer">
                      <div className="flex items-center gap-1">Name {getSortIndicator('name')}</div>
                    </TableCell>
                    <TableCell isHeader>Contact</TableCell>
                    <TableCell isHeader onClick={() => requestSort('totalPurchase')} className="cursor-pointer">
                      <div className="flex items-center gap-1">Total Purchase {getSortIndicator('totalPurchase')}</div>
                    </TableCell>
                    <TableCell isHeader onClick={() => requestSort('visitCount')} className="cursor-pointer">
                      <div className="flex items-center gap-1">Visits {getSortIndicator('visitCount')}</div>
                    </TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-4 text-center">Loading...</TableCell>
                    </TableRow>
                  ) : error ? (
                     <TableRow>
                      <TableCell colSpan={7} className="py-4 text-center text-red-500">{error}</TableCell>
                    </TableRow>
                  ) : (
                    sortedMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.memberId}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>
                          <div>{member.email}</div>
                          <div>{member.phone}</div>
                        </TableCell>
                        <TableCell>
                           {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(member.totalPurchase)}
                        </TableCell>
                        <TableCell>{member.visitCount}</TableCell>
                        <TableCell>
                           <Badge size="sm" color={member.isActive ? "success" : "error"}>
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>Edit</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(member.id)}>Deactivate</Button>
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
        <MemberForm
          member={editingMember}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
}
