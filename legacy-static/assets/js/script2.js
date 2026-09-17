document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");
  const projectLinks = document.querySelectorAll(".project-item a");

  const hideModal = () => {
    modal.classList.remove("active");
  };

  const showModal = (imageSrc) => {
    modalImg.src = imageSrc;
    modal.classList.add("active");
  };

  projectLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const img = link.querySelector("img");
      if (img) {
        showModal(img.src);
      }
    });
  });

  closeModal?.addEventListener("click", hideModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });
});