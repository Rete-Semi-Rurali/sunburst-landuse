## Come utilizzare la versione generalizzata

Ecco come utilizzare questo script generalizzato per creare diverse istanze del grafico Sunburst:

```js
// Esempio 1: Configurazione di base (simile alla versione originale)
const sunburst1 = createSunburstVisualization({
  containerId: "chart1",
  legendId: "legend1",
  dataSource: "pcg_intercomunale_v2.csv"
});

// Inizializza il grafico
sunburst1.initialize();

// Esempio 2: Configurazione con gerarchia e parametri diversi
const sunburst2 = createSunburstVisualization({
  containerId: "chart2",
  legendId: "legend2",
  dataSource: "altro_dataset.csv",
  hierarchyLevels: ["provincia", "categoria", "tipo", "prodotto"],
  colorMappings: {
    root: "#3366cc",
    levelColors: {
      "provincia": "#6699cc",
      "categoria": "#99cc33",
      "tipo": "#cc9933",
      "prodotto": "#cc6633"
    },
    attributeMappings: {
      "categoria": "colore_categoria",
      "tipo": "colore_tipo"
    }
  },
  valueAttribute: "superficie",
  aziendaAttribute: "numero_aziende",
  tooltipConfig: {
    friendlyNames: {
      "provincia": "Provincia",
      "categoria": "Categoria",
      "tipo": "Tipologia",
      "prodotto": "Prodotto",
      "root": "Regione"
    }
  }
});

sunburst2.initialize();

// Esempio 3: Aggiornamento della configurazione di un'istanza esistente
setTimeout(() => {
  sunburst1.updateConfig({
    hierarchyLevels: ["comune", "specie", "varieta"],
    colorMappings: {
      root: "#990000"
    }
  });
}, 5000); // Aggiorna dopo 5 secondi
```

## Vantaggi della versione generalizzata

1. **Configurabile**: La soluzione permette di personalizzare completamente i parametri del grafico.
2. **Multiple istanze**: Puoi creare più visualizzazioni sulla stessa pagina con configurazioni diverse.
3. **Aggiornabile**: Ogni istanza può essere aggiornata dinamicamente con nuove configurazioni.
4. **Organizzato**: Il codice è ben strutturato con separazione delle responsabilità.
5. **Robusto**: Vengono forniti valori predefiniti per ogni parametro, garantendo la retrocompatibilità.

Questa soluzione offre la flessibilità necessaria per adattarsi a diversi dataset e gerarchie mantenendo la stessa logica di visualizzazione.
