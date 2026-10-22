import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { regiones } from '../data';
import { registerUser } from '../storage';

const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

export default function Register() {
  const navigate = useNavigate();
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    const email = String(data.correo).trim();
    const run = String(data.run || '').trim();
    const password = String(data.contrasena || '');
    const validEmail = email.length <= 100 && allowedDomains.some((domain) => email.toLowerCase().endsWith(domain));
    const validPassword = password.length >= 4 && password.length <= 10;
    const validRegion = Boolean(region && comuna);
    if (!validEmail || !run || !validPassword || !validRegion || password !== data['confirmar-contrasena']) {
      setError('Completa los campos obligatorios y verifica email, contraseña y ubicación.');
      return;
    }
    const result = registerUser({ run, correo: email, contrasena: password, nombre: data.nombre, apellidos: data.apellidos, region, comuna, direccion: data.direccion });
    setError(result.exito ? '' : result.mensaje);
    setSuccess(result.exito ? result.mensaje : '');
    if (result.exito) window.setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <main className="container">
      <section className="form-card">
        <div className="form-header"><h2>Registro de Cuenta Paciente</h2><p>Completa el formulario para habilitar tus compras y acceder a convenios.</p></div>
        <form className="form-grid" onSubmit={submit}>
          <div className="form-group"><label htmlFor="run">RUN (sin puntos ni guión)*</label><input id="run" name="run" required maxLength="9" autoComplete="off" placeholder="19011022K" /></div>
          <div className="form-group"><label htmlFor="correo">Correo Electrónico*</label><input id="correo" name="correo" type="email" required maxLength="100" autoComplete="email" placeholder="usuario@duoc.cl" /></div>
          <div className="form-group"><label htmlFor="nombre">Nombre*</label><input id="nombre" name="nombre" required maxLength="50" autoComplete="given-name" /></div>
          <div className="form-group"><label htmlFor="apellidos">Apellidos*</label><input id="apellidos" name="apellidos" required maxLength="100" autoComplete="family-name" /></div>
          <div className="form-group"><label htmlFor="contrasena">Contraseña*</label><input id="contrasena" name="contrasena" type={showPassword ? 'text' : 'password'} required minLength="4" maxLength="10" autoComplete="new-password" /><button type="button" className="toggle-password" aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</button></div>
          <div className="form-group"><label htmlFor="confirmar-contrasena">Repetir contraseña*</label><input id="confirmar-contrasena" name="confirmar-contrasena" type={showPassword ? 'text' : 'password'} required minLength="4" maxLength="10" autoComplete="new-password" /></div>
          <div className="form-group"><label htmlFor="region">Región Domiciliaria*</label><select id="region" name="region" required value={region} onChange={(event) => { setRegion(event.target.value); setComuna(''); }}><option value="">-- Seleccione una Región --</option>{regiones.map((item) => <option key={item.region}>{item.region}</option>)}</select></div>
          <div className="form-group"><label htmlFor="comuna">Comuna Domiciliaria*</label><select id="comuna" name="comuna" required value={comuna} onChange={(event) => setComuna(event.target.value)} disabled={!region}><option value="">-- Seleccione una Comuna --</option>{regiones.find((item) => item.region === region)?.comunas.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="form-group full-width"><label htmlFor="direccion">Dirección Calle y Número*</label><input id="direccion" name="direccion" required maxLength="300" autoComplete="street-address" /></div>
          <button className="btn-submit" type="submit">Confirmar y Crear Cuenta</button>
          {error && <small className="error-msg full-width" role="alert">{error}</small>}
          {success && <small className="form-feedback full-width" role="status">{success}</small>}
        </form>
      </section>
    </main>
  );
}
