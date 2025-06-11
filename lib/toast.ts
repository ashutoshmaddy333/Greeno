import toast from "react-hot-toast"

export const showToast = {
  success: (message: string) => {
    toast.success(message)
  },
  error: (message: string) => {
    toast.error(message)
  },
  loading: (message: string) => {
    return toast.loading(message)
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  },
  custom: (content: React.ReactNode, options?: Parameters<typeof toast>[1]) => {
    return toast(content, options)
  },
}
