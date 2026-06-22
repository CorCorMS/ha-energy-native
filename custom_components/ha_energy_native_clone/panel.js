(() => {
  const DOMAIN = "ha_energy_native_clone";
  const CLONE_URL_PATH = "energy-native-clone";
  const NOW_VIEW_PATH = "now";
  const ELECTRICITY_VIEW_PATH = "electricity";
  const ENERGY_COLLECTION_KEY = "energy_dashboard";
  const POWER_COLLECTION_KEY = "energy_dashboard_now";
  const LARGE_SCREEN_CONDITION = {
    condition: "view_columns",
    min: 2,
  };
  const SMALL_SCREEN_CONDITION = {
    condition: "view_columns",
    max: 1,
  };
  const NOW_REPLACEMENT_TITLE = "Jetzt";
  const NOW_PRIMARY_CARD_TITLE = "Stromquellen";
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
  const FOSSIL_FUEL_PERCENTAGE_ENTITY_CANDIDATES = [
    "sensor.electricity_maps_anteil_fossiler_energietrager",
    "sensor.electricity_maps_fossil_fuel_percentage",
  ];
  const FLOW_RATE_TO_LMIN = {
    "m³/h": 1000 / 60,
    "m3/h": 1000 / 60,
    "L/min": 1,
    "l/min": 1,
    "gal/min": 3.785411784,
  };

  const deepClone = (value) =>
    value === undefined ? value : JSON.parse(JSON.stringify(value));

  const isClonePanel = (panel) => panel?.url_path === CLONE_URL_PATH;
  const isNowCloneRoute = () =>
    window.location.pathname.includes(`/${CLONE_URL_PATH}/${NOW_VIEW_PATH}`);
  const useCompactNowLayout = () =>
    window.matchMedia?.("(max-width: 899px)")?.matches ?? window.innerWidth < 900;
  const NOW_LAYOUT_MEDIA_QUERY = "(max-width: 899px)";
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

  const getLang = (hass) => hass?.locale?.language || hass?.language || "en";

  const t = (hass, key) =>
    LOCALIZE_FALLBACK[key]?.[getLang(hass)] || LOCALIZE_FALLBACK[key]?.en || key;

  const formatNumber = (value, maximumFractionDigits = 0) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value);

  const normalizeValueByUnit = (value, unit) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return undefined;
    }
    switch (unit) {
      case "W":
      case "w":
        return value;
      case "kW":
      case "kw":
        return value * 1000;
      case "MW":
      case "mw":
        return value * 1000000;
      default:
        return value;
    }
  };

  const getPowerFromState = (stateObj) => {
    if (!stateObj) return undefined;
    const value = Number.parseFloat(stateObj.state);
    if (Number.isNaN(value)) return undefined;
    return normalizeValueByUnit(
      value,
      stateObj.attributes?.unit_of_measurement || "W"
    );
  };

  const getConfiguredPower = (states, entityId) =>
    entityId ? getPowerFromState(states[entityId]) : undefined;

  const getConfiguredPercentage = (states, entityId) => {
    if (!entityId) return undefined;
    const stateObj = states[entityId];
    if (!stateObj) return undefined;
    const value = Number.parseFloat(stateObj.state);
    if (Number.isNaN(value)) return undefined;
    return Math.min(100, Math.max(0, value));
  };

  const getFlowRateFromState = (stateObj) => {
    if (!stateObj) return undefined;
    const value = Number.parseFloat(stateObj.state);
    if (Number.isNaN(value)) return undefined;
    return value;
  };

  const formatPower = (watts) => {
    const value = Math.abs(watts || 0);
    if (value >= 1000) {
      return `${formatNumber(value / 1000, 3)} kW`;
    }
    return `${formatNumber(value, 0)} W`;
  };

  const getFossilFuelPercentage = (states) => {
    for (const entityId of FOSSIL_FUEL_PERCENTAGE_ENTITY_CANDIDATES) {
      const value = getConfiguredPercentage(states, entityId);
      if (value !== undefined) return value;
    }
    return undefined;
  };

  const adminFormatNumber = (hass, value, options = {}) =>
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
    if (!values) return null;
    let growth = null;
    for (const value of values) {
      if (value?.change === null || value?.change === undefined) continue;
      growth = growth === null ? value.change : growth + value.change;
    }
    return growth;
  };

  const getCloneSettings = async (hass) => {
    if (!hass) return { solar_overrides: {} };
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
      (source) =>
        source.type === "solar" &&
        overrides[source.stat_energy_from]?.balcony_mode
    );
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
      energy += calculateStatisticSumGrowth(data?.stats?.[statId]) || 0;
      compareEnergy +=
        calculateStatisticSumGrowth(data?.statsCompare?.[statId]) || 0;

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

  const getEnergySourcesByType = (prefs) =>
    (prefs?.energy_sources || []).reduce((acc, source) => {
      if (!acc[source.type]) acc[source.type] = [];
      acc[source.type].push(source);
      return acc;
    }, {});

  const collectRelevantEntities = (prefs) => {
    const entities = new Set();
    FOSSIL_FUEL_PERCENTAGE_ENTITY_CANDIDATES.forEach((entityId) =>
      entities.add(entityId)
    );
    (prefs?.energy_sources || []).forEach((source) => {
      if (source.stat_rate) entities.add(source.stat_rate);
      if (source.stat_soc) entities.add(source.stat_soc);
      if (source.power_config) {
        [
          source.power_config.stat_rate,
          source.power_config.stat_rate_inverted,
          source.power_config.stat_rate_from,
          source.power_config.stat_rate_to,
        ]
          .filter(Boolean)
          .forEach((entityId) => entities.add(entityId));
      }
    });
    return entities;
  };

  const computeTotalFlowRate = (sourceType, prefs, states) => {
    const types = getEnergySourcesByType(prefs);
    const sources = types[sourceType] || [];
    let targetUnit;
    let total = 0;

    sources.forEach((source) => {
      if (!source.stat_rate) return;
      const stateObj = states[source.stat_rate];
      const rawValue = getFlowRateFromState(stateObj);
      const unit = stateObj?.attributes?.unit_of_measurement;
      if (rawValue === undefined || !unit) return;

      const safeValue = Math.max(0, rawValue);
      if (!targetUnit) {
        targetUnit = unit;
        total += safeValue;
        return;
      }
      if (unit === targetUnit) {
        total += safeValue;
        return;
      }
      const sourceFactor = FLOW_RATE_TO_LMIN[unit];
      const targetFactor = FLOW_RATE_TO_LMIN[targetUnit];
      if (sourceFactor !== undefined && targetFactor !== undefined) {
        total += (safeValue * sourceFactor) / targetFactor;
        return;
      }
      total += safeValue;
    });

    return {
      value: Math.max(0, total),
      unit: targetUnit || (sourceType === "gas" ? "m³/h" : "m³/h"),
    };
  };

  const computeLiveMetrics = (hass, prefs) => {
    if (!hass || !prefs) return null;
    const states = hass.states || {};
    const types = getEnergySourcesByType(prefs);

    let solar = 0;
    (types.solar || []).forEach((source) => {
      if (!source.stat_rate) return;
      const value = getPowerFromState(states[source.stat_rate]);
      if (value > 0) solar += value;
    });

    let fromGrid = 0;
    let toGrid = 0;
    (types.grid || []).forEach((source) => {
      if (source.power_config) {
        const fromValue = getConfiguredPower(
          states,
          source.power_config.stat_rate_from
        );
        const toValue = getConfiguredPower(
          states,
          source.power_config.stat_rate_to
        );
        const invertedValue = getConfiguredPower(
          states,
          source.power_config.stat_rate_inverted
        );
        let usedDedicatedGridPower = false;
        if (fromValue > 0) fromGrid += fromValue;
        if (toValue > 0) toGrid += toValue;
        if (fromValue !== undefined || toValue !== undefined) {
          usedDedicatedGridPower = true;
        }
        if (!usedDedicatedGridPower && invertedValue > 0) {
          toGrid += invertedValue;
          usedDedicatedGridPower = true;
        } else if (!usedDedicatedGridPower && invertedValue < 0) {
          fromGrid += Math.abs(invertedValue);
          usedDedicatedGridPower = true;
        }
        if (usedDedicatedGridPower) return;
      }
      if (!source.stat_rate) return;
      const value = getPowerFromState(states[source.stat_rate]);
      if (value > 0) fromGrid += value;
      else if (value < 0) toGrid += Math.abs(value);
    });

    let netBattery = 0;
    let batterySoc = null;
    (types.battery || []).forEach((source) => {
      if (source.stat_rate) {
        netBattery += getPowerFromState(states[source.stat_rate]) || 0;
      }
      if (source.stat_soc && batterySoc === null) {
        const socValue = Number.parseFloat(states[source.stat_soc]?.state);
        if (!Number.isNaN(socValue)) batterySoc = socValue;
      }
    });

    const fromBattery = netBattery > 0 ? netBattery : 0;
    const toBattery = netBattery < 0 ? Math.abs(netBattery) : 0;
    const home = Math.max(0, fromGrid + solar + fromBattery - toGrid - toBattery);
    const pvUsedLocally = Math.max(0, solar - toGrid - toBattery);
    const fossilFuelPercentage = getFossilFuelPercentage(states);
    const nonFossilGrid =
      fossilFuelPercentage === undefined
        ? 0
        : fromGrid * Math.max(0, 1 - fossilFuelPercentage / 100);
    const gas = computeTotalFlowRate("gas", prefs, states);
    const water = computeTotalFlowRate("water", prefs, states);
    const lowCarbon = Math.min(
      home,
      Math.max(
        0,
        fossilFuelPercentage === undefined
          ? pvUsedLocally
          : pvUsedLocally + nonFossilGrid
      )
    );

    return {
      solar,
      fromGrid,
      toGrid,
      fromBattery,
      toBattery,
      batterySoc,
      home,
      gas,
      water,
      lowCarbon,
      fossilFuelPercentage,
    };
  };

  const ensureLiveValueSpan = (circle, beforeNode) => {
    let valueEl = circle.querySelector(".ha-energy-native-live-value");
    if (!valueEl) {
      valueEl = document.createElement("span");
      valueEl.className = "ha-energy-native-live-value";
      valueEl.style.display = "block";
      valueEl.style.whiteSpace = "nowrap";
      if (beforeNode) circle.insertBefore(valueEl, beforeNode);
      else circle.appendChild(valueEl);
    }
    return valueEl;
  };

  const setSimpleCircleValue = (container, text) => {
    if (!container) return;
    const circle = container.querySelector(".circle");
    if (!circle) return;
    const icon = circle.querySelector("ha-svg-icon, a.circle > ha-svg-icon");
    const overlay = circle.querySelector("svg");

    Array.from(circle.childNodes).forEach((node) => {
      if (
        node === icon ||
        node === overlay ||
        (node.nodeType === 1 &&
          node.classList?.contains("ha-energy-native-live-value"))
      ) {
        return;
      }
      node.remove();
    });

    const valueEl = ensureLiveValueSpan(circle, overlay || null);
    valueEl.textContent = text;
  };

  const setContainerVisible = (container, visible) => {
    if (!container) return;
    container.style.display = visible ? "" : "none";
  };

  const setGridCircleValues = (container, returnedText, importedText) => {
    if (!container) return;
    const circle = container.querySelector(".circle");
    if (!circle) return;
    let returnSpan = circle.querySelector(".return");
    let consumptionSpan = circle.querySelector(".consumption");
    if (!returnSpan) {
      returnSpan = document.createElement("span");
      returnSpan.className = "return";
      circle.appendChild(returnSpan);
    }
    if (!consumptionSpan) {
      consumptionSpan = document.createElement("span");
      consumptionSpan.className = "consumption";
      circle.appendChild(consumptionSpan);
    }
    returnSpan.textContent = returnedText;
    returnSpan.style.display = "";
    consumptionSpan.textContent = importedText;
  };

  const patchCardStateUpdates = (Ctor) => {
    if (!Ctor || Ctor.prototype.__haEnergyNativeLiveStatePatched) return;

    const originalShouldUpdate = Ctor.prototype.shouldUpdate;
    Ctor.prototype.shouldUpdate = function (changedProps) {
      const originalResult = originalShouldUpdate
        ? originalShouldUpdate.call(this, changedProps)
        : true;

      if (originalResult || !isNowCloneRoute() || !changedProps?.has?.("hass")) {
        return originalResult;
      }

      const oldHass = changedProps.get("hass");
      if (!oldHass || !this.hass || !this._data?.prefs) return originalResult;

      const entities = collectRelevantEntities(this._data.prefs);
      for (const entityId of entities) {
        if (oldHass.states?.[entityId] !== this.hass.states?.[entityId]) {
          return true;
        }
      }
      return originalResult;
    };

    Ctor.prototype.__haEnergyNativeLiveStatePatched = true;
  };

  const patchEnergyDistributionCard = () => {
    const tag = "hui-energy-distribution-card";
    const Ctor = customElements.get(tag);
    if (!Ctor || Ctor.prototype.__haEnergyNativeLivePatched) return;

    patchCardStateUpdates(Ctor);

    const originalUpdated = Ctor.prototype.updated;
    Ctor.prototype.updated = function (...args) {
      originalUpdated?.apply(this, args);
      if (!isNowCloneRoute() || !this._data?.prefs || !this.hass) return;

      const live = computeLiveMetrics(this.hass, this._data.prefs);
      const root = this.renderRoot;
      if (!live || !root) return;

      const firstTopCircle = root.querySelector(
        ".row:first-child .circle-container:first-child"
      );
      const showLowCarbon =
        live.fossilFuelPercentage !== undefined && live.lowCarbon > 0;
      setContainerVisible(firstTopCircle, showLowCarbon);
      if (showLowCarbon) {
        setSimpleCircleValue(firstTopCircle, formatPower(live.lowCarbon));
      }
      setSimpleCircleValue(
        root.querySelector(".circle-container.solar"),
        formatPower(live.solar)
      );
      setSimpleCircleValue(
        root.querySelector(".circle-container.gas"),
        `${formatNumber(live.gas.value, 1)} ${live.gas.unit}`
      );
      setSimpleCircleValue(
        root.querySelector(".circle-container.water:not(.bottom)"),
        `${formatNumber(live.water.value, 1)} ${live.water.unit}`
      );
      setSimpleCircleValue(
        root.querySelector(".circle-container.water.bottom"),
        `${formatNumber(live.water.value, 1)} ${live.water.unit}`
      );
      setSimpleCircleValue(
        root.querySelector(".circle-container.home"),
        formatPower(live.home)
      );

      setGridCircleValues(
        root.querySelector(".circle-container.grid"),
        `${live.toGrid > 0 ? "\u2190 " : ""}${formatPower(live.toGrid || 0)}`,
        `${live.fromGrid > 0 ? "\u2192 " : ""}${formatPower(
          live.fromGrid || 0
        )}`
      );

      const batteryContainer = root.querySelector(".circle-container.battery");
      if (batteryContainer) {
        const inEl = batteryContainer.querySelector(".battery-in");
        const outEl = batteryContainer.querySelector(".battery-out");
        if (inEl) inEl.textContent = `↓ ${formatPower(live.toBattery)}`;
        if (outEl) outEl.textContent = `↑ ${formatPower(live.fromBattery)}`;
      }

      const lineSvg = root.querySelector(".lines svg");
      if (lineSvg) {
        lineSvg.querySelectorAll("circle.grid").forEach((el) => {
          el.style.display = live.fromGrid > 0 ? "" : "none";
        });
        lineSvg.querySelectorAll("circle.return").forEach((el) => {
          el.style.display = live.toGrid > 0 ? "" : "none";
        });
        lineSvg.querySelectorAll("circle.solar").forEach((el) => {
          el.style.display = live.solar > 0 ? "" : "none";
        });
        lineSvg
          .querySelectorAll("circle.non-fossil, circle.low-carbon, circle.co2")
          .forEach((el) => {
            el.style.display = showLowCarbon ? "" : "none";
          });
        lineSvg.querySelectorAll("circle.gas").forEach((el) => {
          el.style.display = live.gas.value > 0 ? "" : "none";
        });
        lineSvg.querySelectorAll("circle.water").forEach((el) => {
          el.style.display = live.water.value > 0 ? "" : "none";
        });
      }
    };

    Ctor.prototype.__haEnergyNativeLivePatched = true;
  };

  const patchSourcesTableCard = () => {
    const tag = "hui-energy-sources-table-card";
    const Card = customElements.get(tag);
    if (!Card || Card.prototype.__haEnergyClonePatched) return;

    const originalUpdated = Card.prototype.updated;
    Card.prototype.updated = function (...args) {
      originalUpdated?.apply(this, args);
      try {
        if (!window.__haEnergyCloneSettingsPromise && this.hass) {
          getCloneSettings(this.hass).then(() => this.requestUpdate?.());
        }
        if (!isCloneContext(this) || !this._data || !anyBalconyEnabled(this._data)) {
          return;
        }

        const root = this.renderRoot || this.shadowRoot;
        if (!root) return;

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

        if (!row) return;

        const totals = getGridImportTotals(this._data);
        const compare = !!this._data?.statsCompare;
        const numericCells = [
          ...row.querySelectorAll("td.mdc-data-table__cell--numeric"),
        ];
        const showCosts = numericCells.length === (compare ? 4 : 2);

        row.querySelector("th").textContent = t(this.hass, "grossGridLabel");

        if (compare && showCosts) {
          numericCells[0].textContent = `${adminFormatNumber(
            this.hass,
            totals.compareEnergy
          )} kWh`;
          numericCells[1].textContent = totals.hasCost
            ? formatCurrency(this.hass, totals.compareCost)
            : "";
          numericCells[2].textContent = `${adminFormatNumber(
            this.hass,
            totals.energy
          )} kWh`;
          numericCells[3].textContent = totals.hasCost
            ? formatCurrency(this.hass, totals.cost)
            : "";
        } else if (compare) {
          numericCells[0].textContent = `${adminFormatNumber(
            this.hass,
            totals.compareEnergy
          )} kWh`;
          numericCells[1].textContent = `${adminFormatNumber(
            this.hass,
            totals.energy
          )} kWh`;
        } else if (showCosts) {
          numericCells[0].textContent = `${adminFormatNumber(
            this.hass,
            totals.energy
          )} kWh`;
          numericCells[1].textContent = totals.hasCost
            ? formatCurrency(this.hass, totals.cost)
            : "";
        } else if (numericCells[0]) {
          numericCells[0].textContent = `${adminFormatNumber(
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
    if (!Card || Card.prototype.__haEnergyClonePatched) return;

    const originalUpdated = Card.prototype.updated;
    Card.prototype.updated = function (...args) {
      originalUpdated?.apply(this, args);
      try {
        if (!window.__haEnergyCloneSettingsPromise && this.hass) {
          getCloneSettings(this.hass).then(() => this.requestUpdate?.());
        }
        if (!isCloneContext(this) || !this._data || !anyBalconyEnabled(this._data)) {
          return;
        }

        const root = this.renderRoot || this.shadowRoot;
        if (!root) return;

        const gauge = root.querySelector("ha-gauge");
        const name = root.querySelector(".name");
        if (!gauge || !name) return;

        const totals = getGridImportTotals(this._data);
        gauge.value = totals.energy > 0 ? -1 : 0;
        gauge.valueText = adminFormatNumber(this.hass, totals.energy);
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
    if (!root) return;

    const footer = root.querySelector("ha-dialog-footer");
    if (!footer?.parentElement) return;

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
    if (!Dialog || Dialog.prototype.__haEnergyClonePatched) return;

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
      originalUpdated?.apply(this, args);
      injectBalconyCheckbox(this);
    };

    const originalSave = Dialog.prototype._save;
    Dialog.prototype._save = async function (...args) {
      const previousStat = this._params?.source?.stat_energy_from || null;
      const currentStat = this._source?.stat_energy_from;
      const enabled = !!this.__haEnergyCloneBalconyMode;

      await originalSave.apply(this, args);

      if (!this.hass || !currentStat) return;

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

  const buildNowReplacementView = (views) => {
    const nowView = views.find((view) => view.path === NOW_VIEW_PATH);
    const electricityView = views.find(
      (view) => view.path === ELECTRICITY_VIEW_PATH
    );
    if (!electricityView || !nowView) return null;

    const hasWaterFlowSankey = (nowView.sections || []).some((section) =>
      (section.cards || []).some((card) => card?.type === "water-flow-sankey")
    );

    const distributionCard = {
      title: "Energieverteilung",
      type: "energy-distribution",
      collection_key: ENERGY_COLLECTION_KEY,
    };
    const compactLayout = useCompactNowLayout();

    const nowReplacementView = deepClone(electricityView);
    nowReplacementView.path = NOW_VIEW_PATH;
    nowReplacementView.title = NOW_REPLACEMENT_TITLE;
    nowReplacementView.type = "sections";
    nowReplacementView.max_columns = 4;
    nowReplacementView.dense_section_placement = true;
    nowReplacementView.badges = deepClone(nowView.badges || []);
    nowReplacementView.footer = undefined;
    nowReplacementView.sections = [
      ...(compactLayout
        ? [
            {
              type: "grid",
              column_span: 1,
              cards: [distributionCard],
            },
          ]
        : []),
      {
        type: "grid",
        column_span: compactLayout ? 1 : 3,
        cards: [
          {
            title: NOW_PRIMARY_CARD_TITLE,
            type: "power-sources-graph",
            collection_key: POWER_COLLECTION_KEY,
            grid_options: { columns: 36 },
          },
          {
            title: "Aktueller Leistungsfluss",
            type: "power-sankey",
            collection_key: POWER_COLLECTION_KEY,
            grid_options: { columns: 36 },
          },
          {
            title: "Wasserfluss",
            type: "water-flow-sankey",
            collection_key: POWER_COLLECTION_KEY,
            grid_options: { columns: 36 },
          },
        ].filter((card) =>
          card.type === "water-flow-sankey" ? hasWaterFlowSankey : true
        ),
      },
    ];
    if (!compactLayout) {
      nowReplacementView.sidebar = {
        sections: [{ cards: [distributionCard] }],
        content_label: NOW_PRIMARY_CARD_TITLE,
        sidebar_label: "Energieverteilung",
      };
    } else {
      delete nowReplacementView.sidebar;
    }
    delete nowReplacementView.strategy;
    delete nowReplacementView.cards;

    return nowReplacementView;
  };

  const applyNowReplacementToPanel = (panel) => {
    if (!isClonePanel(panel.panel) || !panel._lovelace?.config?.views) return;

    if (!panel.__haEnergyNativeOriginalViews) {
      panel.__haEnergyNativeOriginalViews = deepClone(
        panel._lovelace.config.views
      );
    }

    const sourceViews = deepClone(panel.__haEnergyNativeOriginalViews).filter(
      (view) => view.path !== "test-clone"
    );
    const nowReplacementView = buildNowReplacementView(sourceViews);
    if (!nowReplacementView) return;

    const newViews = sourceViews.map((view) =>
      view.path === NOW_VIEW_PATH ? nowReplacementView : view
    );

    panel._lovelace = {
      ...panel._lovelace,
      config: {
        ...panel._lovelace.config,
        views: newViews,
      },
      rawConfig: {
        ...panel._lovelace.rawConfig,
        views: newViews,
      },
    };
    panel.__haEnergyNativeAppliedLayout = useCompactNowLayout()
      ? "compact"
      : "wide";
  };

  const patchPanelEnergy = () => {
    const tag = "ha-panel-energy";
    const Panel = customElements.get(tag);
    if (!Panel || Panel.prototype.__haEnergyNativeNowPatched) return;

    const originalSetLovelace = Panel.prototype._setLovelace;
    Panel.prototype._setLovelace = async function (...args) {
      await originalSetLovelace.apply(this, args);

      try {
        if (!isClonePanel(this.panel) || !this._lovelace?.config?.views) return;
        this.__haEnergyNativeOriginalViews = deepClone(
          this._lovelace.config.views
        );
        applyNowReplacementToPanel(this);
      } catch (err) {
        console.warn("HA Energy Native: failed to build Jetzt replacement", err);
      }
    };

    const originalConnectedCallback = Panel.prototype.connectedCallback;
    Panel.prototype.connectedCallback = function (...args) {
      originalConnectedCallback?.apply(this, args);
      if (this.__haEnergyNativeResizeHandler) return;
      this.__haEnergyNativeResizeHandler = () => {
        if (!isClonePanel(this.panel) || !this._lovelace?.config?.views) return;
        const nextLayout = useCompactNowLayout() ? "compact" : "wide";
        if (this.__haEnergyNativeAppliedLayout === nextLayout) return;
        try {
          applyNowReplacementToPanel(this);
          this.requestUpdate?.();
        } catch (err) {
          console.warn("HA Energy Native: failed to rebuild Jetzt layout", err);
        }
      };
      this.__haEnergyNativeMediaQuery =
        window.matchMedia?.(NOW_LAYOUT_MEDIA_QUERY) || null;
      this.__haEnergyNativeMediaHandler = () =>
        this.__haEnergyNativeResizeHandler?.();
      window.addEventListener("resize", this.__haEnergyNativeResizeHandler, {
        passive: true,
      });
      window.addEventListener(
        "orientationchange",
        this.__haEnergyNativeResizeHandler,
        { passive: true }
      );
      window.addEventListener("pageshow", this.__haEnergyNativeResizeHandler, {
        passive: true,
      });
      document.addEventListener(
        "visibilitychange",
        this.__haEnergyNativeResizeHandler,
        { passive: true }
      );
      this.__haEnergyNativeMediaQuery?.addEventListener?.(
        "change",
        this.__haEnergyNativeMediaHandler
      );
      this.__haEnergyNativeMediaQuery?.addListener?.(
        this.__haEnergyNativeMediaHandler
      );
    };

    const originalDisconnectedCallback = Panel.prototype.disconnectedCallback;
    Panel.prototype.disconnectedCallback = function (...args) {
      if (this.__haEnergyNativeResizeHandler) {
        window.removeEventListener("resize", this.__haEnergyNativeResizeHandler);
        window.removeEventListener(
          "orientationchange",
          this.__haEnergyNativeResizeHandler
        );
        window.removeEventListener(
          "pageshow",
          this.__haEnergyNativeResizeHandler
        );
        document.removeEventListener(
          "visibilitychange",
          this.__haEnergyNativeResizeHandler
        );
        this.__haEnergyNativeMediaQuery?.removeEventListener?.(
          "change",
          this.__haEnergyNativeMediaHandler
        );
        this.__haEnergyNativeMediaQuery?.removeListener?.(
          this.__haEnergyNativeMediaHandler
        );
        this.__haEnergyNativeMediaQuery = undefined;
        this.__haEnergyNativeMediaHandler = undefined;
        this.__haEnergyNativeResizeHandler = undefined;
      }
      return originalDisconnectedCallback?.apply(this, args);
    };

    const originalNavigateConfig = Panel.prototype._navigateConfig;
    Panel.prototype._navigateConfig = function (...args) {
      return originalNavigateConfig?.apply(this, args);
    };

    Panel.prototype.__haEnergyNativeNowPatched = true;
  };

  const patchEverything = () => {
    try {
      patchPanelEnergy();
      patchEnergyDistributionCard();
      patchSourcesTableCard();
      patchGridGaugeCard();
      patchSolarDialog();
    } catch (err) {
      console.warn("HA Energy Native: patch cycle failed", err);
    }
  };

  [
    "ha-panel-energy",
    "hui-energy-distribution-card",
    "hui-energy-sources-table-card",
    "hui-energy-grid-neutrality-gauge-card",
    "dialog-energy-solar-settings",
  ].forEach((tag) => {
    customElements.whenDefined(tag).then(() => patchEverything());
  });
})();
