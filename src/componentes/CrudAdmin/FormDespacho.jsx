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
 * @param {Function} onClose - FunciÃ³n que cierra el modal al finalizar
 */
export const FormDespacho = ({ venta, onClose }) => {
  // Hook de react-hook-form para gestionar el formulario y su validaciÃ³n
  const { register, handleSubmit } = useForm();

  /**
   * FunciÃ³n que se ejecuta al enviar el formulario.
   * Realiza dos llamadas HTTP secuenciales:
   * 1. PUT al backend de ventas: marca la venta como despachada
   * 2. POST al backend de despachos: registra la nueva orden de despacho
   *
   * MODIFICACIÃ“N EP3: Las URLs apuntan al LoadBalancer pÃºblico de AWS EKS.
   * El LoadBalancer redirige internamente a los servicios Kubernetes
   * mediante el nginx.conf actualizado con DNS interno del clÃºster.
   * Antes apuntaban a la IP estÃ¡tica 10.0.2.162 (instancia EC2 del EP2).
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
       * Paso 1: Actualiza la venta en el backend de ventas marcÃ¡ndola como despachada.
       * MODIFICACIÃ“N EP3: URL actualizada al LoadBalancer de EKS puerto 8080.
       * nginx redirige internamente a backend-ventas-service:8080 (DNS interno K8s).
       */
      await axios.put(
        `http://a9e13c399daf24711a9cf974faaee570-172120476.us-east-1.elb.amazonaws.com:8080/api/v1/ventas/${venta.idVenta}`,
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
       * MODIFICACIÃ“N EP3: URL actualizada al LoadBalancer de EKS puerto 8081.
       * nginx redirige internamente a backend-despachos-service:8081 (DNS interno K8s).
       */
      await axios.post(
        "http://a9e13c399daf24711a9cf974faaee570-172120476.us-east-1.elb.amazonaws.com:8081/api/v1/despachos",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // NotificaciÃ³n de Ã©xito al usuario tras registrar el despacho correctamente
      Swal.fire({
        title: "Despacho registrado ðŸ›»!",
        text: "El despacho ha sido generado con Ã©xito en la base de datos",
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

        {/* Campo editable: fecha en que se realizarÃ¡ el despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Fecha de despacho</label>
          <input
            type="date"
            placeholder="Ingresa fecha de despacho"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("fechaDespacho", { required: true })}
          />
        </div>

        {/* Campo editable: patente del camiÃ³n asignado al despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Patente de camiÃ³n</label>
          <input
            type="text"
            placeholder="Elige patente de camiÃ³n"
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

        {/* Campo de solo lectura: direcciÃ³n de entrega heredada de la venta */}
        <div className="mb-5">
          <label className="block font-bold mb-2">DirecciÃ³n de entrega</label>
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

        {/* BotÃ³n de envÃ­o que dispara la funciÃ³n onSubmit */}
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

