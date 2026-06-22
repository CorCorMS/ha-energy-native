# Changelog

All notable changes to this project are documented in this file.

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
