import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../storage';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = loginUser(String(form.get('correo')).trim(), String(form.get('contrasena')));
    setError(result.exito ? '' : result.mensaje);
    setSuccess(result.exito ? result.mensaje : '');
    if (result.exito) window.setTimeout(() => navigate('/'), 700);
  };

  return (
    <main className="container">
      <section className="form-card">
        <div className="form-header"><h2>Iniciar sesión</h2><p>Accede a tu cuenta y a los productos disponibles.</p></div>
        <form id="form-login" className="form-grid" onSubmit={submit}>
          <div className="form-group full-width"><label htmlFor="login-correo">Correo electrónico</label><input id="login-correo" name="correo" type="email" required autoComplete="email" /></div>
          <div className="form-group full-width"><label htmlFor="login-clave">Contraseña</label><input id="login-clave" name="contrasena" type="password" required autoComplete="current-password" /></div>
          <button className="btn-submit" type="submit">Iniciar sesión</button>
          {error && <small className="error-msg full-width" role="alert">{error}</small>}
          {success && <small className="form-feedback full-width" role="status">{success}</small>}
        </form>
      </section>
    </main>
  );
}
