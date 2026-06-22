"""SPDX-License-Identifier: Apache-2.0

Distributed under Apache-2.0 for compatibility with Home Assistant-derived
parts shipped in this repository.
"""

from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import (
    DEFAULT_ADMIN_ONLY,
    DEFAULT_ICON,
    DEFAULT_TITLE,
    DEFAULT_URL_PATH,
    DOMAIN,
)


class HaEnergyNativeCloneConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for HA Energy Native Clone."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None) -> FlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        if user_input is not None:
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=user_input["title"],
                data=user_input,
            )

        schema = vol.Schema(
            {
                vol.Required("title", default=DEFAULT_TITLE): str,
                vol.Required("icon", default=DEFAULT_ICON): str,
                vol.Required("url_path", default=DEFAULT_URL_PATH): str,
                vol.Required("admin_only", default=DEFAULT_ADMIN_ONLY): bool,
            }
        )

        return self.async_show_form(step_id="user", data_schema=schema)
