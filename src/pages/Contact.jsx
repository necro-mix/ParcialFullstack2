export default function Contact() {
  return (
    <section className="container content-section">
      <h1>Contacto</h1>
      <p>El backend aún no ofrece un endpoint para recibir consultas. No ingreses información personal en este formulario hasta que esté disponible.</p>
      <form className="simple-form">
        <label htmlFor="nombre-contacto">Nombre</label><input id="nombre-contacto" name="nombre" disabled />
        <label htmlFor="correo-contacto">Correo electrónico</label><input id="correo-contacto" name="correo" type="email" disabled />
        <label htmlFor="mensaje-contacto">Consulta</label><textarea id="mensaje-contacto" name="mensaje" disabled />
        <button className="btn-submit" type="button" disabled>Envío no disponible (API pendiente)</button>
      </form>
    </section>
  );
}
