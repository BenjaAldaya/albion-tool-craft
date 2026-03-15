/**
 * Clase para gestionar sesiones de crafteo (guardar y cargar)
 */
class SessionManager {
    constructor() {
        this.storageKey = 'albionCraftingSessions';
    }

    /**
     * Guarda una sesión de crafteo
     * @param {Object} analysisData - Datos del análisis completo
     * @param {string} sessionName - Nombre opcional de la sesión
     * @returns {Object} - Sesión guardada
     */
    saveSession(analysisData, sessionName = null) {
        const session = {
            id: Date.now(),
            name: sessionName || `Sesión ${new Date().toLocaleString('es-ES')}`,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('es-ES'),
            time: new Date().toLocaleTimeString('es-ES'),
            data: analysisData
        };

        // Obtener sesiones existentes
        const sessions = this.getAllSessions();

        // Agregar nueva sesión
        sessions.push(session);

        // Guardar en localStorage
        this._saveToStorage(sessions);

        return session;
    }

    /**
     * Obtiene todas las sesiones guardadas
     * @returns {Array<Object>}
     */
    getAllSessions() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al cargar sesiones:', error);
            return [];
        }
    }

    /**
     * Obtiene una sesión específica por ID
     * @param {number} sessionId
     * @returns {Object|null}
     */
    getSession(sessionId) {
        const sessions = this.getAllSessions();
        return sessions.find(s => s.id === sessionId) || null;
    }

    /**
     * Elimina una sesión por ID
     * @param {number} sessionId
     * @returns {boolean}
     */
    deleteSession(sessionId) {
        const sessions = this.getAllSessions();
        const filteredSessions = sessions.filter(s => s.id !== sessionId);

        if (filteredSessions.length === sessions.length) {
            return false; // No se encontró la sesión
        }

        this._saveToStorage(filteredSessions);
        return true;
    }

    /**
     * Elimina todas las sesiones
     */
    clearAllSessions() {
        localStorage.removeItem(this.storageKey);
    }

    /**
     * Exporta todas las sesiones a un archivo JSON
     * @param {string} filename - Nombre del archivo (opcional)
     */
    exportToJSON(filename = null) {
        const sessions = this.getAllSessions();
        const defaultFilename = `albion_sessions_${new Date().toISOString().split('T')[0]}.json`;
        const finalFilename = filename || defaultFilename;

        this._downloadJSON(sessions, finalFilename);
    }

    /**
     * Exporta una sesión específica
     * @param {number} sessionId
     * @param {string} filename
     */
    exportSession(sessionId, filename = null) {
        const session = this.getSession(sessionId);

        if (!session) {
            throw new Error('Sesión no encontrada');
        }

        const defaultFilename = `albion_session_${sessionId}.json`;
        const finalFilename = filename || defaultFilename;

        this._downloadJSON(session, finalFilename);
    }

    /**
     * Importa sesiones desde un archivo JSON
     * @param {File} file - Archivo JSON
     * @returns {Promise<number>} - Número de sesiones importadas
     */
    async importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    const sessions = this.getAllSessions();

                    // Si es un array, importar todas las sesiones
                    if (Array.isArray(importedData)) {
                        sessions.push(...importedData);
                    } else {
                        // Si es una sola sesión
                        sessions.push(importedData);
                    }

                    this._saveToStorage(sessions);
                    resolve(Array.isArray(importedData) ? importedData.length : 1);
                } catch (error) {
                    reject(new Error('Error al parsear el archivo JSON'));
                }
            };

            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    }

    /**
     * Obtiene estadísticas de todas las sesiones
     * @returns {Object}
     */
    getStatistics() {
        const sessions = this.getAllSessions();

        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                totalProfit: 0,
                averageProfit: 0,
                profitableSessions: 0,
                unprofitableSessions: 0
            };
        }

        let totalProfit = 0;
        let profitableSessions = 0;
        let unprofitableSessions = 0;

        sessions.forEach(session => {
            const profit = session.data.profit.finalProfit;
            totalProfit += profit;

            if (profit > 0) {
                profitableSessions++;
            } else {
                unprofitableSessions++;
            }
        });

        return {
            totalSessions: sessions.length,
            totalProfit,
            averageProfit: totalProfit / sessions.length,
            profitableSessions,
            unprofitableSessions,
            profitablePercentage: (profitableSessions / sessions.length) * 100
        };
    }

    /**
     * Obtiene las sesiones más rentables
     * @param {number} limit - Número de sesiones a retornar
     * @returns {Array<Object>}
     */
    getTopProfitableSessions(limit = 10) {
        const sessions = this.getAllSessions();

        return sessions
            .sort((a, b) => b.data.profit.finalProfit - a.data.profit.finalProfit)
            .slice(0, limit);
    }

    /**
     * Filtra sesiones por item
     * @param {string} itemName - Nombre del item
     * @returns {Array<Object>}
     */
    filterByItem(itemName) {
        const sessions = this.getAllSessions();
        return sessions.filter(s => s.data.item.name.includes(itemName));
    }

    /**
     * Filtra sesiones por tier
     * @param {number} tier
     * @returns {Array<Object>}
     */
    filterByTier(tier) {
        const sessions = this.getAllSessions();
        return sessions.filter(s => s.data.item.tier === tier);
    }

    /**
     * Filtra sesiones por rango de fechas
     * @param {Date} startDate
     * @param {Date} endDate
     * @returns {Array<Object>}
     */
    filterByDateRange(startDate, endDate) {
        const sessions = this.getAllSessions();

        return sessions.filter(s => {
            const sessionDate = new Date(s.timestamp);
            return sessionDate >= startDate && sessionDate <= endDate;
        });
    }

    /**
     * Guarda datos en localStorage
     * @param {Array} sessions
     * @private
     */
    _saveToStorage(sessions) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(sessions));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            throw new Error('No se pudo guardar la sesión. El almacenamiento puede estar lleno.');
        }
    }

    /**
     * Descarga datos como archivo JSON
     * @param {Object|Array} data
     * @param {string} filename
     * @private
     */
    _downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}
