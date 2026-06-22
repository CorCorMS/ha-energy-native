"""SPDX-License-Identifier: Apache-2.0

Distributed under Apache-2.0 for compatibility with Home Assistant-derived
parts shipped in this repository.
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .panel import async_register_panel
from .websocket_api import async_register_websocket_api

PLATFORMS: list[Platform] = []


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up integration from YAML if present."""

    await async_register_websocket_api(hass)

    yaml_config = config.get(DOMAIN)
    if yaml_config is not None:
        await async_register_panel(hass, yaml_config)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up integration from config entry."""

    await async_register_panel(hass, dict(entry.data))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry."""

    return True
