# HA Energy Native

![HA Energy Native banner](https://raw.githubusercontent.com/CorCorMS/ha-energy-native/main/assets/repo-banner.png)

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://www.hacs.xyz/)
[![GitHub Release](https://img.shields.io/github/v/release/CorCorMS/ha-energy-native)](https://github.com/CorCorMS/ha-energy-native/releases)
[![License](https://img.shields.io/github/license/CorCorMS/ha-energy-native)](https://github.com/CorCorMS/ha-energy-native/blob/main/LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-FFDD00?logo=buymeacoffee&logoColor=000000)](https://buymeacoffee.com/corcor)

HA Energy Native is a Home Assistant custom integration that adds a second native Energy dashboard entry to the sidebar and extends it with clone-specific behavior.

Current features:

- second native Energy dashboard entry running in parallel to the original
- HACS-ready custom integration structure
- clone-specific PV option for `Balkonkraftwerk`
- clone-specific gross grid import logic for:
  - sources table
  - grid neutrality gauge
- persistent clone settings stored in Home Assistant
- reuses the existing sensors, statistics, and stored Energy dashboard configuration from the original Home Assistant Energy dashboard

## Repository type

HACS category: `Integration`

## Install with HACS

### As a custom repository

1. Add this repository as a custom repository in HACS
2. Select category `Integration`
3. Install `HA Energy Native`
4. Restart Home Assistant
5. Add the integration

Repository URL:

`https://github.com/CorCorMS/ha-energy-native`

### Direct HACS link

[![Open your Home Assistant instance and open the HACS repository dialog with a specific repository pre-filled.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=CorCorMS&repository=ha-energy-native&category=integration)

### What happens after HACS installation

After installing through HACS and adding the integration:

- Home Assistant adds a second Energy dashboard entry to the sidebar
- the original Home Assistant Energy dashboard stays unchanged
- the clone reuses your existing Energy dashboard configuration
- your already configured sensors, statistics, source assignments, and stored Energy preferences continue to be used
- you do not need to rebuild the Energy dashboard from scratch

### HACS update behavior

- New versions are delivered through GitHub releases
- HACS detects versions from releases like `v0.1.0`
- After updating in HACS, restart Home Assistant so the updated frontend/backend files are loaded

## Versioning

- HACS uses GitHub releases for versions
- Releases are published with tags like `v0.1.0`
- Plain tags alone are not enough for clean HACS version handling

## Support the project

If you want to support development:

[Buy me a coffee](https://buymeacoffee.com/corcor)

## Notes

- The Home Assistant integration domain remains `ha_energy_native_clone`
- The sidebar panel can run in parallel with the original Energy dashboard
- This project builds on Home Assistant's Energy dashboard behavior and keeps the original dashboard untouched
- Existing Energy dashboard setup stays in place: the sensors, source assignments, statistics, and saved Energy preferences from the original Home Assistant Energy dashboard continue to be used by this clone

## License

This repository uses the same license family as Home Assistant: Apache License 2.0.
