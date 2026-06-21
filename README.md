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

1. Add this repository as a custom repository in HACS
2. Select category `Integration`
3. Install `HA Energy Native`
4. Restart Home Assistant
5. Add the integration

## Notes

- The Home Assistant integration domain remains `ha_energy_native_clone`
- The sidebar panel can run in parallel with the original Energy dashboard
- This project builds on Home Assistant's Energy dashboard behavior and keeps the original dashboard untouched

## License

This repository uses the same license family as Home Assistant: Apache License 2.0.
