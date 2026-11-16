function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."))
    reader.readAsDataURL(file)
  })
}

function compress(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const max = 1600
      const scale = Math.min(1, max / Math.max(image.width, image.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext("2d")
      if (!context) {
        URL.revokeObjectURL(url)
        reject(new Error("No se pudo preparar la foto."))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", 0.82))
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Ese archivo no se puede usar como foto."))
    }
    image.src = url
  })
}

export async function readImage(file) {
  if (!file || !file.type.startsWith("image/")) throw new Error("Elegí una imagen.")
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    if (file.size > 400_000) throw new Error("Ese archivo es muy pesado.")
    return readAsDataUrl(file)
  }
  return compress(file)
}
