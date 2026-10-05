(function () {
  'use strict';

  /* ---------- Menú móvil ---------- */
  var header = document.querySelector('.header');
  var boton = document.querySelector('.menu-boton');
  if (header && boton) {
    boton.addEventListener('click', function () {
      var abierto = header.classList.toggle('menu-abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    header.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('menu-abierto');
        boton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Carrusel de marcas ---------- */
  document.querySelectorAll('.carrusel').forEach(function (carrusel) {
    var pista = carrusel.querySelector('.carrusel__pista');
    var items = pista.children;
    var puntos = carrusel.querySelector('.carrusel__puntos');
    var indice = 0;
    var temporizador;

    function porVista() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 960) return 2;
      return 3;
    }
    function maximo() { return Math.max(0, items.length - porVista()); }

    function dibujarPuntos() {
      puntos.innerHTML = '';
      for (var i = 0; i <= maximo(); i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
        b.addEventListener('click', ir.bind(null, i));
        puntos.appendChild(b);
      }
    }
    function ir(i) {
      var max = maximo();
      indice = i > max ? 0 : i < 0 ? max : i;
      pista.style.transform = 'translateX(' + (-indice * (100 / porVista())) + '%)';
      Array.prototype.forEach.call(puntos.children, function (p, n) {
        p.classList.toggle('activo', n === indice);
      });
      reiniciar();
    }
    function reiniciar() {
      clearInterval(temporizador);
      temporizador = setInterval(function () { ir(indice + 1); }, 5000);
    }

    carrusel.querySelector('.carrusel__flecha--prev').addEventListener('click', function () { ir(indice - 1); });
    carrusel.querySelector('.carrusel__flecha--next').addEventListener('click', function () { ir(indice + 1); });
    carrusel.addEventListener('mouseenter', function () { clearInterval(temporizador); });
    carrusel.addEventListener('mouseleave', reiniciar);
    window.addEventListener('resize', function () { dibujarPuntos(); ir(Math.min(indice, maximo())); });

    dibujarPuntos();
    ir(0);
  });

  /* ---------- Formularios (envían a enviar.php) ---------- */
  document.querySelectorAll('form.formulario').forEach(function (form) {
    var estado = form.querySelector('.formulario__estado');
    var enviar = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      estado.className = 'formulario__estado';
      estado.textContent = '';

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      enviar.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          estado.classList.add(res.ok ? 'ok' : 'error');
          estado.textContent = res.mensaje;
          if (res.ok) form.reset();
        })
        .catch(function () {
          estado.classList.add('error');
          estado.textContent = 'Hubo un error al intentar enviar tu mensaje. Por favor inténtalo de nuevo más tarde.';
        })
        .then(function () { enviar.disabled = false; });
    });
  });

  /* ---------- Año actual en el footer ---------- */
  document.querySelectorAll('.anio').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
