// const icons = {
//   success: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="color: var(--success-color)">
//                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>`,
//   error: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="color: var(--error-color)">
//                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
//             </svg>`,
//   warning: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="color: var(--warning-color)">
//                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
//             </svg>`,
//   info: `<svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="color: var(--info-color)">
//                 <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
//             </svg>`,
// };

// function createToastElement(message, type) {
//   const toast = document.createElement("div");
//   toast.className = `toast ${type}`;
//   toast.innerHTML = `
//         <div class="toast-icon">${icons[type]}</div>
//         <div class="toast-message">${message}</div>
//         <button class="toast-close" onclick="closeToast(this.parentElement)">
//             <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
//                 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//         </button>
//     `;
//   return toast;
// }

// function showToast(message, type = "success") {
//   const container = document.getElementById("toastContainer");
//   const toast = createToastElement(message, type);
//   container.appendChild(toast);

//   // Trigger reflow to ensure animation works
//   toast.offsetHeight;

//   // Show toast
//   requestAnimationFrame(() => {
//     toast.classList.add("show");
//   });

//   // Auto remove after 5 seconds
//   setTimeout(() => {
//     closeToast(toast);
//   }, 5000);
// }

// function closeToast(toast) {
//   toast.style.animation = "slideOut 0.3s forwards";
//   setTimeout(() => {
//     toast.remove();
//   }, 300);
// }

// // Queue system for multiple toasts
// const toastQueue = {
//   maxToasts: 5,
//   queue: [],

//   add(message, type) {
//     const container = document.getElementById("toastContainer");
//     if (container.children.length >= this.maxToasts) {
//       this.queue.push({ message, type });
//       return;
//     }
//     showToast(message, type);
//   },

//   processQueue() {
//     const container = document.getElementById("toastContainer");
//     if (this.queue.length > 0 && container.children.length < this.maxToasts) {
//       const { message, type } = this.queue.shift();
//       showToast(message, type);
//     }
//   },
// };

// // Listen for toast removals to process queue
// const toastObserver = new MutationObserver(() => {
//   toastQueue.processQueue();
// });

// toastObserver.observe(document.getElementById("toastContainer"), {
//   childList: true,
// });
