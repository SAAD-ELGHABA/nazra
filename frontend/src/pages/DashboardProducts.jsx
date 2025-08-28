import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Eye, Plus, Trash } from "lucide-react";
import { deleteProduct, getProductsAsAdmin } from "../api/api";
import { useNavigate } from "react-router-dom";

const DashboardProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await getProductsAsAdmin();
      setProducts(res?.data?.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the products.
          </p>
        </div>
        <Link
          to={"/dashboard/products/new"}
          className="flex items-center gap-1 p-2 rounded-md shadow-md text-white bg-slate-800"
        >
          <Plus /> New Product
        </Link>
      </div>

      <div className="mt-8 flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center py-10 gap-2">
            {/* Simple bubble loading animation */}
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-300"></div>
          </div>
        ) : (
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Original Price
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Sale Price
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Colors
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Reference-ID
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="text-sm font-semibold">Actions</th>
                      <th className="px-3 py-4 text-sm font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products?.map((product) => (
                      <tr
                        key={product?._id}
                        className="hover:bg-gray-200 transition-colors duration-300 ease-in-out"
                      >
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {product?.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product?.original_price}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product?.sale_price}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex gap-2">
                          {product?.colors?.map((color) => (
                            <span
                              key={color._id}
                              className="flex items-center gap-1"
                            >
                              <span
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: color.value }}
                              ></span>
                              {color.name}
                            </span>
                          ))}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product?.references}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product?.type}
                        </td>
                        <td className="flex py-2 items-center gap-3 justify-center">
                          <Link
                            className="rounded-md shadow-md p-2 border border-black bg-white"
                            to={`/product/${product?.slug}`}
                          >
                            <Eye className="w-5 h-5 text-black" />
                          </Link>
                          <button
                            className="rounded-md shadow-md p-2 border border-blue-700 bg-blue-700"
                            onClick={() =>
                              navigate("/dashboard/products/new", {
                                state: { product },
                              })
                            }
                          >
                            <Edit className="w-5 h-5 text-white" />
                          </button>

                          <button
                            className="rounded-md shadow-md p-2 border border-red-700 bg-red-700"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this item with reference id " +
                                    product?.references
                                )
                              ) {
                                try {
                                  await deleteProduct(product?._id);
                                  alert("Product deleted successfully");
                                  getAllProducts();
                                } catch (error) {
                                  alert(
                                    error.message || "Failed to delete product"
                                  );
                                }
                              }
                            }}
                          >
                            <Trash className="w-5 h-5 text-white" />
                          </button>
                        </td>
                        <td className="px-3 py-4 text-sm">
                          {product?.isActive ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardProducts;
