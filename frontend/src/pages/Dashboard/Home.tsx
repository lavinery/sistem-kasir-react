import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import DashboardCards from "../../components/ecommerce/DashboardCards";
import apiService from "../../services/api";

interface DashboardData {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is the dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        dashboardData && (
          <DashboardCards
            totalProducts={dashboardData.totalProducts}
            totalCategories={dashboardData.totalCategories}
            totalSuppliers={dashboardData.totalSuppliers}
          />
        )
      )}
    </>
  );
}
