
/**
 * Service untuk komunikasi dengan Google Sheets via Google Apps Script
 */

export const googleSheetsService = {
  /**
   * Mengambil semua data dari Spreadsheet
   */
  fetchAllData: async (webAppUrl: string) => {
    try {
      const response = await fetch(`${webAppUrl}?action=readAll`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      return null;
    }
  },

  /**
   * Menyimpan atau menghapus data di Spreadsheet
   */
  postData: async (webAppUrl: string, action: string, data: any) => {
    try {
      // Kita kirim sebagai text/plain agar Apps Script tidak menolak karena CORS Preflight
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data }),
      });
      return true;
    } catch (error) {
      console.error('Cloud Action Error:', error);
      throw error;
    }
  }
};
