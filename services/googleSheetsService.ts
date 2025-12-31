
/**
 * Service untuk komunikasi dengan Google Sheets via Google Apps Script
 */

export const googleSheetsService = {
  /**
   * Mengambil semua data dari Spreadsheet
   * @param webAppUrl URL dari hasil "Deploy as Web App" di Google Apps Script
   */
  fetchAllData: async (webAppUrl: string) => {
    try {
      const response = await fetch(`${webAppUrl}?action=readAll`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      throw error;
    }
  },

  /**
   * Menyimpan transaksi atau perubahan data ke Spreadsheet
   * @param webAppUrl URL dari Web App
   * @param payload Data yang ingin disimpan
   */
  postData: async (webAppUrl: string, action: string, data: any) => {
    try {
      // Google Apps Script seringkali membutuhkan redirect, fetch menangani ini
      const response = await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk Apps Script karena isu CORS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });
      // Karena no-cors, kita tidak bisa membaca response body, 
      // tapi data biasanya tetap masuk jika setup benar.
      return true;
    } catch (error) {
      console.error('Error posting to Google Sheets:', error);
      throw error;
    }
  }
};
