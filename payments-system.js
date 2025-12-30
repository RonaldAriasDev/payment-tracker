// Base64 convierte bytes (imágenes, PDFs, archivos) a texto para poder enviarlos donde los bytes no son aceptados - Toma 3 bytes (24 bits). Divide en 4 grupos de 6 bits. Cada grupo es convertido en uno de los 64 caracteres Base64.


// const date = new Date() - Crea un objeto con la fecha con formato estandar. Se puede usar varios metodos sobre esa fecha (fecha y hora, solo fecha, etc)
// toISOString(). Formatea como String en formato estándar (ISO). Sirve comparaciones, etc. Sirve para guardar
// toLocaleString() formatea como String según idioma y zona horaria del navegador. Es legible para humanos. Sirve para mostrar
// const date = new Date(date.toISOString()) - Reconstruye un objeto desde un string. Recupera todos los métodos
// getTime() - Es un número entero que representa ms transcurridos desde 01/01/1970. No tiene ambiguedades como formato, zona horaria.
// new Date(datetoInput.value).getTime() + 86400000    - El input type="date" da la fecha y se asume que la hora es las 00:00. Se suma los milisegundos en 1 dia para indicar que es hasta las 23:59
// infinity - sin limite


// getItem() obtiene un json-string
// JSON.parse() convierte json-string a objeto
// JSON.stringify() vuelve de objeto a json-string
// setItem() guarda el json-string


// Convertir el Base64 en un Blob (Binary Large Object)
// atob() convierte de base64 a byte-string (cada 4 caracteres Base64 de 6 bits a 3 caracteres byte-string donde cada uno representa un byte) (cada carácter del string tiene un código ASCII entre 0 y 255) ()
// MIME (Multipurpose Internet Mail Extensions)
// ArrayBuffer(). crea una memoria binaria cruda sin forma, con la longitud de bytes
// Uint8Array(). dentro de la memoria, pone divisiones de 1 byte por casilla, unsigned, solo acepta enteros de 0 a 255 (256 combinaciones posibles para 8 bits)
// charCodeAt(i). devuelve el codigo númerico del caracter en la posición i
// Blob(). crea un Blob a partir del arreglo de enteros y el tipo y formato de archivo. Le da al navegador un archivo válido


// NFD - "Normalization Form Descomposition"
// /[\u0300-\u036f]/g - Expreción regular    /.../ delimitadores de expresión regular.    [\u0300-\u036f] rango unicode que incluye caracteres (acentos, etc).    g "Flag Global" No se detiene al encontrar una coincidencia


// Selectores de sección de pago

const paymentsForm = document.querySelector("#payments-form")

const clientInput = document.querySelector("#client-input")
const amountInput = document.querySelector("#amount-input")
const accountInput = document.querySelector("#account-input")
const receiptInput = document.querySelector("#receipt-input")

// Selectores de sección de busqueda

const searchForm = document.querySelector("#search-form")

const nameSearchInput = document.querySelector("#name-search-input")
const accountSearchInput = document.querySelector("#account-search-input")
const dateFromInput = document.querySelector("#date-from-input")
const dateToInput = document.querySelector("#date-to-input")

const allFilter = document.querySelector("#all-filter")
const nameFilter = document.querySelector("#name-filter")
const dateFilter = document.querySelector("#date-filter")
const accountFilter = document.querySelector("#account-filter")

// Selectores de sección de resultados

const resultsSection = document.querySelector("#results-section")
const resultsMessage = document.querySelector("#results-message")
const resultsContainer = document.querySelector("#results-container")

const sumButton = document.querySelector("#sum-button")
const totalText = document.querySelector("#total-text")
const resultsResetButton = document.querySelector("#results-reset-button")

// Selectores de sección de modal-overlay

const modalOverlay = document.querySelector("#modal-overlay")
const modalContent = document.querySelector("#modal-content")
const modalClose = document.querySelector("#modal-close")


// Estado

let imagenBase64 = null
let currentResults = []


// Utilidades

const getPayments = () =>
  JSON.parse(localStorage.getItem("payments")) || []

const savePayments = (payments) =>
  localStorage.setItem("payments", JSON.stringify(payments))

const base64ToBlobURL = (base64) => {
  const byteString = atob(base64.split(",")[1])
  const mimeString = base64.split(",")[0].split(":")[1].split(";")[0]

  const arrayBuffer = new ArrayBuffer(byteString.length)
  const intArray = new Uint8Array(arrayBuffer)

  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i)
  }

  const blob = new Blob([intArray], { type: mimeString })
  return URL.createObjectURL(blob)
}

const clearResults = () => {
  resultsContainer
    .querySelectorAll(".result-card")
    .forEach(card => card.remove())
  totalText.textContent = ""
}

const normalizeText = (text) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

const resetPaymentsForm = () => {
  paymentsForm.reset()
  imagenBase64 = null
}

const toggleSumButton = () => {
  sumButton.hidden = currentResults.length === 0
}

const openModal = (html) => {
  modalContent.innerHTML = html
  modalOverlay.classList.remove("hidden")
}

const closeModal = () => {
  modalOverlay.classList.add("hidden")
  modalContent.innerHTML = ""
}

const showSavedModal = () => {
  openModal(`
    <h3>Pago guardado</h3>
    <p>El pago se registró correctamente.</p>
  `)
}

const showResultsSection = () => {
  resultsSection.classList.remove("hidden")
}

const hideResultsSection = () => {
  resultsSection.classList.add("hidden")
}

const showMessage = (text) => {
  resultsMessage.textContent = text
  resultsMessage.classList.remove("hidden")
}

const hideMessage = () => {
  resultsMessage.textContent = ""
  resultsMessage.classList.add("hidden")
}


const clearSearchInputs = (except) => {
  const inputs = [
    nameSearchInput,
    accountSearchInput,
    dateFromInput,
    dateToInput
  ]

  inputs.forEach(input => {
    if (input !== except) {
      input.value = ""
    }
  })
}



// Render

const renderPayment = (payment) => {
  const item = document.createElement("article")
  item.classList.add("result-card")

  const blobURL = base64ToBlobURL(payment.receipt)
  const date = new Date(payment.datetime)

  item.innerHTML = `
    <p><strong>Cliente:</strong> ${payment.client}</p>
    <p><strong>Monto:</strong> ${payment.amount}</p>
    <p><strong>Cuenta:</strong> ${payment.account}</p>
    <p><strong>Fecha y hora:</strong> ${date.toLocaleString()}</p>
    <button class="btn btn--secondary view-receipt">Ver comprobante</button>
  `

  item
  .querySelector(".view-receipt")
  .addEventListener("click", () => {
    openModal(`
      <h3>Comprobante</h3>
      <img src="${blobURL}" class="modal-image">
    `)
  })

  resultsContainer.appendChild(item)
}

const renderPayments = (payments) => {
  clearResults()
  currentResults = payments
  showResultsSection()
  toggleSumButton()

  if (payments.length === 0) {
    showMessage("No hay coincidencias con los filtros seleccionados.")
    return
  }

  hideMessage()
  payments.forEach(renderPayment)
}


// Handlers

const handleReceiptChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    imagenBase64 = event.target.result
  }
  reader.readAsDataURL(file)
}


const handlePaymentsSubmit = (e) => {
  e.preventDefault()

  const data = {
    client: clientInput.value,
    amount: Number(amountInput.value),
    account: accountInput.value,
    receipt: imagenBase64,
    datetime: new Date().toISOString()
  }

  const payments = getPayments()
  payments.push(data)
  savePayments(payments)
  resetPaymentsForm()
  showSavedModal()
}


const handleSearchSubmit = (e) => {
  e.preventDefault()

  const payments = getPayments()

  if (allFilter.checked) {
    renderPayments(payments)
  }

  if (nameFilter.checked) {
    renderPayments(
      payments.filter(p =>
        normalizeText(p.client) === normalizeText(nameSearchInput.value)
      )
    )
  }

  if (accountFilter.checked) {
    renderPayments(
      payments.filter(p =>
      normalizeText(p.account) === normalizeText(accountSearchInput.value)
      )
    )
  }

  if (dateFilter.checked) {
    renderPayments(
      payments.filter(p => {
        const paymentTime = new Date(p.datetime).getTime()

        const from = dateFromInput.value
          ? new Date(dateFromInput.value).getTime()
          : -Infinity

        const to = dateToInput.value
          ? new Date(dateToInput.value).getTime() + 86400000 
          : Infinity

        return paymentTime >= from && paymentTime <= to
      })
    )
  }
}


const handleSumAmounts = () => {
  if (currentResults.length === 0) {
    totalText.textContent = "No hay pagos para sumar."
    return
  }

  const total = currentResults.reduce(
    (acc, p) => acc + p.amount,
    0
  )

  totalText.textContent = `Monto total: ${total.toFixed(2)} CLP`
}


const handleOverlayClick = (e) => {
  if (e.target === modalOverlay) {
    closeModal()
  }
}


const handleResultsReset = () => {
  clearResults()
  currentResults = []
  searchForm.reset()
  hideResultsSection()
}


// Eventos

receiptInput.addEventListener("change", handleReceiptChange)

paymentsForm.addEventListener("submit", handlePaymentsSubmit)
searchForm.addEventListener("submit", handleSearchSubmit)

sumButton.addEventListener("click", handleSumAmounts)
resultsResetButton.addEventListener("click", handleResultsReset)

modalClose.addEventListener("click", closeModal)
modalOverlay.addEventListener("click", handleOverlayClick)


nameSearchInput.addEventListener("focus", () => {
  nameFilter.checked = true
  clearSearchInputs(nameSearchInput)
})

accountSearchInput.addEventListener("focus", () => {
  accountFilter.checked = true
  clearSearchInputs(accountSearchInput)
})

dateFromInput.addEventListener("focus", () => {
  dateFilter.checked = true
  clearSearchInputs(accountSearchInput)
})

dateToInput.addEventListener("focus", () => {
  dateFilter.checked = true
  clearSearchInputs(dateToInput)
})