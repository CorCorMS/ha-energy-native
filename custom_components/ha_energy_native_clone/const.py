DOMAIN = "ha_energy_native_clone"

DEFAULT_TITLE = "Energie Native"
DEFAULT_ICON = "mdi:lightning-bolt-circle"
DEFAULT_URL_PATH = "energy-native-clone"
DEFAULT_ADMIN_ONLY = False

PANEL_COMPONENT_NAME = "ha-energy-native-clone-panel"
PANEL_FILENAME = "panel.js"
PANEL_STATIC_URL = f"/{DOMAIN}/{PANEL_FILENAME}"

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}_settings"
