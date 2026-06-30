// ============================================================
// FormDespacho.jsx
// Formulario para registrar una nueva orden de despacho.
// Recibe como prop la venta seleccionada y genera el despacho
// llamando a ambos backends: ventas (para marcarla como
// despachada) y despachos (para registrar la nueva orden).
// ============================================================

import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";

/**
 * Componente FormDespacho
 * @param {Object} venta - Datos de la venta seleccionada para despachar
 * @param {Function} onClose - Función que cierra el modal al finalizar
 */
export const FormDespacho = ({ venta, onClose }) => {
  // Hook de react-hook-form para gestionar el formulario y su validación
  const { register, handleSubmit } = useForm();

  /**
   * Función que se ejecuta al enviar el formulario.
   * Realiza dos llamadas HTTP secuenciales:
   * 1. PUT al backend de ventas: marca la venta como despachada
   * 2. POST al backend de despachos: registra la nueva orden de despacho
   *
   * MODIFICACIÓN EP3: Las URLs apuntan al LoadBalancer público de AWS EKS.
   * El LoadBalancer redirige internamente a los servicios Kubernetes
   * mediante el nginx.conf actualizado con DNS interno del clúster.
   * Antes apuntaban a la IP estática 10.0.2.162 (instancia EC2 del EP2).
   *
   * @param {Object} data - Datos capturados del formulario (fechaDespacho, patenteCamion)
   */
  const onSubmit = async (data) => {
    console.log("onSubmit ejecutado");

    // Objeto con los datos del nuevo despacho a registrar en el backend de despachos
    const jsonData = {
      fechaDespacho: data.fechaDespacho,
      patenteCamion: data.patenteCamion,
      intento: 0,                          // Inicia en 0 intentos de entrega
      entregado: false,                    // El despacho comienza como no entregado
      idCompra: venta.idVenta,             // Referencia a la venta original
      direccionCompra: venta.direccionCompra,
      valorCompra: venta.valorCompra,
    };

    // Objeto para actualizar el campo despachoGenerado en el backend de ventas
    const jsonDataSales = {
      despachoGenerado: true,
    };

    console.log("Datos del formulario:", jsonData);

    try {
      /**
       * Paso 1: Actualiza la venta en el backend de ventas marcándola como despachada.
       * MODIFICACIÓN EP3: URL actualizada al LoadBalancer de EKS puerto 8080.
       * nginx redirige internamente a backend-ventas-service:8080 (DNS interno K8s).
       */
      await axios.put(
        `http://a25373e48e4b949bbaea4c9bd6eee8c7-2091625919.us-east-1.elb.amazonaws.com:8080/api/v1/ventas/${venta.idVenta}`,
        jsonDataSales,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      /**
       * Paso 2: Registra la nueva orden de despacho en el backend de despachos.
       * MODIFICACIÓN EP3: URL actualizada al LoadBalancer de EKS puerto 8081.
       * nginx redirige internamente a backend-despachos-service:8081 (DNS interno K8s).
       */
      await axios.post(
        "http://a25373e48e4b949bbaea4c9bd6eee8c7-2091625919.us-east-1.elb.amazonaws.com:8081/api/v1/despachos",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Notificación de éxito al usuario tras registrar el despacho correctamente
      Swal.fire({
        title: "Despacho registrado 🛻!",
        text: "El despacho ha sido generado con éxito en la base de datos",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      // Captura y muestra en consola cualquier error en las llamadas HTTP
      console.error("Error en la solicitud:", error);
    }

    // Cierra el modal y recarga la tabla de compras al finalizar
    onClose();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center text-center px-24 text-xl"
      >
        <div className="mx-auto text-3xl font-bold mb-10 text-teal-600">
          Ingreso de orden de despacho
        </div>

        {/* Campo editable: fecha en que se realizará el despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Fecha de despacho</label>
          <input
            type="date"
            placeholder="Ingresa fecha de despacho"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("fechaDespacho", { required: true })}
          />
        </div>

        {/* Campo editable: patente del camión asignado al despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Patente de camión</label>
          <input
            type="text"
            placeholder="Elige patente de camión"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("patenteCamion", { required: true })}
          />
        </div>

        {/* Campo de solo lectura: ID de la orden de compra asociada */}
        <div className="mb-5">
          <label className="block font-bold mb-2">
            Orden de compra asociado
          </label>
          <input
            type="number"
            disabled={true}
            value={venta.idVenta}
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
          />
        </div>

        {/* Campo de solo lectura: dirección de entrega heredada de la venta */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Dirección de entrega</label>
          <input
            type="text"
            disabled={true}
            value={venta.direccionCompra}
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
          />
        </div>

        {/* Campo de solo lectura: valor total de la compra */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Valor de compra</label>
          <input
            type="number"
            value={venta.valorCompra}
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
            disabled={true}
          />
        </div>

        {/* Botón de envío que dispara la función onSubmit */}
        <button
          className="py-6 px-14 rounded-lg bg-teal-600 text-white font-bold mb-14"
          type="submit"
        >
          Asignar despacho
        </button>
      </form>
    </>
  );
};
