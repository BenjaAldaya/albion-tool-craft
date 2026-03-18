# Albion Online - Calculadora de Profit de Crafteo

Herramienta web para calcular la rentabilidad de craftear armas, herramientas y armaduras en **Albion Online**. Consulta precios en tiempo real a través de la API pública del juego y calcula el profit neto considerando materiales, impuestos, tasa de retorno y journals de fama.

## Características

- **Cálculo de profit** para armas (T4–T8, encantamientos 0–4) y herramientas de recolección
- **Precios en tiempo real** via [Albion Online Data Project API](https://www.albion-online-data.com/)
- **Soporte para armas con artefactos** (Keeper, Morgana, Undead, Hell)
- **Gestión de journals de fama**: calcula cuántos journals se llenan y el ingreso adicional
- **Tasa de retorno de recursos** configurable (por defecto 48% para ciudad con bonus)
- **Impuesto de ciudad** configurable por item
- **Múltiples ciudades**: Caerleon, Bridgewatch, Fort Sterling, Lymhurst, Martlock, Thetford
- Interfaz oscura con temática de Albion Online

## Uso
Descarga el repositorio y abre `index.html` directamente en el navegador.

```
index.html   ← Abrir este archivo
```

### Pasos básicos

1. Abre `index.html` en tu navegador
2. Selecciona la **ciudad** donde comprarás materiales y venderás el item
3. Elige el **tipo de item** (arma o herramienta), **tier** y **encantamiento**
4. Ajusta la **tasa de retorno** según tu foco/bonus de ciudad
5. Ingresa el **impuesto** por utilizar el puesto de trabajo (en plata)
6. Configura la **cantidad** a craftear
7. (Opcional) Activa los **journals** e ingresa sus precios
8. Haz clic en **"Calcular Profit"** para consultar los precios y ver el resultado

### Resultado

La calculadora muestra:
- Costo total de materiales
- Precio de venta del item
- Profit bruto y neto (descontando impuestos y journals si aplica)
- Cantidad de journals generados y su ingreso

## Estructura del proyecto

```
├── index.html                    # Interfaz principal
└── js/
    ├── config.js                 # Recetas de armas/herramientas y constantes
    ├── item_api_names_completo.js# IDs de items para la API
    ├── Item.js                   # Clase base para items crafteables
    ├── Weapon.js                 # Clase para armas (extiende Item)
    ├── Tool.js                   # Clase para herramientas (extiende Item)
    ├── Material.js               # Clase para materiales de crafteo
    ├── AlbionAPI.js              # Cliente para la API de precios
    ├── CraftingCalculator.js     # Lógica de cálculo de profit
    ├── JournalManager.js         # Gestión de journals de fama
    ├── SessionManager.js         # Gestión de sesión/estado de la UI
    └── UIManager.js              # Controlador de la interfaz
```

## API utilizada

Los precios se obtienen de la API pública **Albion Online Data Project**:

```
https://www.albion-online-data.com/api/v2/stats/prices
```

Esta API es mantenida por la comunidad y requiere que los jugadores tengan instalado el [client de captura de datos](https://github.com/broderickhyman/albiondata-client).

## Tasa de retorno

| Situación | Tasa recomendada |
|---|---|
| Sin foco, sin bonus de ciudad | 15% |
| Con foco | ~36% |
| Con foco + bonus de ciudad | ~48% (por defecto) |

## Requisitos

- Navegador moderno con soporte para ES6+ (Chrome, Firefox, Edge)
- Conexión a internet (para consultar precios en tiempo real)

## Notas

- Los precios de la API pueden tener un retraso de varios minutos
- Los precios mostrados son del **mercado de ventas** (sell order)
- El cálculo asume crafteo en una estación con el bonus de ciudad correspondiente
