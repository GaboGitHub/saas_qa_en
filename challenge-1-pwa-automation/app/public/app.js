// App State
let events = [];
let currentFilter = "all";
let eventToDelete = null;

// Load events from localStorage
function loadEvents() {
  try {
    const stored = localStorage.getItem("sekios-events");
    if (stored) {
      events = JSON.parse(stored);
    } else {
      // Add sample data
      events = [
        {
          id: Date.now(),
          title: "Connexion réussie",
          type: "success",
          source: "Auth-Service",
          severity: "low",
          description: "Utilisateur admin@sekoia.io connecté avec succès",
          timestamp: new Date().toISOString(),
        },
        {
          id: Date.now() + 1,
          title: "Tentative de connexion échouée",
          type: "warning",
          source: "Firewall-01",
          severity: "medium",
          description:
            "Multiple failed login attempts detected from IP 192.168.1.100",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      saveEvents();
    }
    renderEvents();
    updateStats();
  } catch (error) {
    console.error("Error loading events:", error);
    events = [];
  }
}

function saveEvents() {
  try {
    localStorage.setItem("sekios-events", JSON.stringify(events));
  } catch (error) {
    console.error("Error saving events:", error);
    showToast("❌ Erreur lors de la sauvegarde");
  }
}

// Form submission
const eventForm = document.getElementById("eventForm");
if (eventForm) {
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const event = {
      id: Date.now(),
      title: formData.get("title"),
      type: formData.get("type"),
      source: formData.get("source") || "Unknown",
      severity: formData.get("severity") || "low",
      description: formData.get("description") || "",
      timestamp: new Date().toISOString(),
    };

    events.unshift(event);
    saveEvents();
    renderEvents();
    updateStats();
    e.target.reset();
    showToast("✅ Événement créé avec succès!");
  });
}

// Reset form
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.getElementById("eventForm").reset();
    showToast("🔄 Formulaire réinitialisé");
  });
}

// Render events
function renderEvents() {
  const container = document.getElementById("eventsList");
  if (!container) return;

  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  let filtered = events.filter((event) => {
    const matchesFilter =
      currentFilter === "all" || event.type === currentFilter;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm)) ||
      (event.source && event.source.toLowerCase().includes(searchTerm));
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>Aucun événement trouvé</h3>
                <p>Essayez de modifier vos filtres</p>
            </div>
        `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (event) => `
        <div class="event-card" data-event-id="${
          event.id
        }" data-testid="event-card">
            <div class="event-header">
                <div>
                    <div class="event-title" data-testid="event-title">${escapeHtml(
                      event.title
                    )}</div>
                    <div class="event-meta">
                        <span data-testid="event-source">📍 ${escapeHtml(
                          event.source
                        )}</span>
                        <span data-testid="event-date">🕐 ${formatDate(
                          event.timestamp
                        )}</span>
                        <span data-testid="event-severity">⚠️ ${event.severity.toUpperCase()}</span>
                    </div>
                </div>
                <span class="event-type ${
                  event.type
                }" data-testid="event-type">${event.type}</span>
            </div>
            ${
              event.description
                ? `<div class="event-description" data-testid="event-description">${escapeHtml(
                    event.description
                  )}</div>`
                : ""
            }
            <div class="event-actions">
                <button class="btn btn-secondary btn-small view-btn" data-id="${
                  event.id
                }" data-testid="view-event-btn">
                    👁️ Voir
                </button>
                <button class="btn btn-danger btn-small delete-btn" data-id="${
                  event.id
                }" data-testid="delete-event-btn">
                    🗑️ Supprimer
                </button>
            </div>
        </div>
    `
    )
    .join("");

  // Attach event listeners
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      openDeleteModal(id);
    });
  });

  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      openViewModal(id);
    });
  });
}

// Open view modal
function openViewModal(id) {
  const event = events.find((e) => e.id === id);
  if (!event) return;

  document.getElementById("viewTitle").textContent = event.title;
  document.getElementById("viewType").textContent = event.type;
  document.getElementById("viewSource").textContent = event.source;
  document.getElementById("viewSeverity").textContent =
    event.severity.toUpperCase();
  document.getElementById("viewDate").textContent = new Date(
    event.timestamp
  ).toLocaleString("fr-FR");
  document.getElementById("viewDescription").textContent =
    event.description || "Aucune description";

  const modal = document.getElementById("viewModal");
  modal.classList.add("show");
}

// Close view modal
function closeViewModal() {
  const modal = document.getElementById("viewModal");
  modal.classList.remove("show");
}

// Open delete modal
function openDeleteModal(id) {
  const event = events.find((e) => e.id === id);
  if (!event) return;

  eventToDelete = id;
  document.getElementById("deleteEventTitle").textContent = event.title;

  const modal = document.getElementById("deleteModal");
  modal.classList.add("show");
}

// Close delete modal
function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  modal.classList.remove("show");
  eventToDelete = null;
}

// Delete event
function deleteEvent() {
  if (eventToDelete === null) return;

  events = events.filter((e) => e.id !== eventToDelete);
  saveEvents();
  renderEvents();
  updateStats();
  closeDeleteModal();
  showToast("🗑️ Événement supprimé");
}

// Update statistics
function updateStats() {
  const totalEl = document.getElementById("totalEvents");
  const criticalEl = document.getElementById("criticalEvents");
  const todayEl = document.getElementById("todayEvents");

  if (totalEl) totalEl.textContent = events.length;

  if (criticalEl) {
    const critical = events.filter(
      (e) => e.severity === "critical" || e.type === "error"
    ).length;
    criticalEl.textContent = critical;
  }

  if (todayEl) {
    const today = new Date().toDateString();
    const todayCount = events.filter(
      (e) => new Date(e.timestamp).toDateString() === today
    ).length;
    todayEl.textContent = todayCount;
  }
}

// Filter events
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    currentFilter = e.target.dataset.filter;
    renderEvents();
  });
});

// Search events
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", renderEvents);
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadEvents();

  // Modal close buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      modal.classList.remove("show");
    });
  });

  // Close modals on outside click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  });

  // Confirm delete button
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", deleteEvent);
  }

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeViewModal();
      closeDeleteModal();
    }
  });
});
