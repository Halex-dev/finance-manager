import axios from 'axios'

export const imageAPI = {
  async uploadImage(image: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('image', image)

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return `${import.meta.env.VITE_BACKEND_URL}${response.data}` // Returns the URL of the image uploaded by the server
    } catch (error) {
      console.error('Error upload image:', error)
      return ''
    }
  },

  async deleteImage(imageName: string): Promise<void> {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/${imageName}`)
    } catch (error) {
      console.error('Error delete image:', error)
    }
  },
}
