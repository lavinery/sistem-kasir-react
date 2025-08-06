import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

interface Sale {
  id: number;
  saleNumber: string;
  total: number;
  createdAt: string;
  user: {
    name: string;
  };
  member: {
    name: string;
  } | null;
}

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await apiService.getSales();
        setSales(data);
      } catch (error) {
        console.error('Failed to fetch sales history', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  return (
    <>
      <PageMeta title="Sales History" />
      <PageBreadcrumb pageTitle="Sales History" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader>Sale Number</TableCell>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader>Total</TableCell>
                  <TableCell isHeader>Cashier</TableCell>
                  <TableCell isHeader>Member</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-4 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.saleNumber}</TableCell>
                      <TableCell>
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                        }).format(sale.total)}
                      </TableCell>
                      <TableCell>{sale.user.name}</TableCell>
                      <TableCell>{sale.member?.name || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesHistory;
