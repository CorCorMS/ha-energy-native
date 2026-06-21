# HA Energy Native

HA Energy Native is a Home Assistant custom integration that adds a second native Energy dashboard entry to the sidebar and extends it with clone-specific behavior.

Current features:

- second native Energy dashboard entry running in parallel to the original
- HACS-ready custom integration structure
- clone-specific PV option for `Balkonkraftwerk`
- clone-specific gross grid import logic for:
  - sources table
  - grid neutrality gauge
- persistent clone settings stored in Home Assistant

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

## License

This repository uses the same license family as Home Assistant: Apache License 2.0.
