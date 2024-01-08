import { BASE_URL } from "./const";

const tabla = document.getElementById("tablaPeliculas");
const form = document.getElementById("formulario");
const template = document.getElementById("crudTemplate").content;
const fragmento = document.createDocumentFragment();
const boton = document.getElementById("boton");
const tituloText = document.getElementById("titulo");

const getAll = async () => {
  try {
    const res = await fetch(BASE_URL);
    const json = await res.json();

    if (!res.ok) throw { status: res.status, statusText: res.statusText };

    renderPeliculas(json);
  } catch (error) {
    handleFetchError(error);
  }
};

const renderPeliculas = (peliculas) => {
  peliculas.forEach((pelicula) => {
    const clone = createPeliculaRow(pelicula);
    fragmento.appendChild(clone);
  });

  tabla.querySelector("tbody").appendChild(fragmento);
};

const createPeliculaRow = (pelicula) => {
  const clone = document.importNode(template, true);
  const editButton = clone.querySelector("#edit");
  const deleteButton = clone.querySelector("#delete");

  clone.querySelector(".titulo").textContent = pelicula.titulo;
  clone.querySelector(".director").textContent = pelicula.director;
  clone.querySelector(".sipnosis").textContent = pelicula.sipnosis;
  clone.querySelector(".idioma").textContent = pelicula.idioma;
  clone.querySelector(".clasificacion").textContent = pelicula.clasificacion;
  clone.querySelector(".genero").textContent = pelicula.genero;
  clone.querySelector(".fecha").textContent = pelicula.fecha;

  setButtonDataset(editButton, pelicula);
  setButtonDataset(deleteButton, { id: pelicula.id });

  return clone;
};

const setButtonDataset = (button, data) => {
  Object.entries(data).forEach(([key, value]) => {
    button.dataset[key] = value;
  });
};

const handleFetchError = (error) => {
  const message = error.statusText || "Ocurrió un error";
  tabla.insertAdjacentHTML(
    "afterend",
    `<p><b>Error: ${error.status} ${message}</b></p>`
  );
};

document.addEventListener("DOMContentLoaded", getAll);
document.addEventListener("submit", handleFormSubmit);
document.addEventListener("click", handleButtonClick);

function handleFormSubmit(e) {
  if (e.target === form) {
    e.preventDefault();

    const isValid = validateForm(e.target);

    if (isValid) {
      handleFormAction(e.target);
    }
  }
}

async function handleFormAction(form) {
  const options = {
    method: form.id.value ? "PUT" : "POST",
    headers: {
      "Content-type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      titulo: form.titulo.value,
      director: form.director.value,
      sipnosis: form.sipnosis.value,
      idioma: form.idioma.value,
      clasificacion: form.clasificacion.value,
      genero: form.genero.value,
      fecha: form.fecha.value,
    }),
  };

  try {
    const res = await fetch(
      form.id.value ? `${BASE_URL}/${form.id.value}` : BASE_URL,
      options
    );
    const json = await res.json();

    if (!res.ok) throw { status: res.status, statusText: res.statusText };

    location.reload();
  } catch (err) {
    handleFetchError(err);
  }
}

async function handleButtonClick(e) {
  if (e.target.matches("#edit")) {
    tituloText.textContent = "Editar Pelicula";
    boton.textContent = "Actualizar Pelicula";

    const {
      titulo,
      director,
      sipnosis,
      idioma,
      genero,
      clasificacion,
      fecha,
      id,
    } = e.target.dataset;

    form.titulo.value = titulo;
    form.director.value = director;
    form.sipnosis.value = sipnosis;
    form.idioma.value = idioma;
    form.genero.value = genero;
    form.clasificacion.value = clasificacion;
    form.fecha.value = fecha;
    form.id.value = id;
  }

  if (e.target.matches("#delete")) {
    const isDelete = confirm(`¿Estás seguro de eliminar esta pelicula?`);
    if (isDelete) {
      const options = {
        method: "DELETE",
        headers: {
          "Content-type": "application/json;charset=utf-8",
        },
      };

      try {
        const res = await fetch(`${BASE_URL}/${e.target.dataset.id}`, options);
        const json = await res.json();

        if (!res.ok) throw { status: res.status, statusText: res.statusText };

        location.reload();
      } catch (error) {
        const message = error.statusText || "Ocurrió un error";
        alert(`Error: ${error.status} ${message}`);
      }
    }
  }
}

function validateForm(form) {
  let isValid = true;

  clearErrorMessages();

  const requiredFields = [
    "titulo",
    "director",
    "sipnosis",
    "idioma",
    "clasificacion",
    "genero",
    "fecha",
  ];

  requiredFields.forEach((field) => {
    const input = form[field];
    if (!input.value.trim()) {
      displayErrorMessage(input, "Este campo es obligatorio");
      isValid = false;
    }
  });

  return isValid;
}

function displayErrorMessage(input, message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;

  input.parentNode.appendChild(errorDiv);
}

function clearErrorMessages() {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((error) => {
    error.parentNode.removeChild(error);
  });
}
