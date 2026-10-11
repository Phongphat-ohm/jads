import Swal from 'sweetalert2';
import { toast } from 'sonner';

export { toast };

export const justiceSwal = Swal.mixin({
  confirmButtonColor: '#6d28d9', // Royal Purple
  cancelButtonColor: '#94a3b8',
  customClass: {
    popup: 'font-sans rounded-2xl shadow-2xl border border-purple-100',
    title: 'text-purple-950 font-bold',
    confirmButton: 'rounded-xl font-semibold px-5 py-2.5',
    cancelButton: 'rounded-xl font-semibold px-5 py-2.5',
  },
});

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

export function showSuccess(title: string, text?: string) {
  return toast.success(title, {
    description: text,
  });
}

export function showError(title: string, text?: string) {
  return toast.error(title, {
    description: text,
  });
}

export async function showConfirm(
  title: string,
  text: string,
  confirmButtonText = 'ยืนยัน'
): Promise<boolean> {
  const result = await justiceSwal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'ยกเลิก',
  });
  return result.isConfirmed === true;
}
