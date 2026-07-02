// ============================================================
// FormCierreDespacho.jsx
// Formulario para modificar o cerrar una orden de despacho
// existente. Permite actualizar los intentos de entrega y
// marcar el despacho como entregado o mantenerlo abierto.
// ============================================================

import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";

/**
 * Componente FormCierreDespacho
 * @param {Object} despacho - Datos del despacho seleccionado para modificar
 * @param {Function} onClose - FunciÃ³n que cierra el modal al finalizar
 */
export const FormCierreDespacho = ({ despacho, onClose }) => {
  // Hook de react-hook-form para gestionar el formulario y su validaciÃ³n
  const { register, handleSubmit } = useForm();

  /**
   * FunciÃ³n que se ejecuta al enviar el formulario.
   * Realiza un PUT al backend de despachos para actualizar
   * los intentos de entrega y el estado del despacho.
   *
   * MODIFICACIÃ“N EP3: La URL apunta al LoadBalancer pÃºblico de AWS EKS
   * en el puerto 8081, el cual redirige internamente al servicio
   * backend-despachos-service mediante el nginx.conf configurado
   * con DNS interno del clÃºster Kubernetes.
   * Antes apuntaba a la IP estÃ¡tica 10.0.2.162 (instancia EC2 del EP2).
   *
   * @param {Object} data - Datos capturados del formulario (intento, despachado)
   */
  const onSubmit = async (data) => {
    console.log("onSubmit ejecutado");

    // Objeto con los campos editables a actualizar en el backend de despachos
    const jsonData = {
      intento: data.intento,       // NÃºmero actualizado de intentos de entrega
      despachado: data.despachado, // Estado del despacho: abierto o cerrado
    };

    console.log("Datos del formulario:", jsonData);

    try {
      /**
       * PUT al backend de despachos para actualizar la orden existente.
       * MODIFICACIÃ“N EP3: URL actualizada al LoadBalancer de EKS puerto 8081.
       * nginx redirige internamente a backend-despachos-service:8081 (DNS interno K8s).
       * El ID del despacho se incluye dinÃ¡micamente en la URL.
       */
      await axios.put(
        `http://a9e13c399daf24711a9cf974faaee570-172120476.us-east-1.elb.amazonaws.com:8081/api/v1/despachos/${despacho.idDespacho}`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // NotificaciÃ³n de Ã©xito al usuario tras modificar el despacho correctamente
      Swal.fire({
        title: "Despacho modificado ðŸ›»!",
        text: "El despacho ha sido modificado exitosamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      // Captura y muestra en consola cualquier error en la llamada HTTP
      console.error("Error en la solicitud:", error);
    }

    // Cierra el modal y recarga la tabla de despachos al finalizar
    onClose();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center text-center px-24 text-xl"
      >
        <div className="mx-auto text-3xl font-bold mb-10 text-teal-600">
          Editar y cierre de despacho
        </div>

        {/* Campo de solo lectura: identificador Ãºnico del despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">ID despacho</label>
          <input
            disabled={true}
            type="text"
            placeholder="Ingresa fecha de despacho"
            className="border border-gray-300 rounded-lg block w-full p-1 text-slate-400"
            value={despacho.idDespacho}
          />
        </div>

        {/* Campo de solo lectura: fecha original del despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Fecha despacho</label>
          <input
            type="date"
            placeholder="Elige patente de camiÃ³n"
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
            value={despacho.fechaDespacho}
            disabled={true}
          />
        </div>

        {/* Campo de solo lectura: patente del camiÃ³n asignado */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Patente CamiÃ³n</label>
          <input
            type="text"
            disabled={true}
            value={despacho.patenteCamion}
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
          />
        </div>

        {/* Campo editable: nÃºmero de intentos de entrega realizados */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Intentos de entrega</label>
          <input
            type="number"
            defaultValue={despacho.intento}
            className="border border-gray-300 rounded-lg block w-full  p-1"
            {...register("intento", { required: true })}
          />
        </div>

        {/* Campo editable: selector para cerrar o mantener abierto el despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Despacho entregado</label>
          <select
            defaultValue={false}
            className="border border-gray-300 rounded-lg block w-full  p-1"
            {...register("despachado", { required: true })}
          >
            <option value={false}>Despacho abierto</option>
            <option value={true}>Cerrar despacho</option>
          </select>
        </div>

        {/* Campo de solo lectura: ID de la compra vinculada al despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">ID Compra</label>
          <input
            type="text"
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
            disabled={true}
            value={despacho.idCompra}
          />
        </div>

        {/* Campo de solo lectura: direcciÃ³n de entrega del despacho */}
        <div className="mb-5">
          <label className="block font-bold mb-2">DirecciÃ³n Compra</label>
          <input
            type="text"
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
            disabled={true}
            value={despacho.direccionCompra}
          />
        </div>

        {/* Campo de solo lectura: valor total de la compra asociada */}
        <div className="mb-5">
          <label className="block font-bold mb-2">Valor Compra</label>
          <input
            type="text"
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
            disabled={true}
            value={despacho.valorCompra}
          />
        </div>

        {/* BotÃ³n de envÃ­o que dispara la funciÃ³n onSubmit */}
        <button
          className="py-6 px-14 rounded-lg bg-teal-600 text-white font-bold mb-14"
          type="submit"
        >
          Modificar Despacho
        </button>
      </form>
    </>
  );
};

