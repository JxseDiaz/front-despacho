// ============================================================
// TableCompras.jsx
// Componente que muestra la tabla de órdenes de compra
// pendientes de despacho, obtenidas desde el backend de ventas.
// Permite generar un despacho para cada orden disponible.
// ============================================================

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { FormDespacho } from "./FormDespacho";
import axios from "axios";

export const TableCompras = () => {
  // Estado que almacena la lista de ventas obtenidas desde el backend
  const [ventas, setVentas] = useState([]);

  /**
   * Función asíncrona que consulta el endpoint del backend de ventas.
   * MODIFICACIÓN EP3: La URL apunta al LoadBalancer público de AWS EKS
   * en el puerto 8080, el cual redirige internamente al servicio
   * backend-ventas-service mediante el nginx.conf configurado.
   * Antes apuntaba a la IP estática 10.0.2.162 (instancia EC2 del EP2).
   */
  const compras = async () => {
    await axios
      .get(
        "http://a25373e48e4b949bbaea4c9bd6eee8c7-2091625919.us-east-1.elb.amazonaws.com:8080/api/v1/ventas",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        // Actualiza el estado con la lista de ventas recibida
        setVentas(response.data);
      });
  };

  // Llamada a la función para obtener los datos cuando el componente se monta
  useEffect(() => {
    compras();
  }, []);

  // State que controla la visibilidad del modal
  const [openModal, setOpenModal] = useState(false);

  // State que almacena la venta seleccionada para generar su despacho
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  /**
   * Abre el modal y guarda la venta seleccionada en el estado.
   * @param {Object} venta - Objeto con los datos de la venta seleccionada
   */
  const handleAbrirModal = (venta) => {
    setVentaSeleccionada(venta);
    setOpenModal(true);
  };

  return (
    <>
      <section className="grid text-center grid-cols-12 mb-8">
        <div className="col-span-12 flex justify-center">
          <div className="col-span-10 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-white h-full overflow-hidden">
            {/* Tabla que lista las órdenes de compra sin despacho generado */}
            <table className="table-fixed">
              <thead>
                <tr className="py-10">
                  <th className="pr-10">Orden de compra</th>
                  <th className="pr-10">direccion</th>
                  <th className="pr-10">fecha de compra</th>
                  <th className="pr-10">valor total</th>
                  <th className="pr-10"></th>
                </tr>
              </thead>
              <tbody>
                {/* Filtra solo las ventas que aún no tienen despacho generado */}
                {ventas
                  .filter((venta) => !venta.despachoGenerado)
                  .map((venta) => (
                    <tr key={venta.idVenta}>
                      <td className="pr-10 py-10 items-center">
                        {venta.idVenta}
                      </td>
                      <td className="pr-10 py-10  items-center">
                        {venta.direccionCompra}
                      </td>
                      <td className="pr-10 py-10  items-center">
                        {venta.fechaCompra}
                      </td>
                      <td className="pr-10 py-10  items-center">
                        ${venta.valorCompra}
                      </td>
                      <td>
                        {/* Botón que abre el modal para generar el despacho */}
                        <button
                          onClick={() => handleAbrirModal(venta)}
                          className="py-1 bg-orange-200 px-8 rounded-xl shadow-md hover:bg-orange-300/70 transition-all duration-300 "
                        >
                          Generar Despacho
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal que contiene el formulario para generar un nuevo despacho */}
      <Modal
        onClose={() => {
          setOpenModal(false);
        }}
        open={openModal}
      >
        {ventaSeleccionada && (
          <FormDespacho
            venta={ventaSeleccionada}
            onClose={() => {
              // onClose es un prop que pasa funciones al modal con el form abierto,
              // al cerrarse ejecuta: cierra el modal y recarga la tabla de compras
              (setOpenModal(false), compras());
            }}
          />
        )}
      </Modal>
    </>
  );
};
