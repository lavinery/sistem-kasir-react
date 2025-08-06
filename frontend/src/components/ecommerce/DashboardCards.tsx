import React from 'react';

interface DashboardCardsProps {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  totalProducts,
  totalCategories,
  totalSuppliers,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          {/* Icon */}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {totalProducts}
            </h4>
            <span className="text-sm font-medium">Total Products</span>
          </div>
        </div>
      </div>
      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          {/* Icon */}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {totalCategories}
            </h4>
            <span className="text-sm font-medium">Total Categories</span>
          </div>
        </div>
      </div>
      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          {/* Icon */}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {totalProducts}
            </h4>
            <span className="text-sm font-medium">Total Products</span>
          </div>
        </div>
      </div>
      <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
          {/* Icon */}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h4 className="text-title-md font-bold text-black dark:text-white">
              {totalSuppliers}
            </h4>
            <span className="text-sm font-medium">Total Suppliers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
