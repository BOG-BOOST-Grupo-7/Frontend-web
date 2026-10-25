import { useEffect, useState } from "react";
import {
  obtenerMisPQRS,
  crearPQRS
} from "../../api/pqrsApi";

import "../../styles/PQRS.css";

function PQRS() {

  const [mensaje, setMensaje] = useState("");
  const [pqrs, setPqrs] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarPQRS = async () => {
    try {

      const { data } = await obtenerMisPQRS();

      setPqrs(data);

    } catch (error) {
      console.error(error);
      alert("No fue posible cargar las PQRS");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPQRS();
  }, []);

  const enviarPQRS = async (e) => {

    e.preventDefault();

    if (!mensaje.trim()) {
      alert("Escribe un mensaje.");
      return;
    }

    try {

      await crearPQRS(mensaje);

      alert("PQRS enviada correctamente.");

      setMensaje("");

      cargarPQRS();

    } catch (error) {

      console.error(error);

      alert("No fue posible enviar la PQRS.");
    }

  };

  return (

    <div className="pqrs-container">

      <h1>PQRS</h1>

      <form
        className="pqrs-form"
        onSubmit={enviarPQRS}
      >

        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribe aquí tu petición, queja, reclamo o sugerencia..."
          maxLength={500}
        />

        <button type="submit">
          Enviar PQRS
        </button>

      </form>

      <h2>Mis PQRS</h2>

      {cargando ? (

        <p>Cargando...</p>

      ) : pqrs.length === 0 ? (

        <p>No has enviado PQRS.</p>

      ) : (

        <div className="pqrs-lista">

          {pqrs.map((item) => (

            <div
              className="pqrs-card"
              key={item.id_pqrs}
            >

              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(item.fecha_pqrs).toLocaleDateString()}
              </p>

              <p>
                <strong>Mensaje:</strong>
              </p>

              <p>{item.mensaje_pqrs}</p>

              <p>
                <strong>Respuesta:</strong>
              </p>

              {item.respuesta_pqrs ? (

                <p>{item.respuesta_pqrs}</p>

              ) : (

                <p className="pendiente">
                  Pendiente de respuesta
                </p>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

export default PQRS;