'use client';
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchProducts(); // Fetch products once the user is authenticated
      } else {
        setUser(null);
        signIn();
      }
    });
  }, [auth]);

  const signIn = () => {
    signInWithEmailAndPassword(auth, 'agrincodemo@gmail.com', 'agrincosas')
      .then((userCredential) => {
        setUser(userCredential.user);
      })
      .catch((error) => {
        console.error("Error signing in: ", error);
      });
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'ingresos'));
      const productList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date.toDate ? data.date.toDate().toLocaleDateString() : new Date(data.date).toLocaleDateString()
        };
      });
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error('Error fetching products: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredProducts(
      products.filter(product =>
        product.name.toLowerCase().includes(term)
      )
    );
  };

  const redirectEgresos = () => {
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace('/ingresos-list', '/retiro');
    window.location.href = newUrl;
  };
  
  const redirectEgresosList = () => {
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace('/ingresos-list', '/retiros-list');
    window.location.href = newUrl;
  };

  const redirectInventario = () => {
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace('/ingresos-list', '/inventario');
    window.location.href = newUrl;
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4 bg-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-black text-center">Lista de Ingresos</h1>
        <div className="bg-slate-800 p-4 rounded-lg w-full">
          <input 
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Buscar productos"
            className="mb-4 p-2 rounded-lg w-full text-black"
          />
          {isLoading ? (
            <p className="text-white">Cargando productos...</p>
          ) : filteredProducts.length > 0 ? (
            <table className="min-w-full bg-gray-800">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-gray-700 text-white">Nombre del Producto</th>
                  <th className="py-2 px-4 bg-gray-700 text-white">Cantidad</th>
                  <th className="py-2 px-4 bg-gray-700 text-white">Descripción</th>
                  <th className="py-2 px-4 bg-gray-700 text-white">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-700">
                    <td className="py-2 px-4 text-white">{product.name}</td>
                    <td className="py-2 px-4 text-center text-white">{product.quantity}</td>
                    <td className="py-2 px-4 text-center text-white">{product.description}</td>
                    <td className="py-2 px-4 text-center text-white">{product.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-white">No hay productos disponibles.</p>
          )}
        </div>
        <div className="flex justify-around w-full mt-4">
          <button 
            onClick={redirectEgresos} 
            className="text-white bg-blue-600 hover:bg-blue-700 p-4 text-xl rounded-lg">
            Ir a Egresos
          </button> 
          <button 
            onClick={redirectEgresosList} 
            className="text-white bg-yellow-600 hover:bg-yellow-700 p-4 text-xl rounded-lg">
            Lista de egresos
          </button> 
          <button 
            onClick={redirectInventario} 
            className="text-white bg-green-600 hover:bg-green-700 p-4 text-xl rounded-lg">
            Inventario
          </button> 
        </div>
      </div>
    </main>
  );
}
