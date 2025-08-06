import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function SalesReports() {
  return (
    <>
      <PageMeta title="Sales Reports" />
      <PageBreadcrumb pageTitle="Sales Reports" />
      <div className="space-y-6">
        <div>This page will contain sales reports.</div>
      </div>
    </>
  );
}
