const STORAGE = {
  name: "newTabName",
  profile: "newTabProfile",
  completed: "newTabOnboardingComplete",
  settings: "newTabSettings",
  searches: "newTabRecentSearches",
};
const DEFAULT_SETTINGS = {
  theme: "system",
  clockSize: "normal",
  clockWeight: "normal",
  clockStyle: "normal",
  timeFormat: "12",
  showSeconds: false,
};
let currentName = localStorage.getItem(STORAGE.name) || "Aviral Dewangan";
let currentProfile = localStorage.getItem(STORAGE.profile) || "";
let settings = { ...DEFAULT_SETTINGS, ...loadSavedSettings() };
function loadSavedSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.settings) || "{}");
  } catch {
    return {};
  }
}
function updatePageTitle() {
  const name = currentName.trim();
  document.title = name ? `${name} - New Tab` : "New Tab";
}
function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
function renderAvatar(element) {
  if (!element) return;
  element.replaceChildren();
  if (currentProfile) {
    const img = document.createElement("img");
    img.src = currentProfile;
    img.alt = `${currentName} profile picture`;
    img.onerror = () => {
      currentProfile = "";
      localStorage.removeItem(STORAGE.profile);
      renderAvatar(element);
    };
    element.appendChild(img);
  } else {
    element.textContent = getInitials(currentName);
  }
}
function updateAllProfileAvatars() {
  renderAvatar(document.getElementById("sidebarProfileAvatar"));
  renderAvatar(document.getElementById("topProfileAvatar"));
  renderAvatar(document.getElementById("profilePreview"));
}
const quotes = {
  morning: {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  afternoon: {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  evening: {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  night: {
    text: "It is never too late to be what you might have been.",
    author: "George Eliot",
  },
};
function getTimePeriod(hour) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}
function updateClock() {
  const now = new Date(),
    hours = now.getHours(),
    minutes = String(now.getMinutes()).padStart(2, "0"),
    seconds = String(now.getSeconds()).padStart(2, "0");
  let displayHours = settings.timeFormat === "12" ? hours % 12 || 12 : hours;
  displayHours = String(displayHours).padStart(2, "0");
  let timeText = `${displayHours}:${minutes}`;
  if (settings.showSeconds) timeText += `:${seconds}`;
  if (settings.timeFormat === "12") timeText += hours >= 12 ? " PM" : " AM";
  document.getElementById("clock").textContent = timeText;
  const period = getTimePeriod(hours);
  document.getElementById("greeting").textContent = `Good ${period}`;
  document.getElementById("quote").textContent = quotes[period].text;
  document.getElementById("quoteAuthor").textContent =
    `— ${quotes[period].author}`;
}
function applyClockSettings() {
  const sizes = {
    small: "clamp(62px,8vw,105px)",
    normal: "clamp(74px,10vw,142px)",
    large: "clamp(88px,12vw,170px)",
  };
  const clock = document.getElementById("clock");
  clock.style.fontSize = sizes[settings.clockSize];
  clock.style.fontWeight = settings.clockWeight === "bold" ? "700" : "400";
  clock.style.fontStyle =
    settings.clockStyle === "italic" ? "italic" : "normal";
}
function getResolvedTheme() {
  if (settings.theme === "system")
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  return settings.theme;
}
function updateMainThemeToggle() {
  const toggle = document.getElementById("mainThemeToggle");
  if (!toggle) return;
  const dark = getResolvedTheme() === "dark";
  toggle.classList.toggle("dark", dark);
  toggle.title = dark ? "Switch to light mode" : "Switch to dark mode";
  toggle.setAttribute("aria-label", toggle.title);
}
function applyTheme() {
  document.body.classList.toggle("dark", getResolvedTheme() === "dark");
  updateMainThemeToggle();
}
function saveSettings() {
  localStorage.setItem(STORAGE.settings, JSON.stringify(settings));
  applyTheme();
  applyClockSettings();
  updateClock();
  loadSettingsUI();
}
function loadSettingsUI() {
  document.getElementById("themeSetting").value = settings.theme;
  document.getElementById("clockSizeSetting").value = settings.clockSize;
  document.getElementById("clockWeightSetting").value = settings.clockWeight;
  document.getElementById("clockStyleSetting").value = settings.clockStyle;
  document.getElementById("timeFormatSetting").value = settings.timeFormat;
  document.getElementById("secondsSetting").checked = settings.showSeconds;
}
function toggleMainTheme() {
  settings.theme = getResolvedTheme() === "dark" ? "light" : "dark";
  saveSettings();
}
const mainThemeToggle = document.getElementById("mainThemeToggle");
mainThemeToggle.addEventListener("click", toggleMainTheme);
const settingsOverlay = document.getElementById("settingsOverlay");
document
  .getElementById("settingsButton")
  .addEventListener("click", () => settingsOverlay.classList.add("open"));
document
  .getElementById("closeSettings")
  .addEventListener("click", () => settingsOverlay.classList.remove("open"));
settingsOverlay.addEventListener("click", (e) => {
  if (e.target === settingsOverlay) settingsOverlay.classList.remove("open");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") settingsOverlay.classList.remove("open");
});
for (const [id, key] of [
  ["themeSetting", "theme"],
  ["clockSizeSetting", "clockSize"],
  ["clockWeightSetting", "clockWeight"],
  ["clockStyleSetting", "clockStyle"],
  ["timeFormatSetting", "timeFormat"],
])
  document.getElementById(id).addEventListener("change", (e) => {
    settings[key] = e.target.value;
    saveSettings();
  });
document.getElementById("secondsSetting").addEventListener("change", (e) => {
  settings.showSeconds = e.target.checked;
  saveSettings();
});
const searchForm = document.getElementById("searchForm"),
  searchInput = document.getElementById("searchInput");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;
  saveRecentSearch(query);
  const isUrl =
    /^(https?:\/\/|www\.)/i.test(query) ||
    /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(query);
  window.location.href = isUrl
    ? /^https?:\/\//i.test(query)
      ? query
      : `https://${query}`
    : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
});
function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.searches) || "[]");
  } catch {
    return [];
  }
}
function saveRecentSearch(query) {
  let searches = getRecentSearches().filter((x) => x !== query);
  searches.unshift(query);
  localStorage.setItem(STORAGE.searches, JSON.stringify(searches.slice(0, 8)));
  renderRecentSearches();
}
function renderRecentSearches() {
  const list = document.getElementById("recentList"),
    searches = getRecentSearches();
  list.replaceChildren();
  if (!searches.length) {
    list.innerHTML = '<div class="empty-state">No searches yet.</div>';
    return;
  }
  for (const query of searches) {
    const item = document.createElement("div");
    item.className = "recent-item";
    item.innerHTML =
      '<div class="recent-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.7"/><path d="M16 16L21 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></div><div class="recent-text"></div>';
    item.querySelector(".recent-text").textContent = query;
    item.addEventListener(
      "click",
      () =>
        (window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`),
    );
    list.appendChild(item);
  }
}
function handleProfileFile(file, preview, icon) {
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    currentProfile = reader.result;
    if (preview) {
      preview.src = currentProfile;
      preview.style.display = "block";
    }
    if (icon) icon.style.display = "none";
    localStorage.setItem(STORAGE.profile, currentProfile);
    updateAllProfileAvatars();
  };
  reader.readAsDataURL(file);
}
document
  .getElementById("profileInput")
  .addEventListener("change", (e) => handleProfileFile(e.target.files[0]));
document.getElementById("removeProfile").addEventListener("click", () => {
  currentProfile = "";
  localStorage.removeItem(STORAGE.profile);
  document.getElementById("profileInput").value = "";
  updateAllProfileAvatars();
});
const onboarding = document.getElementById("onboarding"),
  nameStep = document.getElementById("nameStep"),
  photoStep = document.getElementById("photoStep"),
  nameInput = document.getElementById("nameInput"),
  uploadPreview = document.getElementById("uploadPreview"),
  uploadIcon = document.getElementById("uploadIcon"),
  onboardingProfileInput = document.getElementById("onboardingProfileInput");
function startOnboarding() {
  onboarding.classList.add("active");
  nameStep.classList.add("active");
  photoStep.classList.remove("active");
  nameInput.value = localStorage.getItem(STORAGE.name) || "";
  setTimeout(() => nameInput.focus(), 80);
}
function completeOnboarding() {
  localStorage.setItem(STORAGE.completed, "true");
  updatePageTitle();
  updateAllProfileAvatars();
  onboarding.classList.remove("active");
  const screen = document.getElementById("personalizing");
  screen.classList.add("active");
  setTimeout(() => screen.classList.remove("active"), 900);
}
document.getElementById("nameContinue").addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    return;
  }
  currentName = name;
  localStorage.setItem(STORAGE.name, currentName);
  updatePageTitle();
  updateAllProfileAvatars();
  nameStep.classList.remove("active");
  photoStep.classList.add("active");
});
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("nameContinue").click();
});
onboardingProfileInput.addEventListener("change", (e) =>
  handleProfileFile(e.target.files[0], uploadPreview, uploadIcon),
);
document
  .getElementById("finishOnboarding")
  .addEventListener("click", completeOnboarding);
document.getElementById("skipPhoto").addEventListener("click", () => {
  currentProfile = "";
  localStorage.removeItem(STORAGE.profile);
  completeOnboarding();
});
// Vite reads this from VITE_VISUAL_CROSSING_API_KEY.
const VISUAL_CROSSING_API_KEY = "TV9GUTTC9XAEG4P4T9UMX8V34";
async function loadWeather() {
  const el = document.getElementById("weatherContent");
  if (!VISUAL_CROSSING_API_KEY) {
    el.innerHTML =
      '<div class="weather-status">Set VITE_VISUAL_CROSSING_API_KEY to enable live weather.</div>';
    return;
  }
  if (!navigator.geolocation) {
    el.innerHTML =
      '<div class="weather-status">Location access is not available.</div>';
    return;
  }
  el.innerHTML = '<div class="weather-status">Loading current weather…</div>';
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const location = `${pos.coords.latitude},${pos.coords.longitude}`;
        const params = new URLSearchParams({
          unitGroup: "metric",
          include: "current",
          elements:
            "datetime,temp,feelslike,humidity,windspeed,conditions,icon",
          key: VISUAL_CROSSING_API_KEY,
          contentType: "json",
        });
        const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) {
          const message = await response.text();
          throw new Error(
            message || `Weather request failed: ${response.status}`,
          );
        }
        const data = await response.json();
        const current = data.currentConditions || {};
        const temperature = Number.isFinite(current.temp)
          ? Math.round(current.temp)
          : "—";
        const feelsLike = Number.isFinite(current.feelslike)
          ? Math.round(current.feelslike)
          : "—";
        const humidity = Number.isFinite(current.humidity)
          ? Math.round(current.humidity)
          : "—";
        const wind = Number.isFinite(current.windspeed)
          ? Math.round(current.windspeed)
          : "—";
        const condition = current.conditions || "Current conditions";
        el.innerHTML = `<div><div class="weather-temp">${temperature}°</div><div class="weather-status" style="margin-top:7px">Feels like ${feelsLike}° · Humidity ${humidity}%</div></div><div class="weather-info"><div class="weather-condition">${escapeHtml(condition)}</div><div class="weather-location">Wind ${wind} km/h</div></div>`;
      } catch (error) {
        console.error("Visual Crossing weather error", error);
        el.innerHTML =
          '<div class="weather-status">Unable to load live weather. Check your API key and location access.</div>';
      }
    },
    () =>
      (el.innerHTML =
        '<div class="weather-status">Location permission is required for live weather.</div>'),
    { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 },
  );
}
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
async function loadMedia() {
  const title = document.getElementById("mediaTitle");
  const artist = document.getElementById("mediaArtist");

  if (!globalThis.chrome?.tabs?.query) {
    title.textContent = "Music information unavailable";
    artist.textContent =
      "Open Clean Newtab as a Chrome extension to read browser media.";
    return;
  }

  try {
    const tabs = await chrome.tabs.query({ audible: true });

    if (!tabs.length) {
      title.textContent = "Nothing playing";
      artist.textContent = "No audible browser tab";
      return;
    }

    const mediaTab = tabs[0];
    let metadata = null;

    if (globalThis.chrome?.scripting?.executeScript && mediaTab.id) {
      try {
        const result = await chrome.scripting.executeScript({
          target: { tabId: mediaTab.id },
          func: () => {
            const session = navigator.mediaSession?.metadata;
            const audio = [...document.querySelectorAll("audio,video")].find(
              (el) => !el.paused && !el.ended,
            );
            const pageTitle = document.title || "";
            const clean = (value) =>
              String(value || "")
                .replace(/\s+/g, " ")
                .trim();

            if (session) {
              return {
                title: clean(session.title),
                artist: clean(session.artist),
                album: clean(session.album),
              };
            }

            if (audio) {
              return {
                title: clean(pageTitle),
                artist: "Playing media",
                album: "",
              };
            }

            return null;
          },
        });
        metadata = result?.[0]?.result || null;
      } catch (error) {
        console.debug("Media metadata access unavailable", error);
      }
    }

    if (metadata?.title) {
      title.textContent = metadata.title;
      artist.textContent =
        metadata.artist || metadata.album || mediaTab.title || "Browser media";
      return;
    }

    title.textContent = mediaTab.title || "Playing media";
    artist.textContent = "Music is playing in this browser tab";
  } catch (error) {
    console.error("Browser media error", error);
    title.textContent = "Nothing playing";
    artist.textContent = "Unable to read browser media";
  }
}
const focusOverlay = document.getElementById("focusOverlay"),
  focusTask = document.getElementById("focusTask"),
  focusTimer = document.getElementById("focusTimer"),
  focusStart = document.getElementById("focusStart"),
  focusReset = document.getElementById("focusReset");
const focusHome = document.getElementById("focusHome"),
  focusHomeTask = document.getElementById("focusHomeTask"),
  focusHomeTime = document.getElementById("focusHomeTime"),
  focusHomeStatus = document.getElementById("focusHomeStatus"),
  focusProgressBar = document.getElementById("focusProgressBar");
const FOCUS_STORAGE = "newTabFocusSession";
let focusMinutes = 25,
  focusRemaining = 1500,
  focusInterval = null,
  focusRunning = false,
  focusStartedAt = 0,
  focusEndAt = 0;
function renderFocusTimer() {
  const m = Math.floor(focusRemaining / 60)
      .toString()
      .padStart(2, "0"),
    s = (focusRemaining % 60).toString().padStart(2, "0");
  focusTimer.textContent = `${m}:${s}`;
}
function saveFocusSession() {
  if (!focusRunning) return;
  localStorage.setItem(
    FOCUS_STORAGE,
    JSON.stringify({
      task: focusTask.value.trim() || "Focus session",
      minutes: focusMinutes,
      endAt: focusEndAt,
      startedAt: focusStartedAt,
    }),
  );
}
function clearFocusSession() {
  localStorage.removeItem(FOCUS_STORAGE);
  focusHome.classList.remove("active");
}
function renderHomeFocus() {
  const raw = localStorage.getItem(FOCUS_STORAGE);
  if (!raw) {
    focusHome.classList.remove("active");
    return;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    clearFocusSession();
    return;
  }
  const remaining = Math.max(0, Math.ceil((data.endAt - Date.now()) / 1000));
  if (remaining <= 0) {
    clearFocusSession();
    return;
  }
  const total = Math.max(1, Number(data.minutes) * 60),
    elapsed = Math.min(total, total - remaining);
  focusHomeTask.textContent = data.task || "Focus session";
  focusHomeTime.textContent = `${Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;
  focusHomeStatus.textContent = "In progress";
  focusProgressBar.style.width = `${Math.max(0, Math.min(100, (elapsed / total) * 100))}%`;
  focusHome.classList.add("active");
}
function restoreFocusSession() {
  const raw = localStorage.getItem(FOCUS_STORAGE);
  if (!raw) return;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return clearFocusSession();
  }
  const remaining = Math.max(0, Math.ceil((data.endAt - Date.now()) / 1000));
  if (remaining <= 0) return clearFocusSession();
  focusMinutes = Number(data.minutes) || 25;
  focusRemaining = remaining;
  focusStartedAt = Number(data.startedAt) || Date.now();
  focusEndAt = Number(data.endAt);
  focusRunning = true;
  focusTask.value = data.task || "";
  focusStart.textContent = "Pause";
  document
    .querySelectorAll(".focus-preset")
    .forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.minutes) === focusMinutes),
    );
  renderFocusTimer();
  renderHomeFocus();
}
function setFocusMinutes(minutes) {
  focusMinutes = minutes;
  focusRemaining = minutes * 60;
  focusRunning = false;
  focusStartedAt = 0;
  focusEndAt = 0;
  clearInterval(focusInterval);
  focusInterval = null;
  focusStart.textContent = "Start focus";
  document
    .querySelectorAll(".focus-preset")
    .forEach((b) =>
      b.classList.toggle("active", Number(b.dataset.minutes) === minutes),
    );
  renderFocusTimer();
}
function finishFocus() {
  clearInterval(focusInterval);
  focusInterval = null;
  focusRunning = false;
  focusStart.textContent = "Start again";
  focusTimer.textContent = "00:00";
  localStorage.removeItem(FOCUS_STORAGE);
  focusHome.classList.remove("active");
  focusHomeStatus.textContent = "Completed";
  focusTask.blur();
}
function toggleFocus() {
  if (focusRunning) {
    clearInterval(focusInterval);
    focusInterval = null;
    focusRunning = false;
    focusStart.textContent = "Resume focus";
    localStorage.removeItem(FOCUS_STORAGE);
    focusHomeStatus.textContent = "Paused";
    return;
  }
  if (focusRemaining <= 0) focusRemaining = focusMinutes * 60;
  focusRunning = true;
  focusStartedAt = Date.now();
  focusEndAt = Date.now() + focusRemaining * 1000;
  focusStart.textContent = "Pause";
  saveFocusSession();
  renderHomeFocus();
  focusInterval = setInterval(() => {
    focusRemaining = Math.max(0, Math.ceil((focusEndAt - Date.now()) / 1000));
    renderFocusTimer();
    renderHomeFocus();
    if (focusRemaining <= 0) finishFocus();
  }, 250);
}
document.getElementById("focusButton").addEventListener("click", () => {
  focusOverlay.classList.add("open");
  focusTask.focus();
});
document
  .getElementById("closeFocus")
  .addEventListener("click", () => focusOverlay.classList.remove("open"));
focusOverlay.addEventListener("click", (e) => {
  if (e.target === focusOverlay) focusOverlay.classList.remove("open");
});
document
  .querySelectorAll(".focus-preset")
  .forEach((b) =>
    b.addEventListener("click", () =>
      setFocusMinutes(Number(b.dataset.minutes)),
    ),
  );
focusStart.addEventListener("click", toggleFocus);
focusReset.addEventListener("click", () => {
  setFocusMinutes(focusMinutes);
  clearFocusSession();
});
focusTask.addEventListener("keydown", (e) => {
  if (e.key === "Enter") toggleFocus();
});
document.getElementById("focusHomeOpen").addEventListener("click", () => {
  focusOverlay.classList.add("open");
  focusTask.focus();
});
document
  .getElementById("homeButton")
  .addEventListener("click", () =>
    document.querySelector(".main").scrollTo({ top: 0, behavior: "smooth" }),
  );
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (settings.theme === "system") applyTheme();
  });
function initialize() {
  loadSettingsUI();
  applyTheme();
  applyClockSettings();
  updateClock();
  updatePageTitle();
  updateAllProfileAvatars();
  renderRecentSearches();
  loadWeather();
  loadMedia();
  restoreFocusSession();
  setInterval(updateClock, 1000);
  if (!localStorage.getItem(STORAGE.completed)) startOnboarding();
}
initialize();
