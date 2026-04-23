import Swal from 'sweetalert2';

/* ------------------------------------------------------------------ */
/*  Toast mixin – góc trên bên phải, tự tắt                          */
/* ------------------------------------------------------------------ */
export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

/* ------------------------------------------------------------------ */
/*  Toast thông báo nhanh                                             */
/* ------------------------------------------------------------------ */

/** Thông báo thành công */
export function swalSuccess(title = 'Thành công!', text = '') {
  return Toast.fire({ icon: 'success', title, text });
}

/** Thông báo lỗi */
export function swalError(title = 'Lỗi!', text = '') {
  return Toast.fire({ icon: 'error', title, text });
}

/** Thông báo cảnh báo */
export function swalWarning(title = 'Cảnh báo!', text = '') {
  return Toast.fire({ icon: 'warning', title, text });
}

/** Thông báo thông tin */
export function swalInfo(title = 'Thông tin', text = '') {
  return Toast.fire({ icon: 'info', title, text });
}

/* ------------------------------------------------------------------ */
/*  Hộp thoại xác nhận                                               */
/* ------------------------------------------------------------------ */

/** Xác nhận chung – trả về Promise<boolean> */
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

/** Xác nhận xoá – nút đỏ, icon cảnh báo */
export async function swalConfirmDelete(itemName = '') {
  const title = itemName ? `Xoá ${itemName}?` : 'Xác nhận xoá?';
  const result = await Swal.fire({
    title,
    text: 'Hành động này không thể hoàn tác.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Huỷ',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
  });
  return result.isConfirmed;
}

/* ------------------------------------------------------------------ */
/*  Loading overlay                                                   */
/* ------------------------------------------------------------------ */

/** Hiển thị loading – gọi Swal.close() hoặc swalClose() để tắt */
export function swalLoading(title = 'Đang xử lý...') {
  Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });
}

/** Đóng mọi popup SweetAlert2 đang mở */
export function swalClose() {
  Swal.close();
}

/* ------------------------------------------------------------------ */
/*  Input dialog                                                      */
/* ------------------------------------------------------------------ */

/** Hộp thoại nhập text – trả về giá trị hoặc null nếu huỷ */
export async function swalInput(title, options = {}) {
  const {
    placeholder = '',
    inputValue = '',
    inputType = 'text',
    validationMessage = 'Vui lòng nhập giá trị',
  } = options;

  const result = await Swal.fire({
    title,
    input: inputType,
    inputValue,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Huỷ',
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    inputValidator: (value) => {
      if (!value?.trim()) return validationMessage;
    },
  });

  return result.isConfirmed ? result.value : null;
}

/* ------------------------------------------------------------------ */
/*  Xử lý lỗi API                                                    */
/* ------------------------------------------------------------------ */

/**
 * Trích thông báo lỗi từ response Axios / Error rồi hiện toast lỗi.
 * Dùng trong catch block:  swalApiError(err)
 */
export function swalApiError(error, fallbackTitle = 'Có lỗi xảy ra') {
  const msg =
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    '';
  return Toast.fire({ icon: 'error', title: fallbackTitle, text: msg });
}

export default Swal;
