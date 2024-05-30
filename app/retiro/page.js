'use client';
import React, { useState, useEffect } from "react";
import { collection, addDoc, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [newItem, setNewItem] = useState({ name: '', quantity: '', description: '' });
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
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

  const addItem = async (e) => {
    e.preventDefault();

    if (newItem.name !== '' && newItem.name !== 'Seleccione' && newItem.quantity !== '') {
      setIsSubmitting(true);
      try {
        signIn();

        var itemName = newItem.name.replace('  ', ' ');
        var itemName = newItem.name.replace('AGROIBA', 'AGRO LBA');

        var currentdate = new Date();

        // Obtener el documento del producto seleccionado
        const productRef = doc(collection(db, 'productos'), itemName);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          const currentQuantity = productData.quantity;
          const quantityToSubtract = parseInt(newItem.quantity, 10);

          if (quantityToSubtract <= currentQuantity) {
            // Agregar el egreso a la colección 'egresos'
            await addDoc(collection(db, 'egresos'), {
              name: itemName.trim(),
              quantity: newItem.quantity.trim(),
              description: newItem.description.trim(),
              date: currentdate
            });

            const updatedQuantity = currentQuantity - quantityToSubtract;

            // Actualizar la cantidad del producto en Firestore
            await updateDoc(productRef, {
              quantity: updatedQuantity
            });

            // Limpiar los campos del formulario después de la suma
            setNewItem({ name: '', quantity: '', description: '' });
          } else {
            alert("Solo hay " + currentQuantity + " unidades de este producto");
          }
        } else {
          console.error("El producto no existe en la colección 'productos'.");
        }
      } catch (error) {
        console.error("Error adding document: ", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("Por favor complete todos los campos obligatorios.");
    }
  };

  const redirectEgresosList = () => {
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace('/retiro', '/retiros-list');
    window.location.href = newUrl;
  };

  const redirectIngresosList = () => {
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace('/retiro', '/ingresos-list');
    window.location.href = newUrl;
  };

  const redirectInventario = () => {
    const currentUrl = window.location.href;
    const newUrl = currentUrl.replace('/retiro', '/inventario');
    window.location.href = newUrl;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl p-4 text-center">Egreso de mercadería</h1>
        <div className="bg-slate-800 p-4 rounded-lg">
          <form onSubmit={addItem} className="grid grid-cols-6 gap-4 items-center text-black">
            <label htmlFor="countries" className="col-span-6 block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione el producto</label>
            <select
              id="countries"
              className="col-span-6 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            >
              <option value="Seleccione">Seleccione</option>
              <option value="AGROIBA 10SL 100ML">AGROIBA 10SL 100ML</option>
              <option value="BIOLEP 2X">BIOLEP 2X</option>
              <option value="CELANGULIN 1 LT">CELANGULIN 1 LT</option>
              <option value="FUNBACT 1 LT">FUNBACT 1 LT</option>
              <option value="MAI 5 LT">MAI 5 LT</option>
              <option value="MAPCYKIN 7GR">MAPCYKIN 7GR</option>
              <option value="MULTIMINERAL">MULTIMINERAL</option>
              <option value="NEWFOL ALGAS 1LT">NEWFOL ALGAS 1LT</option>
              <option value="NEWFOL SILCA 1 LT">NEWFOL SILCA 1 LT</option>
              <option value="NEWGEL">NEWGEL</option>
              <option value="TREATPLUS 1 LT">TREATPLUS 1 LT</option>
              <option value="VIRONIT 40  500ML">VIRONIT 40  500ML</option>
              <option value="VIRONIT 40 1LT">VIRONIT 40 1LT</option>
              <option value="XENIC 1 LT">XENIC 1 LT</option>
              <option value="NEWFOL AMINOSULFUR SL 1LT">NEWFOL AMINOSULFUR SL 1LT</option>
            </select>
            <input
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="col-span-6 sm:col-span-2 p-3 border rounded-lg mt-4 sm:mt-0 mx-0 sm:mx-3"
              type="number"
              inputMode="numeric"
              placeholder="Cantidad"
            />
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="col-span-6 sm:col-span-3 p-3 border rounded-lg mt-4 sm:mt-0"
              placeholder="Descripción"
              rows="4"
            ></textarea>
            <div className="col-span-6 flex justify-center mt-4 sm:mt-0">
              <button 
                className="text-white bg-slate-950 hover:bg-slate-900 p-4 text-xl rounded-lg" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Agregando...' : 'Agregar'}
              </button>
            </div>          
          </form>
        </div>
        <div className="flex justify-around w-full mt-4">
          <button 
            onClick={redirectEgresosList} 
            className="text-white bg-blue-600 hover:bg-blue-700 p-4 text-l rounded-lg">
            Lista de egresos
          </button> 
          <button 
            onClick={redirectIngresosList} 
            className="text-white bg-green-600 hover:bg-green-700 p-4 text-l rounded-lg">
            Lista de ingresos
          </button> 
          <button 
            onClick={redirectInventario} 
            className="text-white bg-yellow-600 hover:bg-yellow-700 p-4 text-l rounded-lg">
            Inventario
          </button> 
        </div>
      </div>
    </main>
  );
}
