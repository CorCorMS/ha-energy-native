from __future__ import annotations

from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    DEFAULT_ADMIN_ONLY,
    DEFAULT_ICON,
    DEFAULT_TITLE,
    DEFAULT_URL_PATH,
    PANEL_STATIC_URL,
)


def _panel_options(config: dict | None) -> dict:
    config = config or {}
    return {
        "title": config.get("title", DEFAULT_TITLE),
        "icon": config.get("icon", DEFAULT_ICON),
        "url_path": config.get("url_path", DEFAULT_URL_PATH),
        "admin_only": config.get("admin_only", DEFAULT_ADMIN_ONLY),
    }


async def async_register_panel(hass: HomeAssistant, config: dict | None = None) -> None:
    """Register static assets and sidebar panel."""

    options = _panel_options(config)
    panel_path = Path(__file__).with_name("panel.js")

    await hass.http.async_register_static_paths(
        [StaticPathConfig(PANEL_STATIC_URL, str(panel_path), cache_headers=False)]
    )
    frontend.add_extra_js_url(hass, PANEL_STATIC_URL)

    existing = hass.data.get("frontend_panels", {})
    if options["url_path"] in existing:
        return

    frontend.async_register_built_in_panel(
        hass,
        component_name="energy",
        sidebar_title=options["title"],
        sidebar_icon=options["icon"],
        sidebar_default_visible=True,
        frontend_url_path=options["url_path"],
        require_admin=options["admin_only"],
    )
