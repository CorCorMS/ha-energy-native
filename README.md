# HA Energy Native

![HA Energy Native banner](https://raw.githubusercontent.com/CorCorMS/ha-energy-native/main/assets/repo-banner.png)

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://www.hacs.xyz/)
[![GitHub Release](https://img.shields.io/github/v/release/CorCorMS/ha-energy-native)](https://github.com/CorCorMS/ha-energy-native/releases)
[![License](https://img.shields.io/github/license/CorCorMS/ha-energy-native)](https://github.com/CorCorMS/ha-energy-native/blob/main/LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-FFDD00?logo=buymeacoffee&logoColor=000000)](https://buymeacoffee.com/corcor)

HA Energy Native adds a second native Home Assistant Energy dashboard entry to the sidebar and extends it with clone-specific behavior while continuing to use your existing Energy setup.

## What this release includes

- native parallel Energy dashboard entry
- enhanced Summary view with gross grid import presentation
- live Now tab with power-focused cards
- `Balkonkraftwerk` option inside the PV module configuration
- reuse of the original Home Assistant Energy configuration

## Visual overview

Summary dashboard:

<img src="https://raw.githubusercontent.com/CorCorMS/ha-energy-native/main/assets/screenshots/readme/summary-overview.png" alt="Summary dashboard" width="100%">

<table>
  <tr>
    <td width="58%" valign="top">
      <strong>Now tab with live cards</strong><br><br>
      <img src="https://raw.githubusercontent.com/CorCorMS/ha-energy-native/main/assets/screenshots/readme/now-live-focus.png" alt="Now tab live cards" width="100%">
    </td>
    <td width="42%" valign="top">
      <strong>PV settings with Balkonkraftwerk mode</strong><br><br>
      <img src="https://raw.githubusercontent.com/CorCorMS/ha-energy-native/main/assets/screenshots/readme/balcony-mode-focus.png" alt="Balkonkraftwerk mode" width="100%">
    </td>
  </tr>
</table>

Sources table:

<img src="https://raw.githubusercontent.com/CorCorMS/ha-energy-native/main/assets/screenshots/readme/sources-table-focus.png" alt="Sources table" width="52%">

## Uses your existing Home Assistant Energy configuration

HA Energy Native does not require you to rebuild the Energy dashboard from scratch.

It reuses the existing configuration from the original Home Assistant Energy dashboard, including:

- configured sensors
- statistics
- source assignments
- stored Energy preferences

The original Energy dashboard remains in place, and the clone uses the same underlying Energy setup.

## Features

- second native Energy dashboard entry running in parallel to the original
- HACS-ready custom integration structure
- clone-specific PV option for `Balkonkraftwerk`
- clone-specific gross grid import logic for:
  - sources table
  - grid neutrality gauge
- persistent clone settings stored in Home Assistant
- updated Summary and Now tab visuals

## Install with HACS

### As a custom repository

1. Add this repository as a custom repository in HACS
2. Select category `Integration`
3. Install `HA Energy Native`
4. Restart Home Assistant
5. Add the integration

Repository URL:

`https://github.com/CorCorMS/ha-energy-native`

Important:

- use `https://github.com/CorCorMS/ha-energy-native`
- do not use `https://github.com/CorCorMS/grow-os-ha` for this integration

### Direct HACS link

[![Open your Home Assistant instance and open the HACS repository dialog with a specific repository pre-filled.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=CorCorMS&repository=ha-energy-native&category=integration)

### After installation

- Home Assistant adds a second Energy dashboard entry to the sidebar
- the original Home Assistant Energy dashboard stays unchanged
- the clone reuses your existing Energy dashboard configuration
- your already configured sensors, statistics, source assignments, and stored Energy preferences continue to be used

## Versioning and updates

- HACS category: `Integration`
- HACS reads versions from GitHub releases
- releases are published with tags like `v0.1.4`
- after updating in HACS, restart Home Assistant so updated frontend and backend files are loaded

## Changelog

See [CHANGELOG.md](https://github.com/CorCorMS/ha-energy-native/blob/main/CHANGELOG.md) for release history.

## Support the project

If you want to support development:

[Buy me a coffee](https://buymeacoffee.com/corcor)

## Notes

- integration domain: `ha_energy_native_clone`
- the sidebar panel runs in parallel with the original Energy dashboard
- the project keeps the original dashboard untouched
- the original Energy sensors, source assignments, statistics, and saved preferences continue to be used

## License

This repository uses the same license family as Home Assistant: Apache License 2.0.
