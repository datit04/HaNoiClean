import Swal from 'sweetalert2';

/** Toast nhỏ góc trên bên phải – tự tắt sau 2.5s */
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

/** Thông báo thành công */
export function swalSuccess(title = 'Thành công!', text = '') {
  return Toast.fire({ icon: 'success', title, text });
}

/** Thông báo lỗi */
export function swalError(title = 'Lỗi!', text = '') {
  return Toast.fire({ icon: 'error', title, text });
}

/** Hộp thoại xác nhận (thay window.confirm) – trả về Promise<boolean> */
export async function swalConfirm(title, text = '') {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Huỷ',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
  });
  return result.isConfirmed;
}

export default Swal;
