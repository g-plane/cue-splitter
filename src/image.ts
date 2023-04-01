export function calcImageSize(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => {
      resolve({ width: image.width, height: image.height })
    })
    image.addEventListener('error', reject)
    image.src = url
  })
}
