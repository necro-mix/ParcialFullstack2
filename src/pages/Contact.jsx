import { useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <section className="container content-section">
      <h1>Contacto</h1>
      <p>Comunícate con nuestro equipo para consultas sobre productos, pedidos o servicios.</p>
      <form className="simple-form" onSubmit={submit}>
        <label htmlFor="nombre-contacto">Nombre</label><input id="nombre-contacto" name="nombre" required maxlength="50" />
        <label htmlFor="correo-contacto">Correo electrónico</label><input id="correo-contacto" name="correo" type="email" required maxLength="100" />
        <label htmlFor="mensaje-contacto">Consulta</label><textarea id="mensaje-contacto" name="mensaje" required maxLength="500" />
        <button className="btn-submit" type="submit">Enviar consulta</button>
        {sent && <p className="form-feedback" role="status">Tu consulta fue enviada correctamente.</p>}
      </form>
    </section>
  );
}
