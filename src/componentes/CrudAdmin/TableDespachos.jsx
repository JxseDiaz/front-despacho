// ============================================================
// TableDespachos.jsx
// Componente que muestra la tabla de órdenes de despacho
// registradas en el sistema, obtenidas desde el backend de
// despachos. Permite cerrar o modificar cada despacho.
// ============================================================

import { useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "./Modal";
import { FormCierreDespacho } from "./FormCierreDespacho";

export const TableDespachos = () => {
  // Estado que almacena la lista de despachos obtenidos desde el backend
  const [despachos, setDespachos] = useState([]);

  /**
   * Función asíncrona que consulta el endpoint del backend de despachos.
   * MODIFICACIÓN EP3: La URL apunta al LoadBalancer público de AWS EKS
   * en el puerto 8081, el cual redirige internamente al servicio
   * backend-despachos-service mediante el nginx.conf configurado.
   * Antes apuntaba a la IP estática 10.0.2.162 (instancia EC2 del EP2).
   */
  const despacho = async () => {
    await axios
      .get(
        "http://a25373e48e4b949bbaea4c9bd6eee8c7-2091625919.us-east-1.elb.amazonaws.com:8081/api/v1/despachos",
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        // Actualiza el estado con la lista de despachos recibida
        setDespachos(response.data);
      });
  };

  // Llamada a la función para obtener los datos cuando el componente se monta
  useEffect(() => {
    despacho();
  }, []);

  // State que controla la visibilidad del modal
  const [openModal, setOpenModal] = useState(false);

  // State que almacena el despacho seleccionado para su modificación o cierre
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);

  /**
   * Abre el modal y guarda el despacho seleccionado en el estado.
   * @param {Object} despacho - Objeto con los datos del despacho seleccionado
   */
  const handleAbrirModal = (despacho) => {
    setDespachoSeleccionado(despacho);
    setOpenModal(true);
  };

  return (
    <>
      <section className="grid text-center grid-cols-12 mb-8">
        <div className="col-span-12 flex justify-center">
          <div className="col-span-10 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-white h-full overflow-hidden">
            {/* Tabla que lista todos los despachos registrados en el sistema */}
            <table className="table-fixed">
              <thead>
                <tr className="py-10">
                  <th className="pr-10">Orden de despacho</th>
                  <th className="pr-10">Orden de compra</th>
                  <th className="pr-10">Dirección de entrega</th>
                  <th className="pr-10">Fecha despacho</th>
                  <th className="pr-10">Patente Camión</th>
                  <th className="pr-10">Entregado</th>
                  <th className="pr-10">Intentos de entrega</th>
                </tr>
              </thead>
              <tbody>
                {/* Itera sobre todos los despachos y renderiza una fila por cada uno */}
                {despachos.map((despacho) => (
                  <tr key={despacho.idDespacho}>
                    <td className="pr-10 py-10 items-center">
                      {despacho.idDespacho}
                    </td>
                    <td className="pr-10 py-10  items-center">
                      {despacho.idCompra}
                    </td>
                    <td className="pr-10 py-10  items-center">
                      {despacho.direccionCompra}
                    </td>
                    <td className="pr-10 py-10  items-center">
                      {despacho.fechaDespacho}
                    </td>
                    <td className="pr-10 py-10  items-center">
                      {despacho.patenteCamion}
                    </td>
                    {/* Muestra el estado del despacho según el campo entregado */}
                    <td className="pr-10 py-10  items-center">
                      {despacho.entregado
                        ? "Despacho entregado"
                        : "Despacho pendiente"}
                    </td>
                    <td className="pr-10 py-10  items-center">
                      {despacho.intento}
                    </td>
                    <td>
                      {/* Botón que abre el modal para cerrar o modificar el despacho */}
                      <button
                        onClick={() => handleAbrirModal(despacho)}
                        className="py-1 bg-orange-200 px-8 rounded-xl shadow-md hover:bg-orange-300/70 transition-all duration-300 "
                      >
                        Cerrar despacho
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal que contiene el formulario para cerrar o modificar un despacho */}
      <Modal
        onClose={() => {
          setOpenModal(false);
        }}
        open={openModal}
      >
        {despachoSeleccionado && (
          <FormCierreDespacho
            despacho={despachoSeleccionado}
            onClose={() => {
              // onClose es un prop que pasa funciones al modal con el form abierto,
              // al cerrarse ejecuta: cierra el modal y recarga la tabla de despachos
              (setOpenModal(false), despacho());
            }}
          />
        )}
      </Modal>
    </>
  );
};
