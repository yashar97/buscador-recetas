//variables
const selectCategorias = document.querySelector('#categorias');
const resultado = document.querySelector('#resultado');
const modal = new bootstrap.Modal('#modal');
const resultadoModal = document.querySelector('#modal .modal-body');
let favoritos = [];
const favoritosDiv = document.querySelector('.favoritos');

//eventos
document.addEventListener('DOMContentLoaded', () => {
    
    if(selectCategorias) {
        selectCategorias.addEventListener('change', obtenerRecetas);
        obtenerCategorias();

   }

   
   if(favoritosDiv) {
        obtenerFavoritos();
   }

    

    favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
});

function obtenerFavoritos() {
    const listaFavoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    if(listaFavoritos.length) {
        mostrarRecetas(listaFavoritos);

        return;

    }

    const noFavoritos = document.createElement('p');
    noFavoritos.textContent = 'No hay favoritos aun';
    noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
    favoritosDiv.appendChild(noFavoritos);

}

//funciones
async function obtenerCategorias() {
    try {
        const respuesta = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');

        const resultado = await respuesta.json();

        llenarSelectCategorias(resultado.categories);
    } catch (error) {
        console.log(error);
    }
}

function llenarSelectCategorias(categorias) {
    categorias.forEach(categoria => {
        const { strCategory } = categoria;
        const option = document.createElement('option');
        option.value = strCategory;
        option.textContent = strCategory;
        selectCategorias.appendChild(option);
    });
}

async function obtenerRecetas(e) {
    if(e.target.value) {
        try {
            const respuesta = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${e.target.value}`);
    
            const resultado = await respuesta.json();
    
            mostrarRecetas(resultado.meals);
        } catch (error) {
            console.log(error);
        }
    }   
    
}

function limpiarHTML() {
    resultado.innerHTML = "";
}

function mostrarRecetas(recetas) {
    limpiarHTML();

    if(recetas) {
        recetas.forEach(receta => {
            const { idMeal, strMeal, strMealThumb } = receta;
    
            const card = document.createElement('div');
            card.classList.add('card', 'col-md-4', 'mt-2');
    
            const recetaImg = document.createElement('img');
            recetaImg.classList.add('card-img-top');
            recetaImg.src = strMealThumb ?? receta.img;
    
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card-body');
    
            const cardHeading = document.createElement('h4');
            cardHeading.textContent = strMeal ?? receta.nombre;
    
            const cardButton = document.createElement('button');
            cardButton.classList.add('btn', 'btn-secondary');
            cardButton.textContent = 'Ver Receta';
            cardButton.onclick = () => {
                obtenerRecetaConId(idMeal ?? receta.id);
            }
    
            cardDiv.appendChild(cardHeading);
            cardDiv.appendChild(cardButton);
            card.appendChild(recetaImg);
            card.appendChild(cardDiv);
            resultado.appendChild(card);
        });
    }
    
}

async function obtenerRecetaConId(id) {
    try {
        const respuesta = await fetch(`https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`);

        const resultado = await respuesta.json();

        abrirModalYMostrarReceta(resultado.meals[0]);
    } catch (error) {
        console.log(error);
    }
}

function abrirModalYMostrarReceta(receta) {

    resultadoModal.innerHTML = "";

    const {strMeal, idMeal, strCategory,  strMealThumb, strInstructions } = receta;

    const lugar = document.querySelector('#modal .modal-body');

    //aqui insertaremos el codigo
    const div = document.createElement('div');
    div.classList.add('card');

    const img = document.createElement('img');
    img.classList.add('card-img-top');
    img.src = strMealThumb;

    const instrucciones = document.createElement('h4');
    instrucciones.textContent = 'Instructions';

    const instruccionesP = document.createElement('p');
    instruccionesP.textContent = strInstructions;

    const buttonAgregar = document.createElement('button');
    buttonAgregar.textContent = comprobarSiExsite({nombre: strMeal, id: idMeal, img:strMealThumb}) ? 'Eliminar Favoritos' : 'Agregar Favoritos';
    buttonAgregar.classList.add('btn', 'btn-secondary');
    buttonAgregar.onclick = () => {
        agregarFavoritos({
            nombre: strMeal,
            id: idMeal,
            img: strMealThumb,
        });
    }

    const ingredientes = document.createElement('h4');
    ingredientes.textContent = 'Ingredients';

    


    div.appendChild(img);
    div.appendChild(instrucciones);
    div.appendChild(instruccionesP);
    
    for (let i = 1; i <= 20; i++) {
        const lista = document.createElement('ul');
        const ingrediente = receta[`strIngredient${i}`];
        const cantidad = receta[`strMeasure${i}`];
        if (ingrediente) {
            const ingredienteCantidad = document.createElement('li');
            ingredienteCantidad.innerHTML += `<p>${ingrediente} - ${cantidad}</p>`;
            div.appendChild(lista);
            lista.appendChild(ingredienteCantidad);
        }
    }
    
    
    div.appendChild(buttonAgregar);
    lugar.appendChild(div);


    modal.show();


}

function agregarFavoritos(receta) {
    
    const toastDiv = document.querySelector('#toast .toast-body');

    toastDiv.textContent = comprobarSiExsite(receta) ? 'Eliminado de Favoritos': 'Agregado a Favoritos';
    const toast = new bootstrap.Toast('#toast');
    toast.show();

    

    
    if(comprobarSiExsite(receta)) {
        favoritos = JSON.parse(localStorage.getItem('favoritos'));

        favoritos = favoritos.filter(element => element.id !== receta.id);

        localStorage.setItem('favoritos', JSON.stringify(favoritos));

        modal.hide();

        return;
    }


        favoritos = [...favoritos, receta];

        localStorage.setItem('favoritos', JSON.stringify(favoritos));
    
    
    

    

    modal.hide();

}

function comprobarSiExsite(receta) {
    const datos = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    const existe = datos.find(element => element.id === receta.id);

    return existe;
}