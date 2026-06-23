"""SPDX-License-Identifier: Apache-2.0

Distributed under Apache-2.0 for compatibility with Home Assistant-derived
parts shipped in this repository.
"""

DOMAIN = "ha_energy_native_clone"
ASSET_VERSION = "2026.06.23.72"

DEFAULT_TITLE = "Energie Native"
DEFAULT_ICON = "mdi:lightning-bolt-circle"
DEFAULT_URL_PATH = "energy-native-clone"
DEFAULT_ADMIN_ONLY = False

PANEL_COMPONENT_NAME = "ha-energy-native-clone-panel"
PANEL_FILENAME = "panel.js"
PANEL_STATIC_PATH = f"/{DOMAIN}/{PANEL_FILENAME}"
PANEL_STATIC_URL = f"{PANEL_STATIC_PATH}?v={ASSET_VERSION}"

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}_settings"
