document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.querySelector(".status");
  const eventsElement = document.querySelector(".events");

  const database = [];

  if (database.length === 0) {
    eventsElement.textContent = "Baza pusta. Inicjalizacja systemu...";
    initializeSystem();
  }

  function initializeSystem() {
    setTimeout(() => {
      statusElement.textContent = "Status połączenia: AKTYWNY (USA)";
      eventsElement.textContent = "Protokół Startowy zakończony sukcesem.";
    }, 1500);
  }
});