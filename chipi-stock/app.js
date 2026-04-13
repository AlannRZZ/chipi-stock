import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const productosRef = collection(db, "productos");
const ventasRef = collection(db, "ventas");

window.mostrar = function(seccion){
  document.getElementById("productos").style.display = "none";
  document.getElementById("ventas").style.display = "none";
  document.getElementById(seccion).style.display = "block";
}

window.logout = function(){
  localStorage.removeItem("auth");
  window.location.href = "index.html";
}

// 🔥 AGREGAR PRODUCTO (ARREGLADO)
window.agregarProducto = async function(){

  const nombre = document.getElementById("nombre").value;
  const stock = Number(document.getElementById("stockInput").value);
  const vencimiento = document.getElementById("vencimiento").value;
  const costo = Number(document.getElementById("costo").value);
  const precio = Number(document.getElementById("precio").value);
  const rubro = document.getElementById("rubro").value;

  if(!nombre || stock <= 0){
    alert("Completá nombre y stock");
    return;
  }

  await addDoc(productosRef, {
    nombre, stock, vencimiento, costo, precio, rubro
  });

  alert("✅ Producto agregado");

  // limpiar inputs
  document.getElementById("nombre").value = "";
  document.getElementById("stockInput").value = "";
  document.getElementById("vencimiento").value = "";
  document.getElementById("costo").value = "";
  document.getElementById("precio").value = "";

  cargarProductos();
  mostrarSub("stock"); // 🔥 te lleva a ver stock
}

// 🔥 LISTAR PRODUCTOS (ARREGLADO COMPLETAMENTE)
window.cargarProductos = async function(){
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const texto = document.getElementById("buscador")?.value.toLowerCase() || "";

  const querySnapshot = await getDocs(productosRef);

  querySnapshot.forEach(docu => {
    const p = docu.data();

    const nombre = p.nombre.toLowerCase();
    const rubro = p.rubro.toLowerCase();

    let coincide = false;

    // 🔎 BUSCAR POR NOMBRE O RUBRO
    if(nombre.includes(texto) || rubro.includes(texto)){
      coincide = true;
    }

    // 🔴 BAJO STOCK
    if(texto.includes("bajo") && p.stock <= 2){
      coincide = true;
    }

    // 📅 PRÓXIMOS A VENCER
    if(texto.includes("venc")){
      if(p.vencimiento){
        const hoy = new Date();
        const venc = new Date(p.vencimiento);
        const diff = (venc - hoy) / (1000 * 60 * 60 * 24);

        if(diff <= 7){
          coincide = true;
        }
      }
    }

    if(!texto) coincide = true;

    if(!coincide) return;

    const venc = p.vencimiento ? p.vencimiento : "-";

    const div = document.createElement("div");

    div.innerHTML = `
      <div class="producto-item">
        <span class="nombre">${p.nombre}</span>
        <span class="stock">${p.stock}</span>
        <span class="detalle">Vence: ${venc}</span>

        <button onclick="sumar('${docu.id}')">➕</button>
        <button onclick="restar('${docu.id}')">➖</button>
        <button onclick="editar('${docu.id}', '${p.nombre}', ${p.stock}, '${p.vencimiento}', ${p.costo}, ${p.precio}, '${p.rubro}')">✏️</button>
        <button onclick="borrar('${docu.id}')">🗑️</button>
      </div>
    `;

    if(p.stock <= 2){
      div.style.color = "red";
    }

    lista.appendChild(div);
  });

  cargarSelect();
}
// RESTAR
window.restar = async function(id){
  const docs = await getDocs(productosRef);

  docs.forEach(async d => {
    if(d.id === id){
      await updateDoc(doc(db, "productos", id), {
        stock: d.data().stock - 1
      });
    }
  });

  cargarProductos();
}
//sumar
window.sumar = async function(id){
  const docs = await getDocs(productosRef);

  docs.forEach(async d => {
    if(d.id === id){
      await updateDoc(doc(db, "productos", id), {
        stock: d.data().stock + 1
      });
    }
  });

  cargarProductos();
}

// BORRAR
window.borrar = async function(id){
  await deleteDoc(doc(db, "productos", id));
  cargarProductos();
}
//EDITAR
window.editar = async function(id, nombre, stock, vencimiento, costo, precio, rubro){

  const nuevoNombre = prompt("Nombre:", nombre);
  const nuevoStock = prompt("Stock:", stock);
  const nuevoVenc = prompt("Vencimiento:", vencimiento || "");
  const nuevoCosto = prompt("Costo:", costo);
  const nuevoPrecio = prompt("Precio:", precio);
  const nuevoRubro = prompt("Rubro:", rubro);

  if(!nuevoNombre) return;

  await updateDoc(doc(db, "productos", id), {
    nombre: nuevoNombre,
    stock: Number(nuevoStock),
    vencimiento: nuevoVenc,
    costo: Number(nuevoCosto),
    precio: Number(nuevoPrecio),
    rubro: nuevoRubro
  });

  cargarProductos();
}

// 🔥 VENTAS
window.vender = async function(){
  const id = document.getElementById("productoVenta").value;
  const cantidad = Number(document.getElementById("cantidadVenta").value);

  const docs = await getDocs(productosRef);

  docs.forEach(async d => {
    if(d.id === id){
      let nuevoStock = d.data().stock - cantidad;

      await updateDoc(doc(db, "productos", id), {
        stock: nuevoStock
      });

      await addDoc(ventasRef, {
        producto: d.data().nombre,
        cantidad,
        fecha: new Date()
      });
    }
  });

  cargarProductos();
  cargarVentas();
}

// SELECT PRODUCTOS
async function cargarSelect(){
  const select = document.getElementById("productoVenta");
  if(!select) return;

  select.innerHTML = "";

  const docs = await getDocs(productosRef);

  docs.forEach(d => {
    const op = document.createElement("option");
    op.value = d.id;
    op.text = d.data().nombre;
    select.appendChild(op);
  });
}

// HISTORIAL
async function cargarVentas(){
  const div = document.getElementById("historial");
  div.innerHTML = "";

  const docs = await getDocs(ventasRef);

  docs.forEach(d => {
    const v = d.data();

    div.innerHTML += `
      <div>
        ${v.producto} - ${v.cantidad}
        <button class="boton-chico" onclick="borrarVenta('${d.id}')">🗑️</button>
      </div>
    `;
  });
}

// CAMBIAR SUBSECCIÓN
window.mostrarSub = function(seccion){
  document.getElementById("agregar").style.display = "none";
  document.getElementById("stock").style.display = "none";

  document.getElementById(seccion).style.display = "block";
}
window.borrarVenta = async function(id){
  await deleteDoc(doc(db, "ventas", id));
  cargarVentas();
}
window.borrarHistorial = async function(){

  const confirmar = confirm("¿Seguro querés borrar todo el historial?");
  if(!confirmar) return;

  const docs = await getDocs(ventasRef);

  docs.forEach(async d => {
    await deleteDoc(doc(db, "ventas", d.id));
  });

  alert("🗑️ Historial borrado");

  cargarVentas();
}
window.toggleModo = function(){
  const body = document.body;
  const activo = body.classList.toggle("dark");

  localStorage.setItem("modoOscuro", activo);

  document.getElementById("modoSwitch").checked = activo;

}
window.addEventListener("load", () => {
  const modoGuardado = localStorage.getItem("modoOscuro") === "true";

  if(modoGuardado){
    document.body.classList.add("dark");
    document.getElementById("modoSwitch").checked = true;
  }
});
// INICIO
cargarProductos();
cargarVentas();
