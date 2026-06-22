# Changelog

All notable changes to this project are documented in this file.

## v0.1.9 - 2026-06-22

### Fixed

- improved the `Jetzt` layout switching so mobile and desktop breakpoints rebuild more reliably
- added additional listeners for breakpoint changes, orientation changes, page visibility changes, and page restores

### Changed

- updated the repository banner to the new dark showcase artwork provided for the project
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
- show and animate the live `CO2-neutral` flow only when a valid value above zero exists
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

- repository banner updated again using the preferred artwork template
- screenshot cards in the banner replaced with the current HA Energy Native UI
- small project logo moved to the top-right corner of the banner
- banner line routing adjusted to follow the supplied reference layout more closely

## v0.1.3 - 2026-06-22

### Added

- new repository banner based on the preferred showcase layout

### Changed

- banner visuals updated with current Energy clone screenshots
- banner line routing adjusted so Energy sources converge on the HA center point

### Cleaned

- removed development leftovers from the custom component package
- reduced the shipped integration files to the active runtime set only

## v0.1.2 - 2026-06-22

### Added

- improved README screenshot gallery with dedicated cropped preview images
- new repository banner based on the current Home Assistant UI
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
