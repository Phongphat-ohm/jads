import Swal from 'sweetalert2';

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

export function showToast(title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') {
  return justiceSwal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon,
    title,
  });
}

export function showSuccess(title: string, text?: string) {
  return justiceSwal.fire({
    icon: 'success',
    title,
    text,
    timer: 2500,
    showConfirmButton: false,
  });
}

export function showError(title: string, text?: string) {
  return justiceSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'ตกลง',
  });
}

export function showConfirm(title: string, text: string, confirmButtonText = 'ยืนยัน') {
  return justiceSwal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'ยกเลิก',
  });
}
