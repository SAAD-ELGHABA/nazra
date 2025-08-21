import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {Edit, Eye, Plus, Trash} from 'lucide-react'

const DashboardProducts = () => {


  const [products, setProducts] = useState([{
    id:1,
    name:'Product one',
    original_price:3.15,
    sale_price:15.49,
    colors:['red','bleu'],
    reference_id:'AD_548Yh',
    type:'aviator'
  }])

 

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the products.
          </p>
        </div>
        <Link to={'/dashboard/products/new'} className='flex items-center gap-1 p-2 rounded-md shadow-md text-white bg-slate-800'><Plus /> New Product</Link>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow  ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Original Price
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Sale Price
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Colors
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Reference-ID
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th scope="col" className=" text-sm font-semibold">
                       Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.id} className='hover:bg-gray-200 transition-colors duration-300 ease-in-out'>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {product.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.original_price}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.sale_price}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.colors}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.reference_id}</td>
                      
                      <td className="flex py-2 items-center gap-3 justify-center">
                        <button className='rounded-md shadow-md p-2 border border-black bg-white cursor-pointer'>
                        <Eye className='w-5 h-5 text-black' />
                        </button>
                        <button className='rounded-md shadow-md p-2 border border-blue-700 bg-blue-700 cursor-pointer'>
                        <Edit className='w-5 h-5 text-white' />
                        </button>
                        <button className='rounded-md shadow-md p-2 border border-red-700 bg-red-700 cursor-pointer'>
                        <Trash className='w-5 h-5 text-white' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  )
}

export default DashboardProducts