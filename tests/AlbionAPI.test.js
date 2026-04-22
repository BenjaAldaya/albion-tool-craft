/**
 * Tests para AlbionAPI — cubre los cambios implementados:
 *  - _fetchWithRetry: retry automático ante fallos
 *  - _deduped: deduplicación de requests en vuelo
 *  - fetchPrices: integración dedup + retry + procesamiento
 *  - fetchAllCityPrices: caché de sesión + dedup + retry + filtros
 */

// ─── Globals necesarios antes de require ────────────────────────────────────

global.AlbionConfig = {
    API_URLS: {
        AMERICAS: 'https://americas.test',
        EUROPE:   'https://europe.test',
        ASIA:     'https://asia.test',
    },
    CITIES: {
        CAERLEON:     'Caerleon',
        BRIDGEWATCH:  'Bridgewatch',
        FORT_STERLING:'Fort Sterling',
        LYMHURST:     'Lymhurst',
        MARTLOCK:     'Martlock',
        THETFORD:     'Thetford',
        BLACK_MARKET: 'Black Market',
    },
};

global.localStorage = (() => {
    let store = {};
    return {
        getItem:    (k) => store[k] ?? null,
        setItem:    (k, v) => { store[k] = String(v); },
        removeItem: (k) => { delete store[k]; },
        clear:      () => { store = {}; },
    };
})();

const AlbionAPI = require('../js/AlbionAPI.js');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Crea un mock de Response válido */
function mockOkResponse(data) {
    return { ok: true, json: () => Promise.resolve(data) };
}

/** Crea un mock de Response con error HTTP */
function mockErrorResponse(status) {
    return { ok: false, status };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('AlbionAPI', () => {
    let api;

    beforeEach(() => {
        localStorage.clear();
        global.fetch = jest.fn();
        api = new AlbionAPI();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    // ── _fetchWithRetry ──────────────────────────────────────────────────────

    describe('_fetchWithRetry', () => {
        it('devuelve los datos JSON en el primer intento exitoso', async () => {
            const data = [{ item_id: 'T4_PICKAXE' }];
            global.fetch.mockResolvedValueOnce(mockOkResponse(data));

            const result = await api._fetchWithRetry('https://americas.test/T4_PICKAXE');

            expect(result).toEqual(data);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('reintenta tras un error de red y devuelve el resultado del segundo intento', async () => {
            jest.useFakeTimers();
            const data = [{ item_id: 'T4_PICKAXE' }];
            global.fetch
                .mockRejectedValueOnce(new Error('network error'))
                .mockResolvedValueOnce(mockOkResponse(data));

            const promise = api._fetchWithRetry('https://americas.test/T4_PICKAXE');
            await jest.runAllTimersAsync();
            const result = await promise;

            expect(result).toEqual(data);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('reintenta tras un error HTTP (response.ok = false)', async () => {
            jest.useFakeTimers();
            const data = [{ item_id: 'T4_PICKAXE' }];
            global.fetch
                .mockResolvedValueOnce(mockErrorResponse(503))
                .mockResolvedValueOnce(mockOkResponse(data));

            const promise = api._fetchWithRetry('https://americas.test/T4_PICKAXE');
            await jest.runAllTimersAsync();
            const result = await promise;

            expect(result).toEqual(data);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('lanza error si ambos intentos fallan', async () => {
            jest.useFakeTimers();
            global.fetch
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'));

            const promise = api._fetchWithRetry('https://americas.test/T4_PICKAXE');
            // Adjuntar el handler ANTES de correr timers para evitar unhandled rejection
            const assertion = expect(promise).rejects.toThrow('fail 2');
            await jest.runAllTimersAsync();
            await assertion;

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('usa un delay de 1 segundo entre intentos', async () => {
            jest.useFakeTimers();
            const spy = jest.spyOn(global, 'setTimeout');
            global.fetch
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValueOnce(mockOkResponse([]));

            const promise = api._fetchWithRetry('https://americas.test/T4_PICKAXE');
            await jest.runAllTimersAsync();
            await promise;

            const delays = spy.mock.calls.map(c => c[1]);
            expect(delays).toContain(1000);
        });
    });

    // ── _deduped ─────────────────────────────────────────────────────────────

    describe('_deduped', () => {
        it('ejecuta el fetcher al llamar con una clave nueva', async () => {
            const fetcher = jest.fn().mockResolvedValue('datos');
            await api._deduped('clave-1', fetcher);
            expect(fetcher).toHaveBeenCalledTimes(1);
        });

        it('devuelve la misma promesa para llamadas concurrentes con igual clave', () => {
            const fetcher = jest.fn().mockResolvedValue('datos');
            const p1 = api._deduped('clave-1', fetcher);
            const p2 = api._deduped('clave-1', fetcher);
            expect(p1).toBe(p2);
            expect(fetcher).toHaveBeenCalledTimes(1);
        });

        it('claves distintas producen promesas distintas', () => {
            const fetcher = jest.fn().mockResolvedValue('datos');
            const p1 = api._deduped('clave-1', fetcher);
            const p2 = api._deduped('clave-2', fetcher);
            expect(p1).not.toBe(p2);
            expect(fetcher).toHaveBeenCalledTimes(2);
        });

        it('elimina la clave del mapa _inFlight tras la resolución', async () => {
            const fetcher = jest.fn().mockResolvedValue('datos');
            await api._deduped('clave-1', fetcher);
            expect(api._inFlight.has('clave-1')).toBe(false);
        });

        it('elimina la clave del mapa _inFlight tras el rechazo', async () => {
            const fetcher = jest.fn().mockRejectedValue(new Error('fallo'));
            await expect(api._deduped('clave-1', fetcher)).rejects.toThrow('fallo');
            expect(api._inFlight.has('clave-1')).toBe(false);
        });

        it('permite una segunda llamada con la misma clave tras resolverse la primera', async () => {
            const fetcher = jest.fn().mockResolvedValue('datos');
            await api._deduped('clave-1', fetcher);
            await api._deduped('clave-1', fetcher);
            expect(fetcher).toHaveBeenCalledTimes(2);
        });
    });

    // ── _processPriceData ────────────────────────────────────────────────────

    describe('_processPriceData', () => {
        it('usa sell_price_min para ciudades normales', () => {
            const data = [{
                item_id: 'T4_PICKAXE', city: 'Caerleon', quality: 1,
                sell_price_min: 5000, sell_price_max: 6000,
                buy_price_min: 4000, buy_price_max: 4500,
                sell_price_min_date: '2024-01-01', buy_price_max_date: null,
            }];
            const result = api._processPriceData(data);
            expect(result['T4_PICKAXE'].sellPriceMin).toBe(5000);
            expect(result['T4_PICKAXE'].isBlackMarket).toBe(false);
        });

        it('usa buy_price_max para Black Market', () => {
            const data = [{
                item_id: 'T4_PICKAXE', city: 'Black Market', quality: 1,
                sell_price_min: 0, sell_price_max: 0,
                buy_price_min: 0, buy_price_max: 7000,
                sell_price_min_date: null, buy_price_max_date: '2024-01-01',
            }];
            const result = api._processPriceData(data);
            expect(result['T4_PICKAXE'].sellPriceMin).toBe(7000);
            expect(result['T4_PICKAXE'].isBlackMarket).toBe(true);
        });

        it('sobreescribe un precio cero con uno mayor del mismo item', () => {
            const data = [
                {
                    item_id: 'T4_PICKAXE', city: 'Lymhurst', quality: 1,
                    sell_price_min: 0, sell_price_max: 0,
                    buy_price_min: 0, buy_price_max: 0,
                    sell_price_min_date: null, buy_price_max_date: null,
                },
                {
                    item_id: 'T4_PICKAXE', city: 'Caerleon', quality: 1,
                    sell_price_min: 5000, sell_price_max: 6000,
                    buy_price_min: 4000, buy_price_max: 4500,
                    sell_price_min_date: '2024-01-01', buy_price_max_date: null,
                },
            ];
            const result = api._processPriceData(data);
            expect(result['T4_PICKAXE'].sellPriceMin).toBe(5000);
        });

        it('devuelve objeto vacío para datos vacíos', () => {
            expect(api._processPriceData([])).toEqual({});
        });

        it('incluye lastUpdate con la fecha correcta según tipo de ciudad', () => {
            const bmData = [{
                item_id: 'T4_PICKAXE', city: 'Black Market', quality: 1,
                sell_price_min: 0, sell_price_max: 0,
                buy_price_min: 0, buy_price_max: 7000,
                sell_price_min_date: null, buy_price_max_date: '2024-06-01',
            }];
            const result = api._processPriceData(bmData);
            expect(result['T4_PICKAXE'].lastUpdate).toBe('2024-06-01');
        });
    });

    // ── fetchPrices ──────────────────────────────────────────────────────────

    describe('fetchPrices', () => {
        const apiData = [{
            item_id: 'T4_PICKAXE', city: 'Caerleon', quality: 1,
            sell_price_min: 5000, sell_price_max: 6000,
            buy_price_min: 4000, buy_price_max: 4500,
            sell_price_min_date: '2024-01-01', buy_price_max_date: null,
        }];

        it('construye la URL correctamente y procesa los datos', async () => {
            global.fetch.mockResolvedValueOnce(mockOkResponse(apiData));

            const result = await api.fetchPrices(['T4_PICKAXE'], 'Caerleon', 1);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://americas.test/T4_PICKAXE?locations=Caerleon&qualities=1'
            );
            expect(result['T4_PICKAXE'].sellPriceMin).toBe(5000);
        });

        it('omite el parámetro qualities cuando quality es null', async () => {
            global.fetch.mockResolvedValueOnce(mockOkResponse(apiData));

            await api.fetchPrices(['T4_PICKAXE'], 'Caerleon', null);

            const url = global.fetch.mock.calls[0][0];
            expect(url).not.toContain('qualities');
        });

        it('llama a fetch solo una vez para llamadas concurrentes idénticas', async () => {
            let resolveFirst;
            const pending = new Promise(r => { resolveFirst = r; });
            global.fetch.mockReturnValueOnce(pending.then(() => mockOkResponse(apiData)));

            const p1 = api.fetchPrices(['T4_PICKAXE'], 'Caerleon', 1);
            const p2 = api.fetchPrices(['T4_PICKAXE'], 'Caerleon', 1);

            resolveFirst();
            await Promise.all([p1, p2]);

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('permite una segunda llamada tras completarse la primera', async () => {
            global.fetch
                .mockResolvedValueOnce(mockOkResponse(apiData))
                .mockResolvedValueOnce(mockOkResponse(apiData));

            await api.fetchPrices(['T4_PICKAXE'], 'Caerleon', 1);
            await api.fetchPrices(['T4_PICKAXE'], 'Caerleon', 1);

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('propaga el error cuando la API falla', async () => {
            jest.useFakeTimers();
            global.fetch.mockRejectedValue(new Error('API caída'));

            const promise = api.fetchPrices(['T4_PICKAXE'], 'Caerleon', 1);
            // Adjuntar el handler ANTES de correr timers para evitar unhandled rejection
            const assertion = expect(promise).rejects.toThrow('API caída');
            await jest.runAllTimersAsync();
            await assertion;
        });
    });

    // ── fetchAllCityPrices ───────────────────────────────────────────────────

    describe('fetchAllCityPrices', () => {
        const rawData = [
            {
                item_id: 'T4_PICKAXE', city: 'Caerleon', quality: 1,
                sell_price_min: 5000, sell_price_max: 0,
                buy_price_min: 0, buy_price_max: 0,
            },
            {
                item_id: 'T4_PICKAXE', city: 'Bridgewatch', quality: 1,
                sell_price_min: 8000, sell_price_max: 0,
                buy_price_min: 0, buy_price_max: 0,
            },
            {
                item_id: 'T4_PICKAXE', city: 'Black Market', quality: 1,
                sell_price_min: 0, sell_price_max: 0,
                buy_price_min: 0, buy_price_max: 12000,
            },
        ];

        it('devuelve ciudades ordenadas por precio descendente', async () => {
            global.fetch.mockResolvedValueOnce(mockOkResponse(rawData));

            const result = await api.fetchAllCityPrices('T4_PICKAXE', 1);

            expect(result[0].price).toBe(12000);
            expect(result[1].price).toBe(8000);
            expect(result[2].price).toBe(5000);
        });

        it('marca Black Market con isBlackMarket = true', async () => {
            global.fetch.mockResolvedValueOnce(mockOkResponse(rawData));

            const result = await api.fetchAllCityPrices('T4_PICKAXE', 1);
            const bm = result.find(r => r.city === 'Black Market');

            expect(bm.isBlackMarket).toBe(true);
            expect(bm.price).toBe(12000);
        });

        it('filtra items con calidad incorrecta', async () => {
            const mixedQuality = [
                ...rawData,
                {
                    item_id: 'T4_PICKAXE', city: 'Martlock', quality: 2,
                    sell_price_min: 99999, sell_price_max: 0,
                    buy_price_min: 0, buy_price_max: 0,
                },
            ];
            global.fetch.mockResolvedValueOnce(mockOkResponse(mixedQuality));

            const result = await api.fetchAllCityPrices('T4_PICKAXE', 1);

            expect(result.every(r => r.price !== 99999)).toBe(true);
        });

        it('filtra ciudades con precio cero', async () => {
            const withZero = [
                ...rawData,
                {
                    item_id: 'T4_PICKAXE', city: 'Lymhurst', quality: 1,
                    sell_price_min: 0, sell_price_max: 0,
                    buy_price_min: 0, buy_price_max: 0,
                },
            ];
            global.fetch.mockResolvedValueOnce(mockOkResponse(withZero));

            const result = await api.fetchAllCityPrices('T4_PICKAXE', 1);

            expect(result.find(r => r.city === 'Lymhurst')).toBeUndefined();
        });

        it('guarda el resultado en caché', async () => {
            global.fetch.mockResolvedValueOnce(mockOkResponse(rawData));

            await api.fetchAllCityPrices('T4_PICKAXE', 1);

            expect(api._cityPriceCache.has('T4_PICKAXE|1')).toBe(true);
        });

        it('devuelve el caché sin llamar a fetch en la segunda consulta dentro del TTL', async () => {
            global.fetch.mockResolvedValueOnce(mockOkResponse(rawData));

            await api.fetchAllCityPrices('T4_PICKAXE', 1);
            await api.fetchAllCityPrices('T4_PICKAXE', 1);

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('vuelve a llamar a fetch después de que expira el TTL', async () => {
            global.fetch
                .mockResolvedValueOnce(mockOkResponse(rawData))
                .mockResolvedValueOnce(mockOkResponse(rawData));

            await api.fetchAllCityPrices('T4_PICKAXE', 1);

            // Simular que el caché venció
            const entry = api._cityPriceCache.get('T4_PICKAXE|1');
            entry.ts = Date.now() - api._CITY_CACHE_TTL - 1;

            await api.fetchAllCityPrices('T4_PICKAXE', 1);

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('el caché es independiente por calidad', async () => {
            global.fetch
                .mockResolvedValueOnce(mockOkResponse(rawData))
                .mockResolvedValueOnce(mockOkResponse(rawData));

            await api.fetchAllCityPrices('T4_PICKAXE', 1);
            await api.fetchAllCityPrices('T4_PICKAXE', 2);

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('deduplicaa llamadas concurrentes al mismo item', async () => {
            let resolveFirst;
            const pending = new Promise(r => { resolveFirst = r; });
            global.fetch.mockReturnValueOnce(pending.then(() => mockOkResponse(rawData)));

            const p1 = api.fetchAllCityPrices('T4_PICKAXE', 1);
            const p2 = api.fetchAllCityPrices('T4_PICKAXE', 1);

            resolveFirst();
            await Promise.all([p1, p2]);

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });
});
