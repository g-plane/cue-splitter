export async function resizeImage(image: Blob, width: number, height: number) {
  const canvas = new OffscreenCanvas(width, height)
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Failed to get canvas 2D context.')
  }

  context.drawImage(
    await createImageBitmap(image, {
      resizeQuality: 'high',
      resizeWidth: width,
      resizeHeight: height,
    }),
    0,
    0
  )
  return canvas.convertToBlob()
}
