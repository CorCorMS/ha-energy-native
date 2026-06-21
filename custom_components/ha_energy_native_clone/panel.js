(() => {
  const DOMAIN = "ha_energy_native_clone";
  const CLONE_URL_PATH = "energy-native-clone";

  const LOCALIZE_FALLBACK = {
    grossGridLabel: {
      de: "Netzbezug brutto",
      en: "Gross grid import",
    },
    balconyTitle: {
      de: "Balkonkraftwerk",
      en: "Balcony power station",
    },
    balconyDescription: {
      de: "Aktiviert Brutto-Netzbezug im Energie-Clone: Einspeisung wird dort nicht mehr vom Bezug abgezogen.",
      en: "Enables gross grid import in the energy clone: exported energy is no longer subtracted from grid import there.",
    },
  };

  const getLang = (hass) => hass?.locale?.language || hass?.language || "en";

  const t = (hass, key) =>
    LOCALIZE_FALLBACK[key]?.[getLang(hass)] || LOCALIZE_FALLBACK[key]?.en || key;

  const formatNumber = (hass, value, options = {}) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
      ...options,
    }).format(value ?? 0);

  const formatCurrency = (hass, value) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: hass?.config?.currency || "EUR",
      maximumFractionDigits: 2,
    }).format(value ?? 0);

  const calculateStatisticSumGrowth = (values) => {
    if (!values) {
      return null;
    }
    let growth = null;
    for (const value of values) {
      if (value?.change === null || value?.change === undefined) {
        continue;
      }
      growth = growth === null ? value.change : growth + value.change;
    }
    return growth;
  };

  const getCloneSettings = async (hass) => {
    if (!hass) {
      return { solar_overrides: {} };
    }
    if (!window.__haEnergyCloneSettingsPromise) {
      window.__haEnergyCloneSettingsPromise = hass
        .callWS({ type: `${DOMAIN}/get_settings` })
        .then((result) => {
          window.__haEnergyCloneSettings = result || { solar_overrides: {} };
          return window.__haEnergyCloneSettings;
        })
        .catch((err) => {
          console.warn("Failed to load HA energy clone settings", err);
          return { solar_overrides: {} };
        });
    }
    return window.__haEnergyCloneSettingsPromise;
  };

  const setCloneSettings = (data) => {
    window.__haEnergyCloneSettings = data || { solar_overrides: {} };
    window.__haEnergyCloneSettingsPromise = Promise.resolve(
      window.__haEnergyCloneSettings
    );
  };

  const anyBalconyEnabled = (data) => {
    const overrides = window.__haEnergyCloneSettings?.solar_overrides || {};
    return (data?.prefs?.energy_sources || []).some(
      (source) => source.type === "solar" && overrides[source.stat_energy_from]?.balcony_mode
    );
  };

  const isCloneContext = (element) => {
    let current = element;
    while (current) {
      if (
        current.tagName?.toLowerCase?.() === "ha-panel-energy" &&
        current.panel?.url_path === CLONE_URL_PATH
      ) {
        return true;
      }
      const root = current.getRootNode?.();
      current = root?.host;
    }
    return false;
  };

  const getGridImportTotals = (data) => {
    let energy = 0;
    let cost = 0;
    let hasCost = false;
    let compareEnergy = 0;
    let compareCost = 0;

    const gridSources = (data?.prefs?.energy_sources || []).filter(
      (source) => source.type === "grid" && source.stat_energy_from
    );

    for (const source of gridSources) {
      const statId = source.stat_energy_from;
      const importEnergy = calculateStatisticSumGrowth(data?.stats?.[statId]) || 0;
      energy += importEnergy;

      const importEnergyCompare =
        calculateStatisticSumGrowth(data?.statsCompare?.[statId]) || 0;
      compareEnergy += importEnergyCompare;

      const costStat =
        source.stat_cost || data?.info?.cost_sensors?.[source.stat_energy_from];
      if (costStat) {
        hasCost = true;
        cost += calculateStatisticSumGrowth(data?.stats?.[costStat]) || 0;
        compareCost +=
          calculateStatisticSumGrowth(data?.statsCompare?.[costStat]) || 0;
      }
    }

    return { energy, cost, hasCost, compareEnergy, compareCost };
  };

  const patchSourcesTableCard = () => {
    const tag = "hui-energy-sources-table-card";
    const Card = customElements.get(tag);
    if (!Card || Card.prototype.__haEnergyClonePatched) {
      return;
    }

    const originalUpdated = Card.prototype.updated;
    Card.prototype.updated = function (...args) {
      if (originalUpdated) {
        originalUpdated.apply(this, args);
      }
      try {
        if (!window.__haEnergyCloneSettingsPromise && this.hass) {
          getCloneSettings(this.hass).then(() => this.requestUpdate?.());
        }
        if (!isCloneContext(this) || !this._data || !anyBalconyEnabled(this._data)) {
          return;
        }

        const root = this.renderRoot || this.shadowRoot;
        if (!root) {
          return;
        }

        const rows = [...root.querySelectorAll("tbody tr")];
        const originalGridLabel =
          this.hass?.localize?.(
            "ui.panel.lovelace.cards.energy.energy_sources_table.grid_total"
          ) || "Grid total";

        const row = rows.find((candidate) => {
          const label = candidate.querySelector("th")?.textContent?.trim();
          return (
            label === originalGridLabel ||
            label === t(this.hass, "grossGridLabel")
          );
        });

        if (!row) {
          return;
        }

        const totals = getGridImportTotals(this._data);
        const compare = !!this._data?.statsCompare;
        const numericCells = [...row.querySelectorAll("td.mdc-data-table__cell--numeric")];
        const showCosts = numericCells.length === (compare ? 4 : 2);

        row.querySelector("th").textContent = t(this.hass, "grossGridLabel");

        if (compare && showCosts) {
          numericCells[0].textContent = `${formatNumber(
            this.hass,
            totals.compareEnergy
          )} kWh`;
          numericCells[1].textContent = totals.hasCost
            ? formatCurrency(this.hass, totals.compareCost)
            : "";
          numericCells[2].textContent = `${formatNumber(
            this.hass,
            totals.energy
          )} kWh`;
          numericCells[3].textContent = totals.hasCost
            ? formatCurrency(this.hass, totals.cost)
            : "";
        } else if (compare) {
          numericCells[0].textContent = `${formatNumber(
            this.hass,
            totals.compareEnergy
          )} kWh`;
          numericCells[1].textContent = `${formatNumber(
            this.hass,
            totals.energy
          )} kWh`;
        } else if (showCosts) {
          numericCells[0].textContent = `${formatNumber(
            this.hass,
            totals.energy
          )} kWh`;
          numericCells[1].textContent = totals.hasCost
            ? formatCurrency(this.hass, totals.cost)
            : "";
        } else if (numericCells[0]) {
          numericCells[0].textContent = `${formatNumber(
            this.hass,
            totals.energy
          )} kWh`;
        }
      } catch (err) {
        console.warn("Failed to apply clone adjustments to sources table", err);
      }
    };

    Card.prototype.__haEnergyClonePatched = true;
  };

  const patchGridGaugeCard = () => {
    const tag = "hui-energy-grid-neutrality-gauge-card";
    const Card = customElements.get(tag);
    if (!Card || Card.prototype.__haEnergyClonePatched) {
      return;
    }

    const originalUpdated = Card.prototype.updated;
    Card.prototype.updated = function (...args) {
      if (originalUpdated) {
        originalUpdated.apply(this, args);
      }
      try {
        if (!window.__haEnergyCloneSettingsPromise && this.hass) {
          getCloneSettings(this.hass).then(() => this.requestUpdate?.());
        }
        if (!isCloneContext(this) || !this._data || !anyBalconyEnabled(this._data)) {
          return;
        }

        const root = this.renderRoot || this.shadowRoot;
        if (!root) {
          return;
        }

        const gauge = root.querySelector("ha-gauge");
        const name = root.querySelector(".name");
        if (!gauge || !name) {
          return;
        }

        const totals = getGridImportTotals(this._data);
        gauge.value = totals.energy > 0 ? -1 : 0;
        gauge.valueText = formatNumber(this.hass, totals.energy);
        gauge.label = "kWh";
        name.textContent = t(this.hass, "grossGridLabel");
      } catch (err) {
        console.warn("Failed to apply clone adjustments to grid gauge", err);
      }
    };

    Card.prototype.__haEnergyClonePatched = true;
  };

  const injectBalconyCheckbox = (dialog) => {
    const root = dialog.renderRoot || dialog.shadowRoot;
    if (!root) {
      return;
    }

    const footer = root.querySelector("ha-dialog-footer");
    if (!footer?.parentElement) {
      return;
    }

    let wrapper = root.querySelector("[data-ha-energy-clone-balcony]");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.setAttribute("data-ha-energy-clone-balcony", "true");
      wrapper.style.marginTop = "16px";
      wrapper.style.paddingTop = "12px";
      wrapper.style.borderTop = "1px solid var(--divider-color)";

      const checkbox = document.createElement("ha-checkbox");
      checkbox.id = "ha-energy-clone-balcony-checkbox";
      checkbox.style.display = "block";
      checkbox.style.marginBottom = "8px";
      checkbox.append(document.createTextNode(t(dialog.hass, "balconyTitle")));
      checkbox.addEventListener("change", () => {
        dialog.__haEnergyCloneBalconyMode = !!checkbox.checked;
      });

      const description = document.createElement("div");
      description.style.color = "var(--secondary-text-color)";
      description.style.lineHeight = "1.4";
      description.style.fontSize = "0.95rem";
      description.textContent = t(dialog.hass, "balconyDescription");

      wrapper.append(checkbox, description);
      footer.parentElement.insertBefore(wrapper, footer);
    }

    const checkbox = wrapper.querySelector("ha-checkbox");
    if (checkbox) {
      checkbox.checked = !!dialog.__haEnergyCloneBalconyMode;
      checkbox.textContent = "";
      checkbox.append(document.createTextNode(t(dialog.hass, "balconyTitle")));
    }

    const description = wrapper.querySelector("div");
    if (description) {
      description.textContent = t(dialog.hass, "balconyDescription");
    }
  };

  const patchSolarDialog = () => {
    const tag = "dialog-energy-solar-settings";
    const Dialog = customElements.get(tag);
    if (!Dialog || Dialog.prototype.__haEnergyClonePatched) {
      return;
    }

    const originalShowDialog = Dialog.prototype.showDialog;
    Dialog.prototype.showDialog = async function (...args) {
      await originalShowDialog.apply(this, args);
      try {
        const settings = await getCloneSettings(this.hass);
        const currentStat =
          this._source?.stat_energy_from || this._params?.source?.stat_energy_from;
        this.__haEnergyCloneBalconyMode = !!settings?.solar_overrides?.[currentStat]
          ?.balcony_mode;
      } catch (err) {
        this.__haEnergyCloneBalconyMode = false;
      }

      setTimeout(() => injectBalconyCheckbox(this), 0);
    };

    const originalUpdated = Dialog.prototype.updated;
    Dialog.prototype.updated = function (...args) {
      if (originalUpdated) {
        originalUpdated.apply(this, args);
      }
      injectBalconyCheckbox(this);
    };

    const originalSave = Dialog.prototype._save;
    Dialog.prototype._save = async function (...args) {
      const previousStat = this._params?.source?.stat_energy_from || null;
      const currentStat = this._source?.stat_energy_from;
      const enabled = !!this.__haEnergyCloneBalconyMode;

      await originalSave.apply(this, args);

      if (!this.hass || !currentStat) {
        return;
      }

      try {
        const result = await this.hass.callWS({
          type: `${DOMAIN}/set_solar_override`,
          stat_energy_from: currentStat,
          previous_stat_energy_from: previousStat,
          balcony_mode: enabled,
        });
        setCloneSettings(result);
      } catch (err) {
        console.warn("Failed to save HA energy clone balcony setting", err);
      }
    };

    Dialog.prototype.__haEnergyClonePatched = true;
  };

  const patchWhenDefined = (tag, patcher) => {
    customElements.whenDefined(tag).then(() => {
      try {
        patcher();
      } catch (err) {
        console.warn(`Failed to patch ${tag}`, err);
      }
    });
  };

  patchWhenDefined("hui-energy-sources-table-card", patchSourcesTableCard);
  patchWhenDefined(
    "hui-energy-grid-neutrality-gauge-card",
    patchGridGaugeCard
  );
  patchWhenDefined("dialog-energy-solar-settings", patchSolarDialog);
})();
