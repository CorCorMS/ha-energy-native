# Changelog

All notable changes to this project are documented in this file.

## v1.0.1 - 2026-06-23

### Fixed

- aligned gas and water live-flow animation behavior with the displayed one-decimal rounding so connectors stay still when the UI shows `0.0`
- preserved the native Home Assistant Lovelace runtime methods while patching clone views, which restores the admin/edit path more safely than deep-copying the entire Lovelace state object
- improved clone panel stability after the 1.0.0 release by keeping the lighter native load path while still patching the custom `Jetzt` view

## v1.0.0 - 2026-06-23

### Added

- shipped the stable isolated clone loader for the `Jetzt` dashboard view so the clone keeps its own generated Energy state instead of depending on the later internal Home Assistant panel refresh cycle
- added the final stable live `Leistungsfluss` / `energy-distribution` behavior now used in the production clone
- completed multilingual clone labels and setup translations across the currently bundled language set

### Fixed

- fixed repeated fallback cases where the cloned `Jetzt` view could briefly jump back to an older/original Energy view after delayed internal reloads
- fixed gas and water flow animations so they stay disabled when their live values are `0`
- fixed layout jumps when optional nodes such as CO2-neutral and battery are hidden by keeping their layout slots stable
- fixed clone/mobile layout switching so the live view keeps the intended structure more reliably

### Changed

- promoted the project to `1.0.0` as the first stable release milestone
- removed temporary runtime debug logging from the frontend clone loader before release

## v0.1.14 - 2026-06-23

### Fixed

- hardened the cloned `Jetzt` loader so the custom Now view is re-applied even when Home Assistant internally regenerates the Energy dashboard state without passing an external Lovelace config object
- added an extra render-time safeguard so the clone keeps its isolated Now view instead of occasionally falling back to the original view after delayed HA reload cycles
- stopped gas and water connector animations from remaining visible when their live flow values are `0`
- kept the CO2 and battery slots layout-stable when hidden so other circles no longer jump into their positions

### Changed

- bumped the frontend asset version again so the latest loader and layout fixes are reliably reloaded by Home Assistant

## v0.1.13 - 2026-06-23

### Changed

- clarified licensing boundaries between Home Assistant-derived software code and original HA Energy Native branding/media assets
- kept Apache-2.0 for code distributed alongside Home Assistant-derived parts
- added explicit upstream attribution references for Home Assistant-derived files

### Added

- added `NOTICE` to document Apache-2.0 attribution context for Home Assistant-derived software components
- added `ASSET_LICENSE.md` to separately document non-commercial use restrictions for original repository media and branding assets

## v0.1.12 - 2026-06-23

### Added

- expanded clone language coverage for the custom frontend labels and the integration setup flow
- added additional translation files for `cs`, `da`, `es`, `fi`, `fr`, `it`, `ja`, `ko`, `nb`, `nl`, `nn`, `pl`, `pt`, `ru`, `sv`, `tr`, `uk`, `zh-Hans`, and `zh-Hant`

### Changed

- unified clone-specific labels under one locale-aware frontend localization system
- improved locale handling so region-specific HA languages such as `en-GB`, `pt-BR`, `es-419`, and similar variants resolve more like the original dashboard: exact locale first, base language second, English fallback last
- extended the same multilingual coverage to the `Balkonkraftwerk` option inside the Energy setup dialog
- cleaned up clone battery direction labels so they use stable Unicode arrows across locales

## v0.1.11 - 2026-06-23

### Fixed

- hardened the `Jetzt` loader so the cloned `now` view is re-applied whenever Home Assistant internally rebuilds or swaps the Energy views
- added stricter validation of the active `Jetzt` view structure before accepting it as the clone layout
- reduced cases where an older `Jetzt` variant could briefly reappear after internal view reloads

### Changed

- bumped the frontend asset version again so the stricter `Jetzt` loader is reliably reloaded by Home Assistant

## v0.1.10 - 2026-06-22

### Fixed

- resized the repository and integration brand icons to a HACS-friendlier 256x256 format
- reduced oversized branding assets that could cause poor HACS preview compatibility

## v0.1.9 - 2026-06-22

### Fixed

- improved the `Jetzt` layout switching so mobile and desktop breakpoints rebuild more reliably
- added additional listeners for breakpoint changes, orientation changes, page visibility changes, and page restores

### Changed

- bumped the frontend asset version again so the latest layout logic reloads reliably

## v0.1.8 - 2026-06-22

### Fixed

- added integration-local brand assets under `custom_components/ha_energy_native_clone/brand/`
- included `icon.png` and `logo.png` directly in the custom integration package for improved Home Assistant / HACS branding compatibility

### Notes

- the repository already includes root-level branding, but some Home Assistant / HACS flows also expect the brand assets inside the integration package itself

## v0.1.7 - 2026-06-22

### Fixed

- changed the live grid calculation to prefer only the power sensors configured in the Home Assistant Energy setup
- use `power_config.stat_rate_from` and `power_config.stat_rate_to` as the primary live grid source mapping
- prevent the live grid import/export view from mixing in the net-power sensor when dedicated Energy-setup power sensors are present

### Changed

- bumped the frontend asset version again so the corrected live grid sensor mapping reloads reliably

## v0.1.6 - 2026-06-22

### Fixed

- stabilized the `Jetzt` layout so the sidebar/content split no longer appears multiple times or disappears intermittently
- refined the live `CO2-neutral` card logic in `Jetzt`
- hide the live `CO2-neutral` circle when no valid source value is available
- recalculate live `CO2-neutral` using local PV usage plus the non-fossil share of current grid import

### Changed

- bumped frontend asset version again so Home Assistant reloads the corrected live panel code reliably

## v0.1.5 - 2026-06-22

### Fixed

- corrected the deployed HA clone so the active sidebar panel uses the current `Jetzt` implementation instead of the old test variant
- bumped frontend asset version to force Home Assistant to refresh cached panel files

### Changed

- added a repository-level `icon.png` for improved HACS/repository presentation
- clarified the README HACS instructions to use the correct repository URL
- prepared the package metadata for the updated release
  
## v0.1.4 - 2026-06-22

### Changed

- line routing adjusted to follow the supplied reference layout more closely

## v0.1.3 - 2026-06-22

### Cleaned

- removed development leftovers from the custom component package
- reduced the shipped integration files to the active runtime set only

## v0.1.2 - 2026-06-22

### Added

- improved README screenshot gallery with dedicated cropped preview images
- published project changelog

### Changed

- README layout cleaned up for a more polished GitHub presentation
- release documentation updated to match the current working Summary and Now views
- visual documentation for `Balkonkraftwerk` mode added

## v0.1.1 - 2026-06-21

### Changed

- repository and HACS presentation refined
- release packaging and public project structure improved

## v0.1.0 - 2026-06-21

### Added

- initial public release of HA Energy Native
- native parallel Energy dashboard clone
- HACS-ready integration package
