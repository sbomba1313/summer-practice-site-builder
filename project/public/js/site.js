// ============================================================
// Оживление слайдеров публичной страницы (Swiper).
// Оригинал travelline.tech использовал Swiper, но при сохранении
// через Ctrl+S движок и код инициализации не сохранились — восстанавливаем.
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  // --- Слайдер «Команда»: едет сам, медленно; на наведение — пауза; можно тащить ---
  if (document.querySelector('.team__slider')) {
    new Swiper('.team__slider', {
      slidesPerView: 'auto',
      spaceBetween: 16,
      grabCursor: true,          // курсор-«рука» — можно тащить вручную
      loop: true,                // бесконечная лента
      speed: 9000,               // плавно и небыстро
      autoplay: {
        delay: 0,                // едет непрерывно
        disableOnInteraction: false,
        pauseOnMouseEnter: true, // навёл мышь — остановилась, удобно рассмотреть
      },
    });
  }

  // --- Слайдер «Клиенты» (brands): медленная бегущая строка ---
  if (document.querySelector('.brands')) {
    new Swiper('.brands', {
      slidesPerView: 'auto',
      spaceBetween: 40,
      loop: true,
      speed: 20000,              // ещё медленнее
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      allowTouchMove: false,     // едет сама, руками не двигаем
    });
  }
});
