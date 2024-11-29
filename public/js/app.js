function init() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").then(
      (reg) => {
        console.log("Service worker registered -->", reg);
      },
      (err) => {
        console.error("Service worker not registered -->", err);
      }
    );
  }
}

fetch("https://reqres.in/api/users")
  .then((response) => response.json())
  .then((data) => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./service-worker.js").then(
        (reg) => {
          console.log("Service worker registered -->", reg);
        },
        (err) => {
          console.error("Service worker not registered -->", err);
        }
      );
    }

    console.log(data);
    let tab = ``;

    // Loop to access all rows
    for (let r of data.data) {
      tab += ` 
                        <div class="col-sm-3 mb-5">  
                            <div class="card">
                                <img class="center"  style="display: block;margin-left: auto;margin-right: auto; width:80%;" src="${r.avatar}" alt="">
                                <div class="card-body">
                                    <h5 class="card-title">${r.first_name}</h5>
                                    <p class="card-text">${r.last_name}</p>
                                    <p class="card-text">${r.email}</p>
                                </div>  
                            </div>
                        </div> 
               
                    `;
    }

    // Setting innerHTML as tab variable
    document.getElementById("datosregistrados").innerHTML = tab;
  });

function Enviar() {}

async function Registrar() {
  let data = {
    id: Date.now(),
    email: document.getElementById("emailText").value,
    first_name: document.getElementById("firstNameText").value,
    last_name: document.getElementById("LastNameText").value,
    avatar: document.getElementById("imgAvatar").value,
  };
  let a = document.forms["formRegister"]["imgAvatar"].value;
  let b = document.forms["formRegister"]["emailText"].value;
  let c = document.forms["formRegister"]["firstNameText"].value;
  let d = document.forms["formRegister"]["LastNameText"].value;
  try {
    if (a == "" || b == "" || c == "" || d == "") {
      alert("Todos los campos deben estar llenos");
    } else {
      const request = await fetch("https://reqres.in/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(data),
      });

      const response = await request.json();

      swal({
        title: "Registro correcto!",
        text: "Los datos son: " + JSON.stringify(response),
        icon: "success",
        button: "Salir!",
      });
    }
    //alert('success: ' + JSON.stringify(response));
  } catch (error) {
    alert(error);
  }
}


// Inicializar PouchDB
const db = new PouchDB('MiPrimerDB_YahirDegante');

// Función para obtener datos desde la API y guardarlos en PouchDB
function fetchData() {
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            // Guardar los datos en la base de datos local
            db.put({
                _id: 'data',
                message: data.message
            }).then(() => {
                // Actualizar la UI con los datos almacenados
                document.getElementById('titulo').innerText = data.message;
            });
        })
        .catch(err => {
            console.error('Error al obtener datos:', err);

            // Si ocurre un error, intentar obtener los datos del cache (PouchDB)
            db.get('data').then(doc => {
                document.getElementById('titulo').innerText = doc.message;
            }).catch(error => {
                document.getElementById('titulo').innerText = 'No se pudieron cargar los datos.';
            });
        });
}

// Llamamos a la función para cargar los datos
fetchData();