from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STORAGE_KEY, STORAGE_VERSION


def get_store(hass: HomeAssistant) -> Store:
    return Store(hass, STORAGE_VERSION, STORAGE_KEY)


async def async_load_settings(hass: HomeAssistant) -> dict:
    store = get_store(hass)
    data = await store.async_load()
    if not isinstance(data, dict):
        return {"solar_overrides": {}}
    if "solar_overrides" not in data or not isinstance(data["solar_overrides"], dict):
        data["solar_overrides"] = {}
    return data


async def async_save_settings(hass: HomeAssistant, data: dict) -> None:
    store = get_store(hass)
    await store.async_save(data)
