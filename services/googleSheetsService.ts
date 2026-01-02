
/**
 * Service untuk komunikasi dengan Google Sheets via Google Apps Script
 */

export const googleSheetsService = {
  /**
   * Mengambil semua data dari Spreadsheet
   */
  fetchAllData: async (webAppUrl: string) => {
    try {
      console.log('Attempting to fetch from:', webAppUrl);
      const response = await fetch(`${webAppUrl}?action=readAll`);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Data received from cloud:', data);
      
      if (!data || typeof data !== 'object') {
        console.warn('Received invalid data format from Apps Script');
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('CRITICAL: Error fetching from Google Sheets:', error);
      return null;
    }
  },

  /**
   * Menyimpan transaksi atau perubahan data ke Spreadsheet
   * Menggunakan text/plain agar Apps Script dapat menerima JSON tanpa Preflight CORS
   */
  postData: async (webAppUrl: string, action: string, data: any) => {
    try {
      console.log(`Cloud Action: [${action}]`, data);
      
      // Mengirimkan sebagai text/plain adalah praktik standar untuk Apps Script
      // agar terhindar dari error CORS saat mengirimkan body JSON
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, data }),
      });
      
      return true;
    } catch (error) {
      console.error('Error posting to Google Sheets:', error);
      throw error;
    }
  }
};
