// Funzione factory principale per creare un'istanza di SunburstVisualization
function createSunburstVisualization(config) {
  // Configurazione di default
  const defaultConfig = {
    rootName: "Distretto Biologico",
    containerId: "chart",
    legendId: "legend",
    dataSource: "intercomunale.csv",
    hierarchyLevels: ["comune", "DescColtiv", "specie", "varieta"],
    colorMappings: {
      root: "#f2c993",
      levelColors: {
        comune: "#f4d4aa",
        DescColtiv: "#ff7f0e",
        specie: "#2ca02c",
        varieta: "#f7e0c0",
      },
      // Colonne da cui prendere i valori di colore
      attributeMappings: {
        DescColtiv: "col_BioSAU",
        specie: "col_specie",
      },
    },
    tooltipConfig: {
      // Mappatura dei nomi per la visualizzazione nel tooltip
      friendlyNames: {
        DescColtiv: "Coltivazione",
        root: "Provincia",
      },
    },
    // Colonna da cui prendere il valore
    valueAttribute: "area",
    // Colonna che contiene il numero dei beneficiari o proprietari (opzionale)
    beneficiariAttribute: "Beneficiar",
    // Fattore di conversione per l'area (da m² a ha)
    areaConversionFactor: 0.0001,
    // Opzioni di formattazione dei numeri
    formatting: {
      percentage: {
        locale: "it-IT",
        minimumFractionDigits: 1,
        maximumFractionDigits: 4,
      },
      area: {
        locale: "it-IT",
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
      },
    },
    // Colonna che contiene il numero delle aziende (opzionale)
    aziendaAttribute: null,
  };

  // Unisci la configurazione fornita con i default
  const mergedConfig = { ...defaultConfig, ...config };
  // Gestione della fusione profonda per oggetti annidati
  if (config.colorMappings) {
    mergedConfig.colorMappings = {
      ...defaultConfig.colorMappings,
      ...config.colorMappings,
    };

    if (config.colorMappings.levelColors) {
      mergedConfig.colorMappings.levelColors = {
        ...defaultConfig.colorMappings.levelColors,
        ...config.colorMappings.levelColors,
      };
    }

    if (config.colorMappings.attributeMappings) {
      mergedConfig.colorMappings.attributeMappings = {
        ...defaultConfig.colorMappings.attributeMappings,
        ...config.colorMappings.attributeMappings,
      };
    }
  }

  if (config.tooltipConfig) {
    mergedConfig.tooltipConfig = {
      ...defaultConfig.tooltipConfig,
      ...config.tooltipConfig,
    };

    if (config.tooltipConfig.friendlyNames) {
      mergedConfig.tooltipConfig.friendlyNames = {
        ...defaultConfig.tooltipConfig.friendlyNames,
        ...config.tooltipConfig.friendlyNames,
      };
    }
  }

  if (config.formatting) {
    mergedConfig.formatting = {
      ...defaultConfig.formatting,
      ...config.formatting,
    };

    if (config.formatting.percentage) {
      mergedConfig.formatting.percentage = {
        ...defaultConfig.formatting.percentage,
        ...config.formatting.percentage,
      };
    }

    if (config.formatting.area) {
      mergedConfig.formatting.area = {
        ...defaultConfig.formatting.area,
        ...config.formatting.area,
      };
    }
  }

  // Riferimenti agli elementi DOM
  const chartContainer = document.getElementById(mergedConfig.containerId);
  const legendContainer = document.getElementById(mergedConfig.legendId);

  // Variabile per tenere traccia del grafico corrente
  let chart;

  // FUNZIONE: Costruisci la gerarchia assegnando valori SOLO ai nodi foglia
  function buildHierarchy(csvData) {
    const root = {
      name:
        mergedConfig.rootName ||
        mergedConfig.dataSource.split("/").pop().split(".")[0],
      children: [],
      level: "root",
      depth: 0,
      stats: {}, // Inizializza stats per il nodo root
      uniqueBeneficiari: new Set(), // Inizializza il Set per i beneficiari univoci
    };

    csvData.forEach((row) => {
      // Estrai i livelli gerarchici
      const levels = mergedConfig.hierarchyLevels
        .map((level) => row[level])
        .filter((d) => d && d.trim() !== "");

      // Estrai i colori
      const colors = {};
      Object.entries(mergedConfig.colorMappings.attributeMappings).forEach(
        ([level, attr]) => {
          if (row[attr]) colors[level] = row[attr];
        },
      );

      // Estrai il valore
      const value = row[mergedConfig.valueAttribute]
        ? parseFloat(row[mergedConfig.valueAttribute])
        : 1;

      // Estrai il beneficiario (se configurato)
      const beneficiario = mergedConfig.beneficiariAttribute
        ? row[mergedConfig.beneficiariAttribute]
        : null;

      // Costruisci il percorso nella gerarchia
      let currentNode = root;
      levels.forEach((name, i) => {
        // Livello corrente
        const levelName = mergedConfig.hierarchyLevels[i];

        // Cerca o crea il nodo figlio
        let childNode = (currentNode.children || []).find(
          (d) => d.name === name,
        );

        if (!childNode) {
          // Crea un nuovo nodo
          childNode = {
            name: name,
            level: levelName,
            depth: i + 1,
            stats: {}, // Inizializza stats per il nodo
            uniqueBeneficiari: new Set(), // Inizializza il Set per i beneficiari univoci
          };

          // Assegna il colore se disponibile
          if (colors[levelName]) {
            childNode.color = colors[levelName];
          }

          // IMPORTANTE: Assegna valore SOLO ai nodi foglia
          if (i === levels.length - 1) {
            childNode.value = value;
            childNode.isLeaf = true;

            // Aggiungi il beneficiario al Set
            if (beneficiario) {
              childNode.uniqueBeneficiari.add(beneficiario);
            }
          } else {
            // Nodi interni hanno solo figli, nessun valore
            childNode.children = [];
            childNode.isLeaf = false;
          }

          // Aggiungi ai figli del nodo corrente
          if (!currentNode.children) currentNode.children = [];
          currentNode.children.push(childNode);
        } else if (i === levels.length - 1) {
          // Se il nodo foglia esiste già, somma il valore
          childNode.value = (childNode.value || 0) + value;
          childNode.isLeaf = true;

          // Aggiungi il beneficiario al Set
          if (beneficiario) {
            childNode.uniqueBeneficiari.add(beneficiario);
          }
        }

        // Avanza al livello successivo
        currentNode = childNode;
      });
    });

    return root;
  }

  // FUNZIONE: Calcola statistiche senza modificare i valori originali
  function calculateStats(root) {
    // Calcola i valori aggregati senza modificare i valori originali
    function calculateAggregates(node) {
      if (!node) return 0;

      // Inizializza le statistiche se non esistono
      if (!node.stats) node.stats = {};

      // Se ha figli, somma i loro valori aggregati
      if (node.children && node.children.length > 0) {
        let sum = 0;
        const uniqueBeneficiariSet = new Set(); // Set per i beneficiari univoci

        node.children.forEach((child) => {
          sum += calculateAggregates(child);

          // Unisci i beneficiari univoci dei figli
          if (child.uniqueBeneficiari) {
            child.uniqueBeneficiari.forEach((b) => uniqueBeneficiariSet.add(b));
          }
        });

        // Salva il valore aggregato SOLO nelle statistiche
        node.stats.aggregateValue = sum;

        // Salva i beneficiari univoci
        node.uniqueBeneficiari = uniqueBeneficiariSet;

        return sum;
      }

      // Per i nodi foglia, usa il valore originale
      node.stats.aggregateValue = node.value || 0;

      // I beneficiari univoci sono già stati calcolati in buildHierarchy
      return node.value || 0;
    }

    // Calcola percentuali rispetto agli antenati
    function calculatePercentages(node, ancestors = []) {
      if (!node) return;

      // Assicurati che le statistiche esistano
      if (!node.stats) node.stats = {};

      // Calcola l'area in ettari
      node.stats.areaHa =
        (node.value || node.stats.aggregateValue || 0) *
        mergedConfig.areaConversionFactor;

      // Calcola il numero di beneficiari univoci
      node.stats.numBeneficiari = node.uniqueBeneficiari
        ? node.uniqueBeneficiari.size
        : 0;

      // Inizializza l'oggetto delle percentuali
      if (!node.stats.percentages) {
        node.stats.percentages = {};
      }

      // Memorizza i riferimenti agli antenati
      if (!node.ancestors) {
        node.ancestors = {};
      }
      ancestors.forEach((ancestor) => {
        node.ancestors[ancestor.level] = ancestor;
      });

      // Calcola percentuali rispetto a ciascun antenato
      ancestors.forEach((ancestor) => {
        const ancestorValue = ancestor.stats
          ? ancestor.stats.aggregateValue
          : 0;
        if (ancestorValue > 0) {
          node.stats.percentages[ancestor.level] =
            ((node.value || node.stats.aggregateValue) / ancestorValue) * 100;
        }
      });

      // Calcola ricorsivamente per i figli
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          calculatePercentages(child, [node, ...ancestors]);
        });
      }
    }

    // Prima calcola i valori aggregati (bottom-up)
    calculateAggregates(root);

    // Poi calcola le percentuali (top-down)
    calculatePercentages(root, []);

    return root;
  }

  // FUNZIONE: Formatta l'etichetta di un nodo
  function formatLabel(node) {
    if (node.depth === 0) return node.name;

    // Se non ci sono statistiche, mostra solo il nome
    if (!node.stats || !node.ancestors) return node.name;

    // Cerca il genitore diretto
    const parentLevel = Object.keys(node.ancestors)[0];

    if (parentLevel && node.stats.percentages[parentLevel] !== undefined) {
      const percent = node.stats.percentages[parentLevel].toLocaleString(
        mergedConfig.formatting.percentage.locale,
        {
          minimumFractionDigits:
            mergedConfig.formatting.percentage.minimumFractionDigits,
          maximumFractionDigits:
            mergedConfig.formatting.percentage.maximumFractionDigits,
        },
      );
      return `${node.name} (${percent}%)`;
    }

    return node.name;
  }

  // FUNZIONE: Determina il colore di un nodo
  function getNodeColor(node) {
    if (node.color) return node.color;

    if (node.level === "root") return mergedConfig.colorMappings.root;
    if (mergedConfig.colorMappings.levelColors[node.level]) {
      return mergedConfig.colorMappings.levelColors[node.level];
    }

    return "#cccccc"; // Colore predefinito se non specificato
  }

  // FUNZIONE: Crea il tooltip HTML
  function createTooltip(node) {
    if (node.depth === 0) return "";

    // Se non ci sono statistiche, mostra info minimali
    if (!node.stats) {
      return `<div class="sunburst-tooltip">
                          <div class="sunburst-tooltip-title">${node.name}</div>
                      </div>`;
    }

    // Formatta l'area in ettari
    const formattedAreaHa = node.stats.areaHa.toLocaleString(
      mergedConfig.formatting.area.locale,
      {
        minimumFractionDigits:
          mergedConfig.formatting.area.minimumFractionDigits,
        maximumFractionDigits:
          mergedConfig.formatting.area.maximumFractionDigits,
      },
    );

    // Tooltip completo
    return `
      <div class="sunburst-tooltip">
        <div class="sunburst-tooltip-title">${node.name}</div>
        <div class="sunburst-tooltip-value">Area: ${formattedAreaHa} ha</div>
        <div class="sunburst-tooltip-value">Beneficiari univoci: ${
          node.stats.numBeneficiari || 0
        }</div>
      </div>
    `;
  }

  // Funzione per aggiornare la legenda in base al nodo selezionato
  function updateLegend(node) {
    if (!legendContainer) return;

    legendContainer.innerHTML = "";

    const pageTitle = document.getElementById("title");
    pageTitle.innerHTML = "";

    // Titolo della Pagina
    pageTitle.className = "page-title";
    pageTitle.textContent = `${node.name}`;
    pageTitle.style.color = getNodeColor(node);

    // Titolo della legenda
    const title = document.createElement("div");
    title.className = "legend-title";
    title.textContent = `Legenda: ${node.name}`;
    legendContainer.appendChild(title);

    // Creiamo una tabella per la legenda
    const table = document.createElement("table");
    table.className = "legend-table";
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "10px";

    // Intestazione della tabella
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Colonne dell'intestazione
    const headers = [
      "Colore",
      "Nome",
      "Area (ha)",
      "Percentuale",
      "Beneficiari",
    ];

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      th.style.padding = "8px";
      th.style.borderBottom = "1px solid #ddd";
      th.style.backgroundColor = "#f2f2f2";
      th.style.textAlign = "left";
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corpo della tabella
    const tbody = document.createElement("tbody");

    // Funzione per creare una riga della tabella
    function createRow(node, isChild = false) {
      const row = document.createElement("tr");

      // Cella per il colore
      const colorCell = document.createElement("td");
      colorCell.style.padding = "8px";
      colorCell.style.borderBottom = "1px solid #ddd";

      const colorBox = document.createElement("div");
      colorBox.style.width = "20px";
      colorBox.style.height = "20px";
      colorBox.style.backgroundColor = getNodeColor(node);
      colorBox.style.border = "1px solid #000";
      colorBox.style.display = "inline-block";
      colorBox.style.printColorAdjust = "exact"; // Per supportare la stampa dei colori

      colorCell.appendChild(colorBox);
      row.appendChild(colorCell);

      // Cella per il nome
      const nameCell = document.createElement("td");
      nameCell.textContent = node.name;
      nameCell.style.fontWeight = isChild ? "normal" : "bold";
      nameCell.style.padding = "8px";
      nameCell.style.borderBottom = "1px solid #ddd";
      row.appendChild(nameCell);

      // Cella per l'area
      const areaCell = document.createElement("td");
      areaCell.style.padding = "8px";
      areaCell.style.borderBottom = "1px solid #ddd";
      if (node.stats) {
        areaCell.textContent = node.stats.areaHa.toLocaleString(
          mergedConfig.formatting.area.locale,
          {
            minimumFractionDigits:
              mergedConfig.formatting.area.minimumFractionDigits,
            maximumFractionDigits:
              mergedConfig.formatting.area.maximumFractionDigits,
          },
        );
      } else {
        areaCell.textContent = "-";
      }
      row.appendChild(areaCell);

      // Cella per la percentuale
      const percentCell = document.createElement("td");
      percentCell.style.padding = "8px";
      percentCell.style.borderBottom = "1px solid #ddd";
      if (
        node.stats &&
        node.ancestors &&
        Object.keys(node.ancestors).length > 0
      ) {
        const parentLevel = Object.keys(node.ancestors)[0];
        if (node.stats.percentages && node.stats.percentages[parentLevel]) {
          percentCell.textContent =
            node.stats.percentages[parentLevel].toLocaleString(
              mergedConfig.formatting.percentage.locale,
              {
                minimumFractionDigits:
                  mergedConfig.formatting.percentage.minimumFractionDigits,
                maximumFractionDigits:
                  mergedConfig.formatting.percentage.maximumFractionDigits,
              },
            ) + "%";
        } else {
          percentCell.textContent = "100%";
        }
      } else {
        percentCell.textContent = "100%";
      }
      row.appendChild(percentCell);

      // Cella per i beneficiari univoci
      const beneficiariCell = document.createElement("td");
      beneficiariCell.style.padding = "8px";
      beneficiariCell.style.borderBottom = "1px solid #ddd";
      beneficiariCell.textContent = node.stats.numBeneficiari || "0";
      row.appendChild(beneficiariCell);

      return row;
    }

    // Aggiungi la riga per il nodo corrente
    tbody.appendChild(createRow(node));

    // Aggiungi i figli se esistono
    if (node.children && node.children.length > 0) {
      // Intestazione per la sezione dei figli
      const dividerRow = document.createElement("tr");
      const dividerCell = document.createElement("td");
      dividerCell.colSpan = headers.length;
      dividerCell.textContent = "Elementi contenuti:";
      dividerCell.style.fontWeight = "bold";
      dividerCell.style.padding = "8px";
      dividerCell.style.backgroundColor = "#f9f9f9";
      dividerRow.appendChild(dividerCell);
      tbody.appendChild(dividerRow);

      // Ordina i figli per valore decrescente
      const sortedChildren = [...node.children].sort((a, b) => {
        const valueA = a.value || (a.stats && a.stats.aggregateValue) || 0;
        const valueB = b.value || (b.stats && b.stats.aggregateValue) || 0;
        return valueB - valueA;
      });

      // Aggiungi una riga per ogni figlio
      sortedChildren.forEach((child) => {
        tbody.appendChild(createRow(child, true));
      });
    }

    table.appendChild(tbody);
    legendContainer.appendChild(table);
  }

  // Inizializza il grafico
  function initialize() {
    d3.csv(mergedConfig.dataSource).then((data) => {
      // 1. Costruisci la gerarchia
      const hierarchicalData = buildHierarchy(data);

      // 2. Calcola le statistiche
      calculateStats(hierarchicalData);

      // Debug: Verifica i dati elaborati
      console.log("Dati elaborati:", hierarchicalData);

      // 3. Crea il sunburst chart
      chart = Sunburst()
        .data(hierarchicalData)
        .width(chartContainer.clientWidth)
        .height(chartContainer.clientHeight)
        .label((node) => formatLabel(node))
        .size("value") // Usa i valori originali per la visualizzazione
        .color((node) => getNodeColor(node))
        .tooltipContent((node) => createTooltip(node))
        .showLabels(true)(chartContainer)
        .onClick((node) => {
          chart.focusOnNode(node);
          updateLegend(node);
        });

      // Inizializza la legenda con il nodo root
      updateLegend(hierarchicalData);
    });
  }

  // API pubblica
  return {
    initialize,
    getConfig: () => mergedConfig,
    updateConfig: (newConfig) => {
      // Aggiorna la configurazione
      Object.assign(mergedConfig, newConfig);
      // Reinizializza il grafico con la nuova configurazione
      if (chartContainer) {
        chartContainer.innerHTML = "";
        if (legendContainer) legendContainer.innerHTML = "";
        initialize();
      }
    },
  };
}

// const sunburst = createSunburstVisualization({
//   containerId: "chart",
//   dataSource: "intercomunale.csv",
//   hierarchyLevels: ["DescColtiv", "comune"],
// });
// sunburst.initialize();

const sunburst = createSunburstVisualization({
  containerId: "chart",
  dataSource: "./data/intercomunale.csv",
  hierarchyLevels: ["comune", "DescColtiv", "specie", "varieta"],
});
sunburst.initialize();

// const sunburst = createSunburstVisualization({
//   containerId: "chart",
//   dataSource: "intercomunale.csv",
//   hierarchyLevels: ["specie", "varieta"],
// });
// sunburst.initialize();
