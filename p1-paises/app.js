
const API = "https://api.restcountries.com/countries/v5";

// Clave API
const API_KEY = "rc_live_e8cea4afefa549d1ae051d65ff5a6af9";

// Elementos de la pagina
const form = document.getElementById("formBuscar");
const mensaje = document.getElementById("mensaje");
const resultados = document.getElementById("resultados");
const selectRegion = document.getElementById("selectRegion");
const selectOrden = document.getElementById("selectOrden");

// Lista de paises
let paisesActuales = [];


// Funcion para consultar la API
async function consultarAPI(url) {

    const respuesta = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${API_KEY}`
        }
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        const errorAPI = datos.errors?.[0]?.message;
        throw new Error(errorAPI || `Error del servidor: ${respuesta.status}`);
    }

    return datos.data.objects || [];
}


// Buscar pais por nombre
async function buscarPais(nombre) {

    const url = `${API}/names.common?q=${encodeURIComponent(nombre)}&limit=100`;

    return await consultarAPI(url);
}


// Buscar paises por region
async function buscarRegion(region) {

    const url = `${API}?region=${encodeURIComponent(region)}&limit=100`;

    return await consultarAPI(url);
}


// Mostrar paises en tarjetas
function mostrarPaises(paises) {

    resultados.innerHTML = "";

    if (paises.length === 0) {
        mensaje.textContent = "No se encontraron países.";
        return;
    }

    mensaje.textContent = `${paises.length} país(es) encontrado(s).`;

    paises.forEach(pais => {

        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        const nombre = pais.names?.common || "Sin nombre";

        const capital = pais.capitals?.[0]?.name || "Sin capital";

        const region = pais.region || "Sin región";

        const poblacion = pais.population != null
            ? pais.population.toLocaleString("es-MX")
            : "No disponible";

        const codigo = pais.codes?.alpha_2?.toLowerCase();

        const bandera = codigo
            ? `https://flags.restcountries.com/v5/w320/${codigo}.png`
            : "";

        tarjeta.innerHTML = `
            <img src="${bandera}" alt="Bandera de ${nombre}">

            <h3>${nombre}</h3>

            <p><b>Capital:</b> ${capital}</p>

            <p><b>Región:</b> ${region}</p>

            <p><b>Población:</b> ${poblacion}</p>

            <button type="button">Ver idiomas y moneda</button>

            <div class="detalles" hidden></div>
        `;

        // Boton para mostrar idiomas y monedas
        const boton = tarjeta.querySelector("button");
        const detalles = tarjeta.querySelector(".detalles");

        boton.addEventListener("click", () => {

            if (detalles.hidden) {

                mostrarDetalles(pais, detalles);
                detalles.hidden = false;
                boton.textContent = "Ocultar detalles";

            } else {

                detalles.hidden = true;
                boton.textContent = "Ver idiomas y moneda";

            }

        });

        resultados.appendChild(tarjeta);

    });

}


// Mostrar idiomas y monedas
function mostrarDetalles(pais, contenedor) {

    let idiomas = "No disponibles";

    if (pais.languages && pais.languages.length > 0) {
        idiomas = pais.languages
            .map(idioma => idioma.name || idioma.native_name || "Idioma")
            .join(", ");
    }

    let monedas = "No disponibles";

    if (pais.currencies && Object.keys(pais.currencies).length > 0) {

        monedas = Object.values(pais.currencies)
            .map(moneda => {
                return `${moneda.name || "Moneda"} (${moneda.symbol || "Sin símbolo"})`;
            })
            .join(", ");

    }

    contenedor.innerHTML = `
        <p><b>Idiomas:</b> ${idiomas}</p>
        <p><b>Monedas:</b> ${monedas}</p>
    `;

}


// Ordenar paises por poblacion
function ordenarPaises() {

    let paisesOrdenados = [...paisesActuales];

    const orden = selectOrden.value;

    if (orden === "mayor") {

        paisesOrdenados.sort((a, b) =>
            (b.population || 0) - (a.population || 0)
        );

    } else if (orden === "menor") {

        paisesOrdenados.sort((a, b) =>
            (a.population || 0) - (b.population || 0)
        );

    }

    mostrarPaises(paisesOrdenados);

}


// Buscar por nombre al enviar formulario
form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nombre = document.getElementById("txtPais").value.trim();

    if (!nombre) {
        return;
    }

    mensaje.textContent = "Buscando país...";
    resultados.innerHTML = "";

    try {

        selectRegion.value = "";

        paisesActuales = await buscarPais(nombre);

        if (paisesActuales.length === 0) {
            mensaje.textContent = "No se encontró ningún país con ese nombre.";
            return;
        }

        ordenarPaises();

    } catch (error) {

        resultados.innerHTML = "";
        mensaje.textContent = error.message;

    }

});


// Filtrar por region
selectRegion.addEventListener("change", async () => {

    const region = selectRegion.value;

    if (region === "") {
        mensaje.textContent = "Selecciona una región para buscar.";
        resultados.innerHTML = "";
        paisesActuales = [];
        return;
    }

    mensaje.textContent = "Cargando países de la región...";
    resultados.innerHTML = "";

    try {

        paisesActuales = await buscarRegion(region);

        ordenarPaises();

    } catch (error) {

        resultados.innerHTML = "";
        mensaje.textContent = error.message;

    }

});


// Cambiar orden de poblacion
selectOrden.addEventListener("change", () => {

    if (paisesActuales.length > 0) {
        ordenarPaises();
    }

});
