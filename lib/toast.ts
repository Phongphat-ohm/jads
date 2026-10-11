import { toast } from 'sonner';

export { toast };

export function showToast(
  title: string,
  icon: 'success' | 'error' | 'warning' | 'info' = 'success',
  description?: string
) {
  switch (icon) {
    case 'success':
      return toast.success(title, { description });
    case 'error':
      return toast.error(title, { description });
    case 'warning':
      return toast.warning(title, { description });
    case 'info':
      return toast.info(title, { description });
    default:
      return toast(title, { description });
  }
}

export function showSuccess(title: string, description?: string) {
  return toast.success(title, { description });
}

export function showError(title: string, description?: string) {
  return toast.error(title, { description });
}

export function showWarning(title: string, description?: string) {
  return toast.warning(title, { description });
}

export function showInfo(title: string, description?: string) {
  return toast.info(title, { description });
}
