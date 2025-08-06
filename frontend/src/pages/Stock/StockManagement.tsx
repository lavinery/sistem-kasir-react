import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function StockManagement() {
  return (
    <>
      <PageMeta title="Stock Management" />
      <PageBreadcrumb pageTitle="Stock Management" />
      <div className="space-y-6">
        <div>This page will contain stock management features.</div>
      </div>
    </>
  );
}
