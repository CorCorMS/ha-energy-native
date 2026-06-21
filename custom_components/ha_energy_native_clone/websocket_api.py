from __future__ import annotations

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .storage import async_load_settings, async_save_settings


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get_settings"})
@websocket_api.async_response
async def ws_get_settings(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    data = await async_load_settings(hass)
    connection.send_result(msg["id"], data)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/set_solar_override",
        vol.Required("stat_energy_from"): str,
        vol.Optional("previous_stat_energy_from"): vol.Any(str, None),
        vol.Required("balcony_mode"): bool,
    }
)
@websocket_api.async_response
async def ws_set_solar_override(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    data = await async_load_settings(hass)
    overrides: dict = data.setdefault("solar_overrides", {})

    previous = msg.get("previous_stat_energy_from")
    current = msg["stat_energy_from"]
    enabled = msg["balcony_mode"]

    if previous and previous != current:
        overrides.pop(previous, None)

    if enabled:
        overrides[current] = {"balcony_mode": True}
    else:
        overrides.pop(current, None)

    await async_save_settings(hass, data)
    connection.send_result(msg["id"], data)


async def async_register_websocket_api(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get_settings)
    websocket_api.async_register_command(hass, ws_set_solar_override)
